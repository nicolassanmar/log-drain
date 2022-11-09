import type { NextApiRequest, NextApiResponse } from 'next'
import { createMocks, RequestMethod } from 'node-mocks-http'
import { prisma } from '../lib/prisma'
import { upload } from '../lib/s3';
import serverHandler from '../pages/api/drain-server'
import clientHandler from '../pages/api/drain-client'
import backupHandler from '../pages/api/backup'

jest.mock('../lib/s3', () => {
  return { upload: jest.fn() }
})

function mockApi(method: RequestMethod = 'GET') {
  const { req, res }: { req: NextApiRequest; res: NextApiResponse } =
    createMocks({ method })

  // `req.body` is supposed to be an object containing the body
  // parsed by `content-type`, or `null` if no body was sent
  // (see https://nextjs.org/docs/api-routes/request-helpers).
  // At the moment, we're expecting only JSON formatted logs.
  req.headers = { 'Content-Type': 'application/json' }
  req.body = null

  return { req, res }
}

beforeEach(async () => {
  await prisma.logEntry.deleteMany({})
})

describe('server drain', () => {
  const method = 'POST'

  test('fails when payload is not an array', async () => {
    const { req, res } = mockApi(method)
    req.body = { a: 1 }
    await serverHandler(req, res)

    expect(res.statusCode).toBe(422)
    expect(res._getJSONData()).toEqual({ success: false })

    const logEntries = await prisma.logEntry.findMany({})
    expect(logEntries.length).toBe(0)
  })

  test('stores each item in array', async () => {
    const { req, res } = mockApi(method)
    req.body = [
      { a: 1, b: 2 },
      { c: 3, d: 4, source: 'some-source' },
    ]
    await serverHandler(req, res)

    expect(res.statusCode).toBe(201)
    expect(res._getJSONData()).toEqual({ success: true })

    const logEntries = await prisma.logEntry.findMany({})
    expect(logEntries.length).toBe(2)

    expect(logEntries[0].source).toBe('unknown')
    expect(logEntries[0].request).toEqual({ a: 1, b: 2 })

    expect(logEntries[1].source).toBe('some-source')
    expect(logEntries[1].request).toEqual({
      c: 3,
      d: 4,
      source: 'some-source',
    })
  })
})

describe('client drain', () => {
  const method = 'POST'

  test('works with no request body', async () => {
    const { req, res } = mockApi(method)
    await clientHandler(req, res)

    expect(res.statusCode).toBe(201)
    expect(res._getJSONData()).toEqual({ success: true })

    const logEntries = await prisma.logEntry.findMany({})
    expect(logEntries.length).toBe(1)

    expect(logEntries[0].source).toBe('client')
    expect(logEntries[0].request).toEqual(null)
  })

  test('stores request body if present', async () => {
    const { req, res } = mockApi(method)
    req.body = { a: 1, b: 2 }
    await clientHandler(req, res)

    expect(res.statusCode).toBe(201)
    expect(res._getJSONData()).toEqual({ success: true })

    const logEntries = await prisma.logEntry.findMany({})
    expect(logEntries.length).toBe(1)

    expect(logEntries[0].source).toBe('client')
    expect(logEntries[0].request).toEqual({ a: 1, b: 2 })
  })
})

describe('backup endpoint', () => {
  const method = 'POST'
  let existing

  beforeEach(async () => {
    await prisma.logEntry.create({
      data: {
        source: 'static',
        request: { a: 1, b: 2 },
      },
    })
    await prisma.logEntry.create({
      data: {
        source: 'edge',
        request: { c: 3, d: 4 },
      },
    })

    existing = await prisma.logEntry.findMany({})
    expect(existing.length).toBe(2)
  })

  test('requires auth', async () => {
    const { req, res } = mockApi(method)
    await backupHandler(req, res)

    expect(res.statusCode).toBe(401)
    expect(res._getJSONData()).toEqual({ success: false })

    const logEntries = await prisma.logEntry.findMany({})
    expect(logEntries.length).toBe(2)
  })

  test('uploads to s3 then deletes', async () => {
    const { req, res } = mockApi(method)
    req.headers['authorization'] = 'Bearer testapisecret'
    await backupHandler(req, res)

    expect(upload).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toEqual({ success: true })

    const logEntries = await prisma.logEntry.findMany({})
    expect(logEntries.length).toBe(0)
  })
})
