import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { getEnvVar } from "./getEnvVar";
import path from "path";

const s3Client = new S3Client({
  region: getEnvVar("AWS_REGION"),
  credentials: {
    accessKeyId: getEnvVar("AWS_ACCESS_KEY_ID"),
    secretAccessKey: getEnvVar("AWS_SECRET_ACCESS_KEY"),
  },
});

export const uploadFileToS3 = async (
  file: Express.Multer.File
): Promise<string> => {
  const ext = path.extname(file.originalname);
  const key = `${randomUUID()}${ext}`;

  const bucketName = getEnvVar("AWS_S3_BUCKET_NAME");
  const baseUrl = getEnvVar("AWS_S3_ENDPOINT");

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  return `${baseUrl}/${key}`;
};
