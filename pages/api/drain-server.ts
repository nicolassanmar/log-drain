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
    const body = Array.isArray(req.body) ? req.body : [req.body]

    for (const item of body) {
      await prisma.logEntry.create({
        data: {
          source: item.label,
          request: item,
        },
      })
    }

    res.status(201).json({ success: true })
  }
}
