import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
const client = new S3Client({
    region: 'auto',
    endpoint: 'https://40b5ee7653b870d2bebeda2ca8aff807.r2.cloudflarestorage.com',
    credentials: {
        accessKeyId: 'c2200d85234356fd7bff35bcae9b6741',
        secretAccessKey: 'd77f4964dd891506316ab0cbb21a9eaf396ff740d37ce241da0eed88f18daac3',
    },
    forcePathStyle: true,
});
async function test() {
    try {
        const data = await client.send(new ListBucketsCommand({}));
        console.log("Success", data);
    } catch (err) {
        console.error("Error", err);
    }
}
test();
