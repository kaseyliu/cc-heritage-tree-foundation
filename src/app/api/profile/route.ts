import { NextRequest, NextResponse } from "next/server";
import s3 from "@/app/api/tree/aws";
import { Buffer } from "buffer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    // SINGLE file
    const file = formData.get("file") as File;
    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No valid file provided" }, { status: 400 });
    }

    const bucketName = process.env.AWS_S3_PROFILE_PIC_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json({ error: "AWS_S3_PROFILE_PIC_BUCKET_NAME is not set" }, { status: 500 });
    }

    // Upload to S3
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = file.name || "profile-image";
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");

    const params = {
      Bucket: bucketName,
      Key: `profile-pics/${Date.now()}_${safeFilename}`,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    };

    const result = await s3.upload(params).promise();

    console.log("Uploaded to S3:", result.Location);

    return NextResponse.json({ message: "Success", url: result.Location }, { status: 200 });
  } catch (error) {
    console.error("Error submitting profile pic:", error);
    return NextResponse.json(
      {
        error: "Error submitting profile pic",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
