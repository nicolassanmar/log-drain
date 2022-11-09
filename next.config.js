function envVar(key) {
  const val = process.env[key]
  if (!val) {
    throw `Environment variable \`${key}\` must be a non-empty string`
  } else {
    return val
  }
}

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  serverRuntimeConfig: {
    databaseUrl:       envVar('DATABASE_URL'),
    prismaLogLevels:   process.env.NODE_ENV === 'development' ? ['query'] : [],
    s3Region:          envVar('S3_REGION'),
    s3Bucket:          envVar('S3_BUCKET'),
    s3AccessKeyId:     envVar('S3_ACCESS_KEY_ID'),
    s3SecretAccessKey: envVar('S3_SECRET_ACCESS_KEY'),
  },
  publicRuntimeConfig: {
    apiHost:           envVar('APP_HOST'),
    apiSecretKey:      envVar('APP_API_SECRET_KEY'),
  }
}
module.exports = nextConfig
