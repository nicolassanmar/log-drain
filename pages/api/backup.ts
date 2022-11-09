import type { NextApiRequest, NextApiResponse } from 'next'
import getConfig from 'next/config'
import { prisma } from '../../lib/prisma'
import { upload } from '../../lib/s3'

const { publicRuntimeConfig } = getConfig()

type Data =
  | {
      success: boolean
    }
  | {
      statusCode: number
      message: string
    }

// TODO: sources should be configurable
const logSources = [
  'static',
  'lambda',
  'edge',
  'build',
  'external',
  'unknown', // default value set on schema file
]

async function backupAndDelete() {
  for (const source of logSources) {
    const ts = new Date().toISOString().split('.')[0]
    const fileName = `${source}-${ts}.txt`

    const query = { where: { source: source } }
    const logEntries = await prisma.logEntry.findMany(query)

    if (logEntries.length) {
      const contents = logEntries.map((l) => JSON.stringify(l)).join('\n')

      await upload(fileName, contents)
      await prisma.logEntry.deleteMany(query)
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method === 'POST') {
    try {
      const { authorization } = req.headers

      if (authorization === `Bearer ${publicRuntimeConfig.apiSecretKey}`) {
        await backupAndDelete()

        // TODO: could be helpful to return the public s3 url as well
        res.status(200).json({ success: true })
      } else {
        res.status(401).json({ success: false })
      }
    } catch (err) {
      res
        .status(500)
        .json({ statusCode: 500, message: (err as Error).message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
