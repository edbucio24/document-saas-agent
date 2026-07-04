import { error } from 'console'
import { S3 } from "@aws-sdk/client-s3";
import fs from 'fs'
import path from 'path'
import {Readable} from 'stream'

export async function downloadFromS3(filekey:string){
    try{
        const s3 = new S3({
            region: "us-east-2",
            credentials:{
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });
        
        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
            Key:filekey
        }
        
        const obj = await s3.getObject(params);
        // 3. Set up and verify the local temporary directory environment
        const tmpDir = path.join(process.cwd(), "tmp"); 
        if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });

        const file_name = path.join(tmpDir, `pdf-${Date.now()}.pdf`);
        if (obj.Body instanceof Readable) {
      const fileStream = fs.createWriteStream(file_name);
      
        await new Promise((resolve, reject) => {
        (obj.Body as Readable).pipe(fileStream)
          .on("finish", () => resolve)
          .on("error", reject);
      });

        return file_name; // Returns the local path to the downloaded file
         }

        throw new Error("S3 Object body is not a readable stream.");
    }

    }catch(error){
        console.error(error)
        return null;
    }
}