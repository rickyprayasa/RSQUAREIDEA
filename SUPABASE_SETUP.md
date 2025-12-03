# Panduan Setup Supabase

## 1. Jalankan Migrations

Buka Supabase Dashboard > SQL Editor, lalu jalankan file-file berikut secara berurutan:

### a. Schema (supabase/migrations/001_initial_schema.sql)
```sql
-- Copy dan paste isi file 001_initial_schema.sql
```

### b. RLS Policies (supabase/migrations/002_rls_policies.sql)
```sql
-- Copy dan paste isi file 002_rls_policies.sql
```

### c. Seed Data (supabase/migrations/003_seed_data.sql)
```sql
-- Copy dan paste isi file 003_seed_data.sql
```

### d. Storage Buckets (supabase/migrations/004_storage_bucket.sql)
```sql
-- Copy dan paste isi file 004_storage_bucket.sql
```

Atau buat bucket manual di Storage Dashboard:
- `products` - untuk gambar produk (public, max 5MB)
- `payments` - untuk QR code pembayaran (public, max 2MB)
- `thumbnails` - untuk thumbnail video (public, max 2MB)

## 2. Buat Admin User Pertama

Di Supabase Dashboard > Authentication > Users, klik "Add user" dengan opsi:
- Email: admin@rsquare.id
- Password: (pilih password yang kuat)
- Auto Confirm User: Ya

Setelah user dibuat, jalankan SQL ini untuk menambahkan ke tabel users:

```sql
INSERT INTO users (id, email, name, role)
VALUES (
    '(UUID dari user yang baru dibuat)',
    'admin@rsquare.id',
    'Admin RSQUARE',
    'superadmin'
);
```

## 3. Environment Variables

Pastikan `.env.local` memiliki:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 4. Struktur Database

### Tables:
- `users` - Admin users (linked to Supabase Auth)
- `products` - Template products
- `categories` - Product categories
- `orders` - Customer orders
- `payment_settings` - Payment methods configuration
- `site_settings` - Site configuration (termasuk video tutorial settings)
- `video_tutorials` - Video tutorial YouTube

### Row Level Security:
- Public dapat membaca products, categories, video_tutorials yang aktif
- Admin dapat CRUD semua data
- Customer dapat membuat orders dan melihat order mereka sendiri

## 5. Fitur Auth

Login menggunakan Supabase Auth dengan email/password. Hanya user dengan role `admin` atau `superadmin` yang bisa mengakses `/admin`.

## 6. Storage untuk Gambar

Gambar produk disimpan di Supabase Storage, bukan di tabel database.

### Buckets:
- `products` - Gambar produk template
- `payments` - QR code metode pembayaran  
- `thumbnails` - Thumbnail video tutorial

### Penggunaan di Admin:
```tsx
import { ImageUpload } from '@/components/admin/ImageUpload'
import { MultiImageUpload } from '@/components/admin/MultiImageUpload'

// Single image
<ImageUpload 
  value={image} 
  onChange={setImage} 
  bucket="products" 
/>

// Multiple images
<MultiImageUpload 
  value={images} 
  onChange={setImages} 
  bucket="products"
  maxImages={10}
/>
```

### API Upload:
- POST `/api/admin/upload` - Upload image
- DELETE `/api/admin/upload` - Delete image

## 7. Catatan Migrasi dari SQLite

- Field names berubah dari camelCase ke snake_case di database
- API routes sudah di-update untuk transform antara keduanya
- Drizzle ORM tidak lagi digunakan, diganti dengan Supabase client
- Gambar sekarang disimpan di Supabase Storage
