'use client'
import { DrizzleChat } from '@/lib/db/schema'
import React from 'react'
import Link from 'next/link'
import {Button} from '@/components/ui/button'
import { LineStyle, MessageCircle, PlusCircle } from 'lucide-react'
import {cn} from '@/lib/utils'

type Props = {
    chats: DrizzleChat[],
    chatId:number
}

const ChatSideBar = ({chats,chatId}:Props) =>{
    return(
        <div className='relative w-full h-screen p-5 text-gray-200 bg-gray-900'>
            <Link href='/'>
                <Button className="w-full border-dashed border-white border">
                    <PlusCircle className='mr-2 w-5 h-5'/>
                    New Chat
                </Button>
            </Link>

            <div className='flex flex-col gap-2 mt-5'>
                {chats.map(chat => (
                    <Link key = {chat.id} href = {`/chat/${chat.id}`}>
                        <div className= {
                            cn('rounded-lg p-3 text-slate-300 flex items-center', {
                                'bg-blue-600 text-white':chat.id ===chatId,
                                'hover:text-white' : chat.id!== chatId
                            })
                        }>
                            <MessageCircle className='mr-2' />
                            <p className='w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis'>{chat.pdfName}</p>
                        </div>
                    </Link>
                ))}
            </div>

                <div className='absolute bottom-5 left-5'>
                    <div className='flex items-center gap-2 text-sm text-slate-500 flex-wrap'>
                        <Link href = '/'>Home</Link>
                        <Link href = '/'>Source</Link>
                    </div>
                </div>

        </div>
    )
}

export default ChatSideBar