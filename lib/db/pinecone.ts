import {Pinecone} from '@pinecone-database/pinecone'
import { downloadFromS3 } from './s3-server';
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf"
import { error } from 'console';

let pinecone:Pinecone |null = null

export const getPineconeClient = async()=>{
    if(!pinecone){
        pinecone = new Pinecone({
            apiKey:process.env.PINECONE_API_KEY!,
        });
    }
    return pinecone;
}

export async function loadS3IntoPiencone(fileKey:string){
    console.log('downloading s3 into file sysmtem');
    const file_name = await downloadFromS3(fileKey);
    if(!file_name){
        throw new Error('could not download')
    }
    const loader = new PDFLoader(file_name)
    const pages = loader.load()
    return pages;
}