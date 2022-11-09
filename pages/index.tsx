import getConfig from 'next/config'
import Head from 'next/head'

const { publicRuntimeConfig } = getConfig()

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
    misc: `-H "Authorization: Bearer ${publicRuntimeConfig.apiSecretKey}"`,
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
          <code>{`curl ${publicRuntimeConfig.apiHost}${e.path} -X ${e.method} ${e.misc}`}</code>
        </article>
      ))}
    </main>
  )
}
