import { loadS3IntoPinecone } from "@/lib/db/pinecone"
import { NextResponse } from "next/server"

// /api/create-chat
export async function POST(req:Request, res: Response){
    // Temporary test log
  console.log("--- ENV CHECK ---");
  console.log("All Keys:", Object.keys(process.env).filter(k => k.includes("PINECONE")));
  console.log("Key Value Exists?:", !!process.env.PINECONE_API_KEY);
  console.log("-----------------");
    try{
        const body = await req.json()
        const {file_key, file_name} = body
        console.log(file_key,file_name)
        const pages = await loadS3IntoPinecone(file_key)
        return NextResponse.json({pages})
    }catch(error){
        console.log(error)
        return NextResponse.json(
        {error:"internal server error"},
        {status: 500}
        );
    }
}