'use client'
import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { useChat } from '@ai-sdk/react' 
import { DefaultChatTransport } from 'ai'

type Props = {}

const ChatComponent = (props: Props) => {
    
    const [input, setInput] = useState('')

    // 2. useChat now only handles the messages array and the send action
    const { messages, sendMessage } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat', 
        }),
    })

    // 3. Custom form submission handler
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (input.trim()) {
            sendMessage({ text: input }) // Send it to the AI SDK
            setInput('') // Clear the text box
        }
    }

    return (
        
        <div className='relative h-full flex flex-col overflow-hidden'>
            
            {/* Header */}
            <div className='sticky top-0 inset-x-0 p-4 bg-white border-b'>
                <h3 className='text-xl font-bold'>Chat</h3>
            </div>

            {/* Message List */}
            <div className='flex-1 overflow-y-auto p-4'>
                {messages.map((message) => (
                    <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`p-3 rounded-lg inline-block ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}>
                            {/* Messages are now broken into 'parts' */}
                            {message.parts?.map((part, index) => (
                                part.type === 'text' ? <span key={index}>{part.text}</span> : null
                            ))}
                        </span>
                    </div>
                ))}
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