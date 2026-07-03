import { db } from "@/lib/db"; // Ensure this matches your db client export path
import { chats } from "@/lib/db/schema"; // Ensure this matches your schema file path
import { auth } from "@clerk/nextjs/server";
import AWS from "aws-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the User with Clerk
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse the Incoming File Request
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("Missing file parameter", { status: 400 });
    }

    const fileName = file.name;
    const fileKey = `uploads/${Date.now()}-${fileName.replace(/\s+/g, "-")}`;

    // 3. Initialize AWS S3 Server-Side (Using Locked Down Keys)
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: "us-east-2", // Make sure this matches your exact S3 bucket region
    });

    const buffer = Buffer.from(await file.arrayBuffer());

    const params = {
      Bucket: process.env.S3_BUCKET_NAME || "saas-doc-agent",
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
    };

    // 4. Execute the Secure S3 Cloud Upload
    await s3.upload(params).promise();
    console.log("Successfully uploaded to S3!", fileKey);

    // 5. Save the Metadata into Neon via Drizzle
    const newChat = await db
      .insert(chats)
      .values({
        pdfName: fileName,
        pdfUrl: `https://${params.Bucket}.s3.us-east-2.amazonaws.com/${fileKey}`,
        clerkId: userId,
        fileKey: fileKey,
      })
      .returning({
        insertedId: chats.id,
      });

    // 6. Return the DB Chat ID back to your Frontend Dropzone UI
    return NextResponse.json(
  {
    chat_id: newChat[0].insertedId,
    file_key: fileKey,
    file_name: fileName,
  },
  { status: 200 }
);

  } catch (error) {
    console.error("S3 API Route Upload Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}