import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { streamText, LanguageModel } from 'ai'
import { createClient } from '@/lib/supabase/server'

// Base Gemini models that are consistently reliable
const BASE_GEMINI_MODELS = [
    { provider: 'google', id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
    { provider: 'openrouter', id: 'google/gemini-3.5-flash', name: 'Gemini 3.5 Flash (OpenRouter)' },
    { provider: 'google', id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { provider: 'google', id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
    { provider: 'openrouter', id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B (OpenRouter Free)' },
]

// Default OpenRouter fallback in case the API fetch fails
const DEFAULT_OPENROUTER_MODELS = [
    { provider: 'openrouter', id: 'openrouter/free', name: 'OpenRouter Free Auto' },
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
    result: any
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
            .in('key', [
                'openrouter_api_key', 'openrouter_api_key_2', 'openrouter_api_key_3',
                'google_api_key_1', 'google_api_key_2', 'google_api_key_3',
                'openrouter_base_url', 'primary_ai_model'
            ])
        
        const getValue = (key: string) => data?.find(s => s.key === key)?.value?.trim() || ''

        const openrouterKeys = [
            getValue('openrouter_api_key'),
            getValue('openrouter_api_key_2'),
            getValue('openrouter_api_key_3')
        ].filter(Boolean).join(',')

        const googleKeys = [
            getValue('google_api_key_1'),
            getValue('google_api_key_2'),
            getValue('google_api_key_3')
        ].filter(Boolean).join(',')

        let openrouterBaseUrl = getValue('openrouter_base_url') || 'https://openrouter.ai/api/v1'
        let primaryAiModel = getValue('primary_ai_model')
        
        // Support multi-key rotation (comma separated)
        const getRotatedKey = (keyString: string) => {
            const keys = keyString.split(',').map(k => k.trim()).filter(Boolean)
            if (keys.length === 0) return ''
            // Randomly select a key to distribute the load and avoid rate limits
            return keys[Math.floor(Math.random() * keys.length)]
        }

        // Use DB Google keys if exist, otherwise fallback to env
        const finalGoogleKeys = googleKeys || process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''

        return {
            googleKey: getRotatedKey(finalGoogleKeys),
            openrouterKey: getRotatedKey(openrouterKeys),
            openrouterBaseUrl,
            primaryAiModel,
        }
    } catch {
        return {
            googleKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? process.env.GOOGLE_GENERATIVE_AI_API_KEY.split(',')[0].trim() : '',
            openrouterKey: '',
            openrouterBaseUrl: 'https://openrouter.ai/api/v1',
            primaryAiModel: '',
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
    const { googleKey, openrouterKey, openrouterBaseUrl, primaryAiModel } = await getApiKeys()
    
    // Instantiate providers with the rotated keys
    const googleProvider = createGoogleGenerativeAI({ apiKey: googleKey })
    
    let openrouterProvider: ReturnType<typeof createOpenAICompatible> | null = null
    if (openrouterKey) {
        openrouterProvider = createOpenAICompatible({
            name: 'openrouter',
            apiKey: openrouterKey,
            baseURL: openrouterBaseUrl,
            headers: {
                'HTTP-Referer': 'https://rsquareidea.com',
                'X-Title': 'RSQUARE IDEA',
            }
        })
    }

    let attempts = 0
    const MAX_RETRIES = 2
    let lastError: any = null
    let fallbackModels = await getAvailableModels()

    // If high tier is requested, prepend Pro/Reasoning models
    if (options.tier === 'high') {
        const highTierModels = [
            // Next-gen high capability models (based on user request)
            { provider: 'google', id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
            { provider: 'openrouter', id: 'google/gemini-3.1-pro', name: 'Gemini 3.1 Pro' },
            { provider: 'openrouter', id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet' },
            // Fallback to known capable models
            { provider: 'google', id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
            { provider: 'openrouter', id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro (OpenRouter)' },
            { provider: 'openrouter', id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro (OpenRouter)' },
            { provider: 'google', id: 'gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro Exp' },
        ]
        fallbackModels = [...highTierModels, ...fallbackModels]
    }

    // If user selected a specific model, prioritize it above all else
    if (primaryAiModel) {
        fallbackModels = [
            { provider: 'openrouter', id: primaryAiModel, name: primaryAiModel },
            ...fallbackModels.filter(m => m.id !== primaryAiModel)
        ]
    }

    for (const modelConfig of fallbackModels) {
        // Skip if API key for provider is missing
        if (modelConfig.provider === 'google' && !googleKey) continue
        if (modelConfig.provider === 'openrouter' && !openrouterKey) continue

        let modelInstance: LanguageModel
        
        if (modelConfig.provider === 'google') {
            modelInstance = googleProvider(modelConfig.id)
        } else if (modelConfig.provider === 'openrouter' && openrouterProvider) {
            modelInstance = openrouterProvider(modelConfig.id)
        } else {
            continue 
        }

        attempts++
        console.log(`[AI Router] Attempting generation with ${modelConfig.provider}/${modelConfig.id}...`)

        const generateOptions: any = {
            model: modelInstance,
            system: options.system,
            maxOutputTokens: options.maxTokens,
            temperature: options.temperature,
        }

        if (options.messages) {
            generateOptions.messages = options.messages
        } else if (options.prompt) {
            generateOptions.prompt = options.prompt
        }
            
        let resultText = '';
        let usageData = {};
        let resultObj = null;

        try {
            // Use streamText for robustness with proxies that force SSE streams
            const streamResult = await streamText(generateOptions)
            resultText = await streamResult.text
            usageData = await streamResult.usage
            resultObj = { ...streamResult, text: resultText, usage: usageData }
        } catch (error: any) {
            lastError = error
            if (!isRetryableError(error)) {
                console.error(`[AI Router] Model ${modelConfig.id} non-retryable error:`, error)
                continue
            }
            
            console.warn(`[AI Router] Model ${modelConfig.id} failed:`, error.message)
            
            // Retry logic
            if (attempts < MAX_RETRIES) {
                attempts++
                console.log(`[AI Router] Retrying ${modelConfig.id} (Attempt ${attempts}/${MAX_RETRIES})...`)
                await new Promise(r => setTimeout(r, 1000 * attempts))
                continue // Retry same model
            } else {
                console.warn(`[AI Router] Model ${modelConfig.id} exhausted retries, moving to next model...`)
                continue // Move to next model
            }
        }

        console.log(`[AI Router] Success with ${modelConfig.id}!`)
        
        // Strip <think> tags from DeepSeek models
        let finalOutput = resultText;
        if (modelConfig.id.includes('deepseek')) {
            finalOutput = finalOutput.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        }

        return {
            result: { ...resultObj, text: finalOutput } as any,
            usedModel: modelConfig,
            attempts
        }
    }

    // If we exhausted all models
    throw new Error(`Semua AI model gagal diakses. Error terakhir: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`)
}
