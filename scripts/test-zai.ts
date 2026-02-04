import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const zai = createOpenAI({
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: process.env.ZAI_API_KEY,
});

async function main() {
    console.log('Testing Z.Ai Connection...');
    console.log('API Key present:', !!process.env.ZAI_API_KEY);

    try {
        const { text } = await generateText({
            model: zai('glm-4-flash'),
            prompt: 'Hello, are you working?',
        });

        console.log('Success! Response:', text);
    } catch (error) {
        console.error('Connection Failed:', error);
    }
}

main();
