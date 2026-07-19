import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, createUIMessageStreamResponse, toUIMessageStream } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    const result = streamText({
      model: google('gemini-3.5-flash'),
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