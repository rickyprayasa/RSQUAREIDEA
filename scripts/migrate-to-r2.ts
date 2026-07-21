import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const accountId = process.env.R2_ACCOUNT_ID!
const accessKeyId = process.env.R2_ACCESS_KEY_ID!
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!
const publicBucket = process.env.R2_PUBLIC_BUCKET_NAME || 'rsquare-public'
const privateBucket = process.env.R2_PRIVATE_BUCKET_NAME || 'rsquare-private'
const publicUrl = process.env.R2_PUBLIC_URL!

const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    forcePathStyle: true,
})

// Configuration for Buckets
const bucketConfigs = [
    { name: 'products', type: 'public' as const },
    { name: 'thumbnails', type: 'public' as const },
    { name: 'payments', type: 'public' as const },
    { name: 'feedback_images', type: 'public' as const },
    { name: 'Logo RSQUARE', type: 'public' as const },
    { name: 'qris', type: 'private' as const }
]

async function downloadFromSupabase(bucket: string, filePath: string): Promise<Buffer | null> {
    const { data, error } = await supabase.storage.from(bucket).download(filePath)
    if (error || !data) {
        console.error(`Error downloading ${filePath} from ${bucket}:`, error?.message)
        return null
    }
    return Buffer.from(await data.arrayBuffer())
}

async function uploadToR2(buffer: Buffer, filePath: string, bucketType: 'public' | 'private') {
    const bucketName = bucketType === 'public' ? publicBucket : privateBucket
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: buffer,
        // Optional: auto-detect content type based on extension
        // ContentType: 'application/octet-stream' 
    })
    await r2Client.send(command)
}

// Map database updates
const dbUpdates = [
    { table: 'products', columns: ['image', 'thumbnail', 'images', 'demo_url', 'download_url'] },
    { table: 'qris_confirmations', columns: ['proof_image'] },
    { table: 'feedback', columns: ['image_url'] },
    { table: 'articles', columns: ['thumbnail_url'] },
    { table: 'videos', columns: ['thumbnail_url'] },
    { table: 'custom_showcase', columns: ['attachment_url'] },
    { table: 'request_invoices', columns: ['delivery_url', 'delivery_file_url'] },
    { table: 'payment_methods', columns: ['qr_code_image'] }
]

async function migrateBucket(bucketName: string, bucketType: 'public' | 'private') {
    console.log(`\n📦 Migrating bucket: ${bucketName} (${bucketType})`)
    const { data: files, error } = await supabase.storage.from(bucketName).list('', {
        limit: 1000,
        offset: 0,
    })

    if (error) {
        console.error(`Failed to list files in ${bucketName}:`, error.message)
        return
    }

    let successCount = 0
    let skipCount = 0

    for (const file of files || []) {
        // Skip directories or placeholder files
        if (file.name === '.emptyFolderPlaceholder') continue

        // Preserve bucket folder structure if needed
        // For example, if qris files are usually in proofs/
        const targetPath = bucketName === 'Logo RSQUARE' ? `Logo RSQUARE/${file.name}` : `${bucketName}/${file.name}`

        console.log(`Downloading ${file.name}...`)
        const buffer = await downloadFromSupabase(bucketName, file.name)
        if (!buffer) continue

        console.log(`Uploading ${targetPath} to R2 (${bucketType})...`)
        try {
            await uploadToR2(buffer, targetPath, bucketType)
            successCount++
        } catch (e: any) {
            console.error(`Failed to upload ${targetPath}:`, e.message)
        }
    }
    console.log(`✅ Bucket ${bucketName} complete. Migrated: ${successCount}`)
}

async function updateDatabaseUrls() {
    console.log('\n🔄 Updating database URLs...')
    const oldPrefix = `${supabaseUrl}/storage/v1/object/public/`
    const oldR2Prefix = 'https://pub-8f2c427036524f5f91c24176f710ea27.r2.dev/'
    const newPrefix = publicUrl.endsWith('/') ? publicUrl : publicUrl + '/'

    for (const config of dbUpdates) {
        const { table, columns } = config
        
        // Fetch rows that might contain the old URL
        const { data: rows, error } = await supabase.from(table).select('*')
        if (error || !rows) {
            console.error(`Failed to fetch from ${table}:`, error?.message)
            continue
        }

        let updateCount = 0
        for (const row of rows) {
            let needsUpdate = false
            const updates: any = {}

            for (const col of columns) {
                if (row[col]) {
                    if (typeof row[col] === 'string') {
                        if (row[col].includes(oldPrefix)) {
                            updates[col] = row[col].replace(oldPrefix, newPrefix)
                            needsUpdate = true
                        } else if (row[col].includes(oldR2Prefix)) {
                            updates[col] = row[col].replace(oldR2Prefix, newPrefix)
                            needsUpdate = true
                        }
                    } else if (Array.isArray(row[col])) {
                        const newArray = row[col].map((item: string) => {
                            if (typeof item === 'string') {
                                if (item.includes(oldPrefix)) {
                                    return item.replace(oldPrefix, newPrefix)
                                } else if (item.includes(oldR2Prefix)) {
                                    return item.replace(oldR2Prefix, newPrefix)
                                }
                            }
                            return item
                        })
                        
                        // Check if the array actually changed
                        if (JSON.stringify(newArray) !== JSON.stringify(row[col])) {
                            updates[col] = newArray
                            needsUpdate = true
                        }
                    }
                }
            }

            if (needsUpdate) {
                const { error: updateError } = await supabase
                    .from(table)
                    .update(updates)
                    .eq('id', row.id)
                
                if (updateError) {
                    console.error(`Failed to update ${table} id=${row.id}:`, updateError.message)
                } else {
                    updateCount++
                }
            }
        }
        console.log(`Updated ${updateCount} rows in table ${table}`)
    }
}

async function run() {
    console.log('🚀 Starting Storage Migration to R2')
    
    // 1. Migrate Buckets
    for (const config of bucketConfigs) {
        await migrateBucket(config.name, config.type)
    }

    // 2. Update Database
    await updateDatabaseUrls()

    console.log('\n🎉 Migration process completed!')
}

run().catch(console.error)
