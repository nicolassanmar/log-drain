import { S3 } from '@aws-sdk/client-s3'

export const s3 = new S3({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
})

export async function upload(key: string, body: string) {
  const input = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: body,
  }

  // TODO: handle s3 results properly
  await s3.putObject(input)
}
