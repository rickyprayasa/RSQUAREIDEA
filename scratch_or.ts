import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    const provider = createOpenAICompatible({
        name: 'openrouter',
        apiKey: process.env.OPENROUTER_API_KEY || 'fake-key',
        baseURL: 'https://openrouter.ai/api/v1',
    });

    try {
        const res = await generateText({
            model: provider('deepseek/deepseek-r1:free'),
            prompt: 'Test',
        });
        console.log("Success", res.text);
    } catch (e: any) {
        console.error("Error Name:", e.name);
        console.error("Error Message:", e.message);
        console.error("Full Error:", JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
    }
}
main();
