export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    name: string
                    role: 'admin' | 'superadmin'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    name: string
                    role?: 'admin' | 'superadmin'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string
                    role?: 'admin' | 'superadmin'
                    created_at?: string
                    updated_at?: string
                }
            }
            products: {
                Row: {
                    id: number
                    title: string
                    slug: string
                    description: string | null
                    price: number
                    discount_price: number | null
                    category: string
                    image: string | null
                    images: string[] | null
                    demo_url: string | null
                    download_url: string | null
                    is_featured: boolean
                    is_free: boolean
                    is_active: boolean
                    features: string[] | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    title: string
                    slug: string
                    description?: string | null
                    price?: number
                    discount_price?: number | null
                    category: string
                    image?: string | null
                    images?: string[] | null
                    demo_url?: string | null
                    download_url?: string | null
                    is_featured?: boolean
                    is_free?: boolean
                    is_active?: boolean
                    features?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    title?: string
                    slug?: string
                    description?: string | null
                    price?: number
                    discount_price?: number | null
                    category?: string
                    image?: string | null
                    images?: string[] | null
                    demo_url?: string | null
                    download_url?: string | null
                    is_featured?: boolean
                    is_free?: boolean
                    is_active?: boolean
                    features?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
            }
            categories: {
                Row: {
                    id: number
                    name: string
                    slug: string
                    icon: string | null
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    slug: string
                    icon?: string | null
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    slug?: string
                    icon?: string | null
                    description?: string | null
                    created_at?: string
                }
            }
            payment_settings: {
                Row: {
                    id: number
                    type: 'internal' | 'external'
                    name: string
                    is_active: boolean
                    external_url: string | null
                    bank_name: string | null
                    account_number: string | null
                    account_name: string | null
                    qr_code_image: string | null
                    instructions: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    type: 'internal' | 'external'
                    name: string
                    is_active?: boolean
                    external_url?: string | null
                    bank_name?: string | null
                    account_number?: string | null
                    account_name?: string | null
                    qr_code_image?: string | null
                    instructions?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    type?: 'internal' | 'external'
                    name?: string
                    is_active?: boolean
                    external_url?: string | null
                    bank_name?: string | null
                    account_number?: string | null
                    account_name?: string | null
                    qr_code_image?: string | null
                    instructions?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            orders: {
                Row: {
                    id: number
                    order_number: string
                    customer_email: string
                    customer_name: string
                    customer_phone: string | null
                    product_id: number | null
                    product_title: string
                    amount: number
                    payment_method: string | null
                    payment_proof: string | null
                    status: 'pending' | 'paid' | 'confirmed' | 'completed' | 'cancelled'
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    order_number: string
                    customer_email: string
                    customer_name: string
                    customer_phone?: string | null
                    product_id?: number | null
                    product_title: string
                    amount: number
                    payment_method?: string | null
                    payment_proof?: string | null
                    status?: 'pending' | 'paid' | 'confirmed' | 'completed' | 'cancelled'
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    order_number?: string
                    customer_email?: string
                    customer_name?: string
                    customer_phone?: string | null
                    product_id?: number | null
                    product_title?: string
                    amount?: number
                    payment_method?: string | null
                    payment_proof?: string | null
                    status?: 'pending' | 'paid' | 'confirmed' | 'completed' | 'cancelled'
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            site_settings: {
                Row: {
                    id: number
                    key: string
                    value: string | null
                    type: 'text' | 'number' | 'boolean' | 'json' | 'url'
                    label: string | null
                    description: string | null
                    group: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    key: string
                    value?: string | null
                    type?: 'text' | 'number' | 'boolean' | 'json' | 'url'
                    label?: string | null
                    description?: string | null
                    group?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    key?: string
                    value?: string | null
                    type?: 'text' | 'number' | 'boolean' | 'json' | 'url'
                    label?: string | null
                    description?: string | null
                    group?: string
                    updated_at?: string
                }
            }
            video_tutorials: {
                Row: {
                    id: number
                    title: string
                    description: string | null
                    youtube_url: string
                    thumbnail_url: string | null
                    duration: string | null
                    order: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    title: string
                    description?: string | null
                    youtube_url: string
                    thumbnail_url?: string | null
                    duration?: string | null
                    order?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    title?: string
                    description?: string | null
                    youtube_url?: string
                    thumbnail_url?: string | null
                    duration?: string | null
                    order?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
