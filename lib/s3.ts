import getConfig from 'next/config'
import { S3 } from '@aws-sdk/client-s3'

const { serverRuntimeConfig } = getConfig()

export const s3 = new S3({
  region: serverRuntimeConfig.s3Region,
  credentials: {
    accessKeyId: serverRuntimeConfig.s3AccessKeyId,
    secretAccessKey: serverRuntimeConfig.s3SecretAccessKey,
  },
})

export async function upload(key: string, body: string) {
  const input = {
    Bucket: serverRuntimeConfig.s3Bucket,
    Key: key,
    Body: body,
  }

  // TODO: handle s3 results properly
  await s3.putObject(input)
}
