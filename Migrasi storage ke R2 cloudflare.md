Saya ingin memigrasikan seluruh penggunaan file/object storage pada project ini dari Supabase Storage ke Cloudflare R2.

PENTING:
- JANGAN memigrasikan database PostgreSQL Supabase.
- JANGAN menghapus atau mengganti Supabase Database.
- JANGAN mengubah Supabase Auth jika digunakan.
- Supabase tetap digunakan untuk database dan layanan non-storage.
- Cloudflare R2 hanya akan menggantikan Supabase Storage untuk penyimpanan dan penyajian file.

KONTEKS MASALAH:
Project saat ini menggunakan Supabase Storage dan mengalami penggunaan Cached Egress yang tinggi.

Bucket Supabase yang saat ini tersedia antara lain:
- feedback_images
- Logo RSQUARE
- qris
- products
- payments
- thumbnails

Target saya adalah memindahkan file storage ke Cloudflare R2 untuk mengurangi penggunaan Cached Egress Supabase.

TUGAS PERTAMA: AUDIT CODEBASE

Sebelum mengubah kode apa pun, lakukan audit menyeluruh terhadap seluruh project.

Cari semua penggunaan:

1. supabase.storage
2. .from(bucketName)
3. .upload()
4. .remove()
5. .download()
6. .getPublicUrl()
7. .createSignedUrl()
8. URL yang mengandung:
   /storage/v1/object/
9. URL Supabase Storage yang disimpan di database
10. fungsi upload, update, replace, dan delete file
11. komponen frontend yang menampilkan gambar/file dari Supabase Storage
12. API route/server action/backend function yang berhubungan dengan file

Identifikasi untuk setiap penggunaan:
- nama file
- lokasi kode
- bucket yang digunakan
- operasi yang dilakukan
- apakah kode berjalan di frontend atau backend
- tabel dan kolom database yang menyimpan referensi file
- apakah database menyimpan full URL atau hanya path/object key

JANGAN melakukan perubahan kode sampai audit selesai.

Setelah audit, berikan Migration Plan terlebih dahulu.


TARGET ARSITEKTUR

Gunakan Cloudflare R2 sebagai object storage.

Untuk file PUBLIC:
- Gunakan custom domain R2 jika tersedia.
- Jika belum tersedia, buat implementasi yang mudah dikonfigurasi menggunakan environment variable seperti R2_PUBLIC_URL.

Untuk file PRIVATE/SENSITIF:
- Jangan membuat file menjadi public.
- Gunakan signed URL atau mekanisme akses backend yang aman jika diperlukan.

PERHATIKAN KHUSUS BUCKET:
- payments
- qris
- feedback_images

Analisis apakah file tersebut seharusnya public atau private berdasarkan cara aplikasi menggunakannya.

Jangan otomatis membuat semua file public.


SECURITY REQUIREMENTS

Credential berikut DILARANG berada di frontend/client bundle:

- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY
- R2_ACCOUNT_ID jika digunakan sebagai credential sensitif
- secret/token apa pun

Semua operasi yang membutuhkan R2 Secret Access Key harus dilakukan dari server/backend.

Jika project menggunakan framework seperti Next.js:
- gunakan API Routes, Route Handlers, atau Server Actions sesuai arsitektur project.

Jika upload dilakukan langsung dari browser:
- implementasikan presigned upload URL dari backend.
- browser harus upload menggunakan URL sementara tersebut.
- jangan pernah memberikan R2 Secret Access Key ke browser.


ENVIRONMENT VARIABLES

Gunakan konfigurasi environment variable, misalnya:

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

Sesuaikan nama variable jika project memiliki convention sendiri.

Jangan hardcode credential.


STORAGE SERVICE ABSTRACTION

Jika memungkinkan, buat abstraction/service terpusat untuk storage.

Contoh tanggung jawab:

uploadFile()
deleteFile()
getPublicFileUrl()
getSignedFileUrl()
generateUploadUrl()

Tujuannya agar komponen aplikasi tidak berinteraksi langsung dengan SDK R2 di banyak tempat.

Jangan melakukan rewrite besar yang tidak diperlukan.


OBJECT KEY STRATEGY

Pertahankan struktur folder yang logis berdasarkan bucket lama.

Contoh:

products/{filename}
thumbnails/{filename}
feedback_images/{filename}
qris/{filename}
payments/{filename}
logo/{filename}

Pastikan filename unik untuk mencegah overwrite.

Jika database saat ini menyimpan full Supabase URL, analisis strategi migrasi terbaik.

Prioritaskan menyimpan object key/path dibanding full provider-specific URL untuk upload baru jika perubahan tersebut aman.

Contoh:

BAD:
https://xxxxx.supabase.co/storage/v1/object/public/products/image.webp

BETTER:
products/image.webp

Kemudian URL dibentuk oleh storage service.


MIGRASI FILE LAMA

Jangan menghapus file dari Supabase Storage.

Buat strategi/script migrasi yang:

1. Membaca daftar object dari setiap Supabase bucket.
2. Download file dari Supabase Storage.
3. Upload file yang sama ke Cloudflare R2.
4. Mempertahankan struktur folder/path.
5. Mempertahankan Content-Type.
6. Menggunakan cache headers yang sesuai untuk file public.
7. Tidak overwrite file secara tidak sengaja.
8. Memiliki error handling.
9. Memiliki progress logging.
10. Bisa dijalankan ulang dengan aman/idempotent.

Setelah file berhasil dimigrasikan:

- verifikasi file tersedia di R2
- verifikasi ukuran file jika memungkinkan
- verifikasi Content-Type
- jangan langsung menghapus source file dari Supabase


DATABASE MIGRATION

Audit apakah database menyimpan:

A. Full Supabase Storage URL

atau

B. Object path saja.

Jika full URL disimpan:
- buat migration script terpisah
- backup data terlebih dahulu
- jangan langsung menjalankan update massal
- tampilkan preview data yang akan berubah
- update hanya setelah file tujuan dipastikan tersedia di R2

Jika object path sudah digunakan:
- prioritaskan perubahan URL resolver/storage service tanpa mengubah database.


CACHE OPTIMIZATION

Karena tujuan migrasi adalah mengurangi bandwidth/egress:

Untuk asset public yang filename-nya immutable/unik, pertimbangkan:

Cache-Control: public, max-age=31536000, immutable

Jangan gunakan immutable caching jika object dengan URL/path yang sama dapat berubah.

Pastikan upload baru menggunakan unique filename jika long-term caching digunakan.


IMPLEMENTATION PHASES

Kerjakan secara bertahap:

PHASE 1
Audit codebase dan buat migration report.

PHASE 2
Buat R2 storage service/configuration.

PHASE 3
Migrasikan satu kategori yang aman terlebih dahulu, misalnya products atau thumbnails.

PHASE 4
Test:
- upload
- display
- update
- delete
- cache behavior
- error handling

PHASE 5
Migrasikan bucket lainnya.

PHASE 6
Buat dan jalankan script migrasi file lama setelah saya setujui.

PHASE 7
Update referensi database jika memang diperlukan.

PHASE 8
Verifikasi bahwa tidak ada lagi request aktif ke:
supabase.co/storage/v1/

JANGAN menghapus file Supabase Storage sampai saya memberikan izin eksplisit.


OUTPUT PERTAMA YANG SAYA INGINKAN

Sebelum melakukan coding, berikan:

1. Storage Usage Audit
2. Daftar file/code yang menggunakan Supabase Storage
3. Mapping bucket → fitur aplikasi
4. Mapping tabel/kolom → file storage
5. Risiko migrasi
6. Rekomendasi public/private untuk setiap bucket
7. Migration Plan
8. Environment variables yang diperlukan
9. File yang akan dibuat atau dimodifikasi

Setelah itu STOP dan tunggu persetujuan saya sebelum melakukan implementasi.
