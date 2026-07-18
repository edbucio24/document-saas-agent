import React from 'react'
import {auth} from "@clerk/nextjs/server"
import { redirect } from 'next/navigation'
import {db} from "@/lib/db"
import { chats } from '@/lib/db/schema'
import {eq} from "drizzle-orm"
import ChatSideBar from '@/components/ui/ChatSideBar'
import PDFViewer from '@/components/ui/PDFViewer'
import ChatComponent from '@/components/ui/ChatComponent'

type Props = {
    params: Promise<{
        chat_id:string
    }>
}

const ChatPage = async ({params}: Props) =>{
    const {chat_id} = await params;

    const {userId} = await auth()

    


    if(!userId){
        return redirect('/sign-in')
    }
    const _chats = await db.select().from(chats).where(eq(chats.clerkId,userId))

    // ADD THESE LOGS:
    console.log("Looking for ID:", parseInt(chat_id));
    console.log("Available chat IDs:", _chats.map(c => c.id));

    if(!_chats){
        return redirect('/')
    }

    if(!_chats.find(chat=>chat.id ===parseInt(chat_id))){
        return redirect('/')
    }

    const currentChat = _chats.find(chat=>chat.id=== parseInt(chat_id))

    return(
        <div className='flex max-h-screen overflow-scroll'>
            <div className='flex w-full max-h-screen overflow-scroll'>
                {/*chat sidebar*/}
                <div className=' flex-[1] max-w-xs'>
                    <ChatSideBar chats = {_chats} chatId={parseInt(chat_id)}/>
                </div>

                {/*pdf viwer */}
                <div className='max-h-screen p-5 overflow-scroll flex-[5]'>
                    <PDFViewer pdf_url={currentChat?.pdfUrl || ''}/>
                </div>

                {/*chat component*/}
                <div className='flex-[3] border-l-5 border-l-slate-200'>
                    <ChatComponent chatId={parseInt(chat_id)}/>
                </div>
            </div>
        </div>
    )
}

export default ChatPage