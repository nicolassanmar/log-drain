import Head from 'next/head'

// TODO: have the api host change depending on environment (process.env.APP_HOST)
const apiHost = 'https://drain-test.vercel.app'

const sampleItem = JSON.stringify({
  source: 'someSource',
  someField: 'someValue',
  anotherField: 'anotherValue',
})

const endpoints = [
  {
    method: 'POST',
    path: '/api/drain-server',
    misc: `-d '[${sampleItem}]' -H "Content-Type: application/json"`,
  },
  {
    method: 'POST',
    path: '/api/drain-client',
    misc: `-d '${sampleItem}' -H "Content-Type: application/json"`
  },
  {
    method: 'POST',
    path: '/api/backup',
    misc: `-H "Authorization: Bearer ${process.env.NEXT_PUBLIC_API_SECRET_KEY}"`,
  },
]

export default function Home() {
  return (
    <main>
      <Head>
        <title>Drain Test</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {endpoints.map((e) => (
        <article key={e.path}>
          <code>{`[${e.method}] ${e.path}`}</code>
          <code>{`curl ${apiHost}${e.path} -X ${e.method} ${e.misc}`}</code>
        </article>
      ))}
    </main>
  )
}
