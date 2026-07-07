import { Pinecone } from '@pinecone-database/pinecone';
import { downloadFromS3 } from './s3-server';
import * as fs from 'fs';
import pdfParse from 'pdf-parse-fork'; 
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { getEmbeddings } from './embeddings';
import md5 from 'md5';
import { convertToAscii } from '../utils';

let pinecone: Pinecone | null = null;

export type PineconeVector = {
    id: string;
    values: number[];
    metadata: {
        text: string;
        source: string;
        fileKey: string;
        pageNumber?: number; 
        [key: string]: any;
    };
}

export const getPineconeClient = async () => {
    if (!process.env.PINECONE_API_KEY) {
        throw new Error("CRITICAL: PINECONE_API_KEY is missing from environment variables.");
    }

    if (!pinecone) {
        pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
    }
    return pinecone;
};

// Helper utility to break arrays down into predictable chunk sizes
function chunkArray<T>(array: T[], size: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        batches.push(array.slice(i, i + size));
    }
    return batches;
}

export async function loadS3IntoPinecone(fileKey: string) {
    let file_name: string | null = null;
    try {
        // 1. Download & Parse
        file_name = await downloadFromS3(fileKey);
        if (!file_name) throw new Error("Could not download file from S3");
        
        const fileBuffer = fs.readFileSync(file_name);
        const parsedPdf = await pdfParse(fileBuffer);

        // 2. Wrap text into a LangChain Document
        const doc = new Document({
            pageContent: parsedPdf.text,
            metadata: { source: file_name, fileKey: fileKey }
        });

        // 3. Split into chunks
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const chunkedDocs = await textSplitter.splitDocuments([doc]);

        // 4. Create your embed function
        async function embedDocument(doc: Document, index: number) {
            const embeddings = await getEmbeddings(doc.pageContent);
            const hash = md5(doc.pageContent);
            
            return {
                id: hash,
                values: embeddings,
                metadata: {
                    text: doc.pageContent,
                    source: doc.metadata.source,
                    fileKey: doc.metadata.fileKey,
                    chunkIndex: index 
                }
            } as PineconeVector;
        }

        // 5. Generate embeddings safely in controlled batches of 10
        console.log(`Generating embeddings for ${chunkedDocs.length} chunks...`);
        const vectors: PineconeVector[] = [];
        const embeddingBatches = chunkArray(chunkedDocs, 10); 
        
        for (let i = 0; i < embeddingBatches.length; i++) {
            const batch = embeddingBatches[i];
            const batchVectors = await Promise.all(
                batch.map((chunk, j) => embedDocument(chunk, i * 10 + j))
            );
            vectors.push(...batchVectors);
        }
        
        const client = await getPineconeClient();
        const pineconeIndex = client.index(process.env.PINECONE_INDEX_NAME!);

        // 6. Upsert vectors to Pinecone in groups of 100 to stay safely under payload limits
        console.log(`Upserting ${vectors.length} vectors to Pinecone...`);
        const upsertBatches = chunkArray(vectors, 100);

        for (const batch of upsertBatches) {
            await pineconeIndex.upsert({
                records: batch,
                namespace: convertToAscii(fileKey)
            });
        }

        return vectors;
    } catch (error) {
        console.error('Pipeline error:', error);
        throw error;
    } finally {
        // Safe cleanup pattern guarantees files don't leak on your disk if a batch fails
        if (file_name && fs.existsSync(file_name)) {
            fs.unlinkSync(file_name);
        }
    }
}