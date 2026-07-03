import { NextResponse } from 'next/server';
import AWS from 'aws-sdk';

export async function POST(req: Request) {
    try {
        // 1. Read the incoming network multipart form data
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file found" }, { status: 400 });
        }

        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });

        const s3 = new AWS.S3({
            region: 'us-east-2'
        });

        const file_key = 'uploads/' + Date.now().toString() + file.name.replace(/\s+/g, '-');
        
        // 2. Transform the file stream into a Node.js buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: file_key,
            Body: buffer,
            ContentType: file.type
        };

        // 3. Upload to AWS S3
        await s3.putObject(params).promise();
        console.log('Successfully uploaded to S3 via API Route!', file_key);

        // 4. Return the tracking info back to the frontend
        return NextResponse.json({
            file_key,
            file_name: file.name
        });

    } catch (error) {
        console.error("S3 API Route Upload Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}