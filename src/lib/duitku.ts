// Duitku Payment Gateway Integration
import crypto from 'crypto'

interface DuitkuConfig {
    merchantCode: string
    apiKey: string
    isProduction: boolean
}

interface PaymentMethod {
    paymentMethod: string
    paymentName: string
    paymentImage: string
    totalFee: string
}

interface TransactionRequest {
    merchantOrderId: string
    paymentAmount: number
    paymentMethod: string
    productDetails: string
    customerName: string
    email: string
    phoneNumber?: string
    callbackUrl: string
    returnUrl: string
    expiryPeriod?: number
    itemDetails?: Array<{
        name: string
        price: number
        quantity: number
    }>
}

interface TransactionResponse {
    merchantCode: string
    reference: string
    paymentUrl: string
    vaNumber?: string
    qrString?: string
    amount: string
    statusCode: string
    statusMessage: string
}

interface TransactionStatus {
    merchantOrderId: string
    reference: string
    amount: string
    statusCode: string
    statusMessage: string
}

const SANDBOX_URL = 'https://sandbox.duitku.com/webapi/api/merchant'
const PRODUCTION_URL = 'https://passport.duitku.com/webapi/api/merchant'

function getBaseUrl(isProduction: boolean): string {
    return isProduction ? PRODUCTION_URL : SANDBOX_URL
}

function generateSignature(data: string): string {
    return crypto.createHash('md5').update(data).digest('hex')
}

function generateSha256Signature(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
}

export async function getPaymentMethods(
    config: DuitkuConfig,
    amount: number
): Promise<{ success: boolean; paymentMethods?: PaymentMethod[]; error?: string }> {
    try {
        const datetime = new Date().toISOString().replace('T', ' ').substring(0, 19)
        const signature = generateSha256Signature(
            config.merchantCode + amount + datetime + config.apiKey
        )

        const response = await fetch(
            `${getBaseUrl(config.isProduction)}/paymentmethod/getpaymentmethod`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchantcode: config.merchantCode,
                    amount: amount,
                    datetime: datetime,
                    signature: signature,
                }),
            }
        )

        const data = await response.json()

        if (data.responseCode === '00') {
            return { success: true, paymentMethods: data.paymentFee }
        }

        return { success: false, error: data.responseMessage || 'Failed to get payment methods' }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function createTransaction(
    config: DuitkuConfig,
    request: TransactionRequest
): Promise<{ success: boolean; data?: TransactionResponse; error?: string }> {
    try {
        const signature = generateSignature(
            config.merchantCode + request.merchantOrderId + request.paymentAmount + config.apiKey
        )

        const payload = {
            merchantCode: config.merchantCode,
            paymentAmount: request.paymentAmount,
            paymentMethod: request.paymentMethod,
            merchantOrderId: request.merchantOrderId,
            productDetails: request.productDetails,
            customerVaName: request.customerName.substring(0, 20),
            email: request.email,
            phoneNumber: request.phoneNumber || '',
            itemDetails: request.itemDetails || [],
            callbackUrl: request.callbackUrl,
            returnUrl: request.returnUrl,
            signature: signature,
            expiryPeriod: request.expiryPeriod || 1440, // 24 hours default
        }

        const response = await fetch(
            `${getBaseUrl(config.isProduction)}/v2/inquiry`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }
        )

        const data = await response.json()

        if (data.statusCode === '00') {
            return { success: true, data }
        }

        return { success: false, error: data.statusMessage || data.Message || 'Transaction failed' }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function checkTransactionStatus(
    config: DuitkuConfig,
    merchantOrderId: string
): Promise<{ success: boolean; data?: TransactionStatus; error?: string }> {
    try {
        const signature = generateSignature(
            config.merchantCode + merchantOrderId + config.apiKey
        )

        const response = await fetch(
            `${getBaseUrl(config.isProduction)}/transactionStatus`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchantCode: config.merchantCode,
                    merchantOrderId: merchantOrderId,
                    signature: signature,
                }),
            }
        )

        const data = await response.json()

        if (data.statusCode === '00' || data.statusCode === '01' || data.statusCode === '02') {
            return { success: true, data }
        }

        return { success: false, error: data.statusMessage || 'Failed to check status' }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export function verifyCallback(
    config: DuitkuConfig,
    merchantCode: string,
    amount: string,
    merchantOrderId: string,
    signature: string
): boolean {
    const expectedSignature = generateSignature(
        merchantCode + amount + merchantOrderId + config.apiKey
    )
    return signature === expectedSignature
}

// Payment method codes reference
export const DUITKU_PAYMENT_METHODS = {
    // Credit Card
    CREDIT_CARD: 'VC',
    // Virtual Account
    VA_BCA: 'BC',
    VA_MANDIRI: 'M2',
    VA_MAYBANK: 'VA',
    VA_BNI: 'I1',
    VA_CIMB: 'B1',
    VA_PERMATA: 'BT',
    VA_BRI: 'BR',
    VA_BSI: 'BV',
    VA_DANAMON: 'DM',
    // Retail
    RETAIL_ALFAMART: 'FT',
    RETAIL_INDOMARET: 'IR',
    // E-Wallet
    OVO: 'OV',
    SHOPEEPAY: 'SA',
    LINKAJA: 'LA',
    DANA: 'DA',
    // QRIS
    QRIS_SHOPEEPAY: 'SP',
    QRIS_NOBU: 'NQ',
}
