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

    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
            body: { chatId }, 
        }),
    })

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (input.trim()) {
            sendMessage({ text: input })
            setInput('')
        }
    }

    const isLoading = status === 'submitted' || status === 'streaming'

    return (
        <div className='relative h-full flex flex-col overflow-hidden'>
            {/* Header */}
            <div className='sticky top-0 inset-x-0 p-4 bg-white border-b'>
                <h3 className='text-xl font-bold'>Chat</h3>
            </div>

            {/* Message List */}
            <div className='flex-1 overflow-y-auto'>
                <MessageList messages={messages} />

                {/* Thinking indicator: only show while waiting for the first chunk to arrive */}
                {status === 'submitted' && (
                    <div className="px-4 py-2 flex items-center gap-2 text-gray-400 italic">
                        <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        </span>
                        Thinking...
                    </div>
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={onSubmit} className="p-4 bg-white border-t sticky bottom-0">
                <Input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Ask a question about this PDF..."
                    disabled={isLoading}
                />
            </form>
        </div>
    )
}

export default ChatComponent