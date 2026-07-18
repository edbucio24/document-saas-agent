'use client'
import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { useChat } from '@ai-sdk/react' 
import { DefaultChatTransport } from 'ai'
import MessageList from './MessageList'

type Props = {
    chatId: number
}

const ChatComponent = ({ chatId }: Props) => {
    const [input, setInput] = useState('')

    // Configure the transport layer to include the chatId in every request
    const { messages, sendMessage } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
            body: { chatId }, 
        }),
    })

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (input.trim()) {
            // sendMessage now only needs the text
            sendMessage({ text: input })
            setInput('')
        }
    }

    return (
        <div className='relative h-full flex flex-col overflow-hidden'>
            {/* Header */}
            <div className='sticky top-0 inset-x-0 p-4 bg-white border-b'>
                <h3 className='text-xl font-bold'>Chat</h3>
            </div>

            {/* Message List */}
            <div className='flex-1 overflow-y-auto'>
                <MessageList messages={messages} />
            </div>

            {/* Input Form */}
            <form onSubmit={onSubmit} className="p-4 bg-white border-t sticky bottom-0">
                <Input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Ask a question about this PDF..."
                />
            </form>
        </div>
    )
}

export default ChatComponent