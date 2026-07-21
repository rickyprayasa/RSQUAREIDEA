import { S3Client, CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
});

async function run() {
    // Just list what's in the bucket root vs folders
    const cmd = new ListObjectsV2Command({ Bucket: 'rsquare-public' });
    const res = await r2Client.send(cmd);
    const files = res.Contents?.map(c => c.Key) || [];
    console.log('Total files in rsquare-public:', files.length);
    console.log('Sample files:', files.slice(0, 10));
}
run();
