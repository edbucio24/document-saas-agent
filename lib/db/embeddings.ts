import { GoogleGenAI } from '@google/genai';

export async function getEmbeddings(text: string): Promise<number[]> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("API key missing");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
        const response = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: text,
            config: {
                outputDimensionality: 1024
            }
        });

        // 1. Verify the array exists and has the first element
        if (!response.embeddings || response.embeddings.length === 0) {
            throw new Error("Empty embedding response");
        }
        
        // 2. Safely grab the vector array values out of the first embedded item
        const vectorValues = response.embeddings[0].values;

        if (!vectorValues) {
            throw new Error("Embedding values are undefined");
        }

        return Array.from(vectorValues);
        
    } catch (error) {
        console.error("Unable to generate embedding", error);
        throw error;
    }
}