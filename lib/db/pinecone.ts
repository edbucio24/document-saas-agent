import {Pinecone} from '@pinecone-database/pinecone'
import { downloadFromS3 } from './s3-server';

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
    

}