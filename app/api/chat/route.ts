import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, createUIMessageStreamResponse, toUIMessageStream } from 'ai';
import {getContext} from '@/lib/context'
import {db} from '@/lib/db'
import {chats} from "@/lib/db/schema"
import {eq} from "drizzle-orm"
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages ,chatId} = body;
    const _chats = await db.select().from(chats).where(eq(chats.id,chatId))
    if(_chats.length != 1){
      return NextResponse.json({'error':'chat not found'},{status:404})
    }

    const fileKey = _chats[0].fileKey
    const lastMessage = messages[messages.length - 1];
    const lastMessageText = lastMessage.parts
      .filter((part: any) => part.type === 'text')
      .map((part: any) => part.text)
      .join('');

const context = await getContext(lastMessageText, fileKey)

     const systemPrompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    } as const;


    const result = streamText({
      model: google('gemini-3.5-flash'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages), // async in v7
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
    });
  }
}