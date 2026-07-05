import { Pinecone } from '@pinecone-database/pinecone';
import { downloadFromS3 } from './s3-server';
import * as fs from 'fs';
import pdfParse from 'pdf-parse-fork'; 
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
    // Fail early if the API key isn't being read by Next.js
    if (!process.env.PINECONE_API_KEY) {
        throw new Error("CRITICAL: PINECONE_API_KEY is missing from your environment variables! Check your .env file.");
    }

    if (!pinecone) {
        pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
    }
    return pinecone;
};

export async function loadS3IntoPiencone(fileKey: string) {
    // 1. Download file from S3
    console.log('downloading s3 into file sysmtem');
    const file_name = await downloadFromS3(fileKey);

    if (!file_name) {
        throw new Error("Could not download file from S3");
    }

    // 2. Read file and parse text cleanly without bundler crashes
    console.log('Parsing PDF content cleanly...');
    const fileBuffer = fs.readFileSync(file_name);
    const parsedPdf = await pdfParse(fileBuffer);
    
    console.log('Successfully extracted PDF text!');

    // 3. Wrap raw text inside a standard LangChain Document object
    const doc = new Document({
        pageContent: parsedPdf.text,
        metadata: {
            source: file_name,
            key: fileKey
        }
    });

    // 4. Split the text into smaller semantic chunks
    console.log('Splitting document into manageable chunks...');
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    
    const chunkedDocs = await textSplitter.splitDocuments([doc]);
    console.log(`Created ${chunkedDocs.length} chunks from the PDF.`);

    // Fail early if the Index Name isn't being read by Next.js
    if (!process.env.PINECONE_INDEX_NAME) {
        throw new Error("CRITICAL: PINECONE_INDEX_NAME is missing from your environment variables! Check your .env file.");
    }

    // 5. Initialize your Pinecone Client
    const client = await getPineconeClient();
    const pineconeIndex = client.index(process.env.PINECONE_INDEX_NAME);

    console.log('Pinecone client ready for upserting chunks...');
    
    // Your next step here will be passing `chunkedDocs` to your embedding model 
    // and upserting the vectors into `pineconeIndex`.

    return chunkedDocs;
}