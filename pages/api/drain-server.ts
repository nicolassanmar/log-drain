import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

type Data = {
  success: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method === 'POST') {
    // TODO: expecting the JSON payload which is an array
    for (const item of req.body) {
      await prisma.logEntry.create({
        data: {
          source: item.source,
          request: item,
        },
      })
    }

    res.status(201).json({ success: true })
  }
}
