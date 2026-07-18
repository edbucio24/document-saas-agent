import React from 'react'
import { UIMessage } from '@ai-sdk/react' // <-- Update the import here!

type Props = {
    messages: UIMessage[] // <-- Update the type here!
}

export default function MessageList({ messages }: Props) {
    if (!messages) return <></>

    return (
        <div className='flex flex-col gap-4 p-4'>
            {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-lg max-w-[80%] ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}>
                        {message.parts?.map((part, index) => (
                            part.type === 'text' ? <span key={index}>{part.text}</span> : null
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}