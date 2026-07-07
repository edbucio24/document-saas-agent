import { loadS3IntoPinecone } from "@/lib/db/pinecone"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chats } from "@/lib/db/schema"
import { getS3Url } from "@/lib/db/s3"
import { auth } from '@clerk/nextjs/server'

// /api/create-chat
export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        const body = await req.json()
        const { file_key, file_name } = body
        console.log("Processing chat generation:", file_key, file_name)
        
        // 1. Process document chunking and vector embeddings
        await loadS3IntoPinecone(file_key)
        
        const s3Url = await getS3Url(file_key)
        
        // 2. Save document session tracking row to DB
        const insertedChats = await db.insert(chats).values({
            fileKey: file_key,
            pdfName: file_name,
            pdfUrl: s3Url,
            clerkId: userId,
        }).returning({
            insertedId: chats.id
        });
        
        // 3. Complete request by shipping generated ID back to client
        return NextResponse.json({
            chats_id: insertedChats[0].insertedId
        }, { status: 200 });
        
    } catch (error) {
        console.error("API Processing Failure:", error)
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        );
    }
}