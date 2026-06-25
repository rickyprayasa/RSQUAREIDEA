import { google } from '@ai-sdk/google'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText, LanguageModel } from 'ai'
import { createClient } from '@/lib/supabase/server'

// Base Gemini models that are consistently reliable
const BASE_GEMINI_MODELS = [
    { provider: 'google', id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { provider: 'google', id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
    { provider: 'google', id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { provider: 'google', id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
]

// Default OpenRouter fallback in case the API fetch fails
const DEFAULT_OPENROUTER_MODELS = [
    { provider: 'openrouter', id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)' },
]

// Memory cache for OpenRouter dynamic models
let cachedOpenRouterModels: { provider: string; id: string; name: string }[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 3600000 // 1 hour in ms

export async function getAvailableModels(): Promise<{ provider: string; id: string; name: string }[]> {
    const models = [...BASE_GEMINI_MODELS]
    
    // Use cached models if valid
    if (cachedOpenRouterModels && Date.now() - cacheTimestamp < CACHE_TTL) {
        models.push(...cachedOpenRouterModels)
        return models
    }

    try {
        // Fetch dynamically from OpenRouter
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            next: { revalidate: 3600 }
        })
        
        if (!response.ok) throw new Error(`Status ${response.status}`)
        
        const data = await response.json()
        
        // Filter models that are 100% free (pricing is exactly "0" for both prompt and completion)
        const freeModels = data.data
            .filter((m: any) => m.pricing && m.pricing.prompt === "0" && m.pricing.completion === "0")
            // Optionally, limit to avoid trying 100+ models sequentially
            .slice(0, 15)
            .map((m: any) => ({
                provider: 'openrouter',
                id: m.id,
                name: m.name || m.id
            }))

        if (freeModels.length > 0) {
            cachedOpenRouterModels = freeModels
            cacheTimestamp = Date.now()
            models.push(...freeModels)
        } else {
            models.push(...DEFAULT_OPENROUTER_MODELS)
        }
    } catch (error) {
        console.warn('[AI Router] Failed to fetch dynamic OpenRouter models, using default:', error)
        if (cachedOpenRouterModels) {
            models.push(...cachedOpenRouterModels) // Use stale cache if fetch fails
        } else {
            models.push(...DEFAULT_OPENROUTER_MODELS)
        }
    }

    return models
}

interface GenerateResult {
    result: Awaited<ReturnType<typeof generateText>>
    usedModel: { provider: string; id: string; name: string }
    attempts: number
}

// Function to safely extract settings from Supabase
async function getApiKeys() {
    const supabase = await createClient()
    try {
        const { data } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['openrouter_api_key'])
        
        const openrouterKey = data?.find(s => s.key === 'openrouter_api_key')?.value || ''
        
        return {
            googleKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
            openrouterKey,
        }
    } catch {
        return {
            googleKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
            openrouterKey: '',
        }
    }
}

// Helper to determine if an error is transient (e.g. rate limit, server error) and should be retried
function isRetryableError(error: any): boolean {
    const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
    
    // Non-retryable errors (configuration issues, auth issues, invalid requests)
    if (msg.includes('api_key') || msg.includes('401') || msg.includes('403') || msg.includes('unauthorized') || msg.includes('400') || msg.includes('bad request')) {
        return false
    }
    
    // Default to retry for timeouts, 500s, 429s (rate limit)
    return true
}

export async function generateWithFallback(options: {
    system?: string,
    prompt?: string,
    messages?: any[],
    maxTokens?: number,
    temperature?: number,
    tier?: 'standard' | 'high'
}): Promise<GenerateResult> {
    const { googleKey, openrouterKey } = await getApiKeys()
    
    let openrouterProvider: ReturnType<typeof createOpenAICompatible> | null = null
    if (openrouterKey) {
        openrouterProvider = createOpenAICompatible({
            name: 'openrouter',
            apiKey: openrouterKey,
            baseURL: 'https://openrouter.ai/api/v1',
        })
    }

    let attempts = 0
    let lastError: any = null
    let fallbackModels = await getAvailableModels()

    // If high tier is requested, prepend Pro/Reasoning models
    if (options.tier === 'high') {
        const highTierModels = [
            { provider: 'google', id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro' },
            { provider: 'google', id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
            { provider: 'google', id: 'gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro Exp' },
        ]
        fallbackModels = [...highTierModels, ...fallbackModels]
    }

    for (const modelConfig of fallbackModels) {
        // Skip if API key for provider is missing
        if (modelConfig.provider === 'google' && !googleKey) continue
        if (modelConfig.provider === 'openrouter' && !openrouterKey) continue

        let modelInstance: LanguageModel
        
        try {
            if (modelConfig.provider === 'google') {
                modelInstance = google(modelConfig.id)
            } else if (modelConfig.provider === 'openrouter' && openrouterProvider) {
                modelInstance = openrouterProvider(modelConfig.id)
            } else {
                continue // Should not reach here based on previous checks
            }

            console.log(`[AI Router] Attempting generation with ${modelConfig.provider}/${modelConfig.id}...`)
            attempts++

            const result = await generateText({
                model: modelInstance,
                system: options.system,
                prompt: options.prompt,
                messages: options.messages,
                maxTokens: options.maxTokens,
                temperature: options.temperature,
            })

            console.log(`[AI Router] Success with ${modelConfig.id}!`)
            
            return {
                result,
                usedModel: modelConfig,
                attempts
            }

        } catch (error) {
            console.warn(`[AI Router] Model ${modelConfig.id} failed:`, error instanceof Error ? error.message : error)
            lastError = error
            
            // If the error indicates a bad API key or invalid request, we shouldn't retry with THIS provider
            // However, since we might have another provider (e.g. OpenRouter), we just continue to the next model
            // But if it's a completely fatal error that applies to everything, we might throw.
            if (!isRetryableError(error)) {
                console.warn(`[AI Router] Non-retryable error encountered for ${modelConfig.provider}. Continuing to next model...`)
                continue
            }
        }
    }

    // If we exhausted all models
    throw new Error(`Semua AI model gagal diakses. Error terakhir: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`)
}
