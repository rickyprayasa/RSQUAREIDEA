import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';

async function main() {
    const provider = createOpenAICompatible({
        name: 'openrouter',
        apiKey: 'fake-invalid-key-for-testing',
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
    }
}
main();
