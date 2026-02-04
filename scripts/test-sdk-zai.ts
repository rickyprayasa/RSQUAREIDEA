
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    const apiKey = process.env.ZAI_API_KEY;
    console.log("API Key present:", !!apiKey);
    console.log("API Key length:", apiKey?.length);

    if (!apiKey) {
        console.error("Missing ZAI_API_KEY");
        return;
    }

    const zai = createOpenAICompatible({
        name: 'zai',
        baseURL: 'https://api.z.ai/api/coding/paas/v4',
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    try {
        console.log("Testing generateText (non-streaming) connection...");
        const { text } = await generateText({
            model: zai('glm-4.7'),
            prompt: 'Hello, are you working?',
        });

        console.log("Generation success!");
        console.log("Output:", text);

    } catch (error) {
        console.error("Error during generation:", error);
    }
}

main();
