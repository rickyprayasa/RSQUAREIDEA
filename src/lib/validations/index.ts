import { z } from 'zod'

// ============================================================================
// COMMON VALIDATIONS
// ============================================================================

export const emailSchema = z.string().email('Email tidak valid').max(255)
export const passwordSchema = z.string().min(8, 'Password minimal 8 karakter')
export const nameSchema = z.string().min(2, 'Nama minimal 2 karakter').max(100)
export const slugSchema = z.string().min(2, 'Slug minimal 2 karakter').max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan dash')
export const urlSchema = z.string().url('URL tidak valid').optional()
export const phoneSchema = z.string().regex(/^62\d{8,14}$/, 'Format nomor HP: 62xxxxxxxxxx')

// ============================================================================
// AUTH VALIDATIONS
// ============================================================================

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password harus diisi'),
})

export const registerSchema = z.object({
    email: emailSchema,
    password: z.string()
        .min(8, 'Password minimal 8 karakter')
        .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
        .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
        .regex(/\d/, 'Password harus mengandung angka')
        .regex(/[^a-zA-Z0-9]/, 'Password harus mengandung karakter special'),
    name: nameSchema,
})

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Password saat ini harus diisi'),
    newPassword: z.string()
        .min(8, 'Password minimal 8 karakter')
        .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
        .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
        .regex(/\d/, 'Password harus mengandung angka')
        .regex(/[^a-zA-Z0-9]/, 'Password harus mengandung karakter special'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password baru dan konfirmasi tidak cocok',
    path: ['confirmPassword'],
})

// ============================================================================
// PRODUCT VALIDATIONS
// ============================================================================

export const productSchema = z.object({
    title: z.string().min(5, 'Judul minimal 5 karakter').max(200),
    slug: slugSchema.optional(),
    description: z.string().min(20, 'Deskripsi minimal 20 karakter').max(5000).optional(),
    price: z.number().min(0, 'Harga tidak boleh negatif'),
    compare_price: z.number().min(0, 'Harga banding tidak boleh negatif').optional(),
    sku: z.string().max(50).optional(),
    barcode: z.string().max(50).optional(),
    stock: z.number().int().min(0, 'Stock tidak boleh negatif').optional(),
    is_active: z.boolean().optional(),
    is_free: z.boolean().optional(),
    category_id: z.number().int().positive().optional(),
    thumbnail_url: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
})

// ============================================================================
// ARTICLE VALIDATIONS
// ============================================================================

export const articleSchema = z.object({
    title: z.string().min(10, 'Judul minimal 10 karakter').max(200),
    slug: slugSchema,
    excerpt: z.string().min(50, 'Excerpt minimal 50 karakter').max(500).optional(),
    content: z.string().min(100, 'Konten minimal 100 karakter'),
    thumbnail_url: z.string().url().optional(),
    youtube_url: z.string().url().optional(),
    category_id: z.number().int().positive().optional(),
    published: z.boolean().optional(),
})

// ============================================================================
// ORDER & CUSTOMER VALIDATIONS
// ============================================================================

export const customerSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    address: z.string().min(10, 'Alamat minimal 10 karakter').optional(),
})

export const orderSchema = z.object({
    customer_id: z.number().int().positive(),
    product_id: z.number().int().positive(),
    quantity: z.number().int().positive(),
    amount: z.number().positive(),
    status: z.enum(['pending', 'paid', 'failed', 'refunded']),
    payment_method: z.enum(['duitku', 'qris', 'manual']),
})

// ============================================================================
// VIDEO VALIDATIONS
// ============================================================================

export const videoSchema = z.object({
    title: z.string().min(5, 'Judul minimal 5 karakter').max(200),
    slug: slugSchema,
    description: z.string().min(20, 'Deskripsi minimal 20 karakter').max(2000).optional(),
    youtube_url: z.string().url('URL YouTube tidak valid'),
    thumbnail_url: z.string().url().optional(),
    is_free: z.boolean().optional(),
    price: z.number().min(0).optional(),
})

// ============================================================================
// CATEGORY VALIDATIONS
// ============================================================================

export const categorySchema = z.object({
    name: z.string().min(3, 'Nama kategori minimal 3 karakter').max(50),
    slug: slugSchema,
    description: z.string().max(500).optional(),
})

// ============================================================================
// EMAIL CAMPAIGN VALIDATIONS
// ============================================================================

export const emailCampaignSchema = z.object({
    name: z.string().min(3, 'Nama campaign minimal 3 karakter').max(200),
    subject: z.string().min(5, 'Subject minimal 5 karakter').max(200),
    content: z.string().min(20, 'Konten minimal 20 karakter'),
    recipients: z.array(z.object({
        email: emailSchema,
        name: z.string().optional(),
    })),
    scheduled_at: z.coerce.date().optional(),
    sent_at: z.coerce.date().optional(),
})

// ============================================================================
// MESSAGE & FEEDBACK VALIDATIONS
// ============================================================================

export const messageSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    subject: z.string().min(5, 'Subject minimal 5 karakter').max(200),
    message: z.string().min(10, 'Pesan minimal 10 karakter').max(2000),
})

export const feedbackSchema = z.object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
    rating: z.number().int().min(1, 'Rating minimal 1').max(5, 'Rating maksimal 5'),
    message: z.string().min(10, 'Pesan minimal 10 karakter').max(2000),
})

// ============================================================================
// SEARCH & PAGINATION VALIDATIONS
// ============================================================================

export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
})

export const searchSchema = paginationSchema.extend({
    query: z.string().min(2, 'Query minimal 2 karakter').optional(),
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate request body against a schema
 */
export async function validateRequest<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
        const validated = await schema.parseAsync(data)
        return { success: true, data: validated }
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = error.issues
                .map((e) => `${e.path.join('.')}: ${e.message}`)
                .join(', ')
            return { success: false, error: errorMessage }
        }
        return { success: false, error: 'Validation failed' }
    }
}

/**
 * Express middleware for request validation (if using Express)
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
    return async (req: any, res: any, next: any) => {
        try {
            req.body = await schema.parseAsync(req.body)
            next()
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.issues,
                })
            }
            return res.status(400).json({ error: 'Invalid request' })
        }
    }
}
