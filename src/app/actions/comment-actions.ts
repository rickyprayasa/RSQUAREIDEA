'use server'

import OpenAI from 'openai'
import { containsBannedWord } from '@/data/banned-words'

// Initialize Z.Ai (OpenAI Compatible - GLM Coding Plan)
const zai = new OpenAI({
    apiKey: process.env.ZAI_API_KEY || '',
    baseURL: 'https://api.z.ai/api/coding/paas/v4'
})

export async function checkCommentSafety(content: string): Promise<{ safe: boolean; reason?: string }> {
    try {
        // Step 1: Quick Blocklist Check (Fast, Free)
        const blocklist = containsBannedWord(content)
        if (blocklist.banned) {
            return {
                safe: false,
                reason: blocklist.reason
            }
        }

        // Step 2: AI Check for Context-Aware Moderation (if API key available)
        if (!process.env.ZAI_API_KEY) {
            console.warn('ZAI_API_KEY is not set. Skipping AI check.')
            return { safe: true }
        }

        const prompt = `
        You are a content moderator for a blog. Analyze the following comment for:
        1. Hate speech or harassment
        2. Gambling advertisements (judi online, slot, gacor, link betting)
        3. Drug references or promotion
        4. Profanity or vulgar language
        5. Spam or scam links
        
        Return ONLY a JSON object with this format, no markdown or code fences:
        {
            "safe": boolean,
            "reason": string (short explanation in Indonesian if safe is false, otherwise null)
        }

        Comment: "${content}"
        `

        const completion = await zai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'GLM-4.7',
            temperature: 0.1
        })

        const text = completion.choices[0].message.content || '{}'

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()

        // Try to parse, fail gracefully
        let analysis;
        try {
            analysis = JSON.parse(jsonStr)
        } catch (e) {
            console.error('Failed to parse AI response:', text)
            return { safe: true }
        }

        return analysis

    } catch (error) {
        console.error('AI Check Error:', error)
        return { safe: true, reason: 'AI check failed, bypassing.' }
    }
}
