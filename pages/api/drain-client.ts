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
    await prisma.logEntry.create({
      data: {
        source: 'client',
        // We're open to accept anything from navigator.sendBeacon()
        request: req.body,
      },
    })

    res.status(201).json({ success: true })
  }
}
