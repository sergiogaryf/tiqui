import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

let _s3: S3Client;
function getS3() {
  if (!_s3) {
    _s3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _s3;
}

const BUCKET = process.env.R2_BUCKET_NAME || "tiqui-images";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://images.tiqui.cl";

export async function uploadImage(
  file: Buffer,
  contentType: string,
  folder: string = "eventos"
): Promise<string> {
  const ext = contentType.split("/")[1] || "jpg";
  const key = `${folder}/${uuid()}.${ext}`;

  await getS3().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return `${PUBLIC_URL}/${key}`;
}
