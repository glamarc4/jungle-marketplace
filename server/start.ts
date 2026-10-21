
import { createRealtimeServer } from './realtime.ts'

const port = Number(
  process.env.PORT ?? process.env.REALTIME_PORT ?? 3001,
)

const file =
  process.env.REALTIME_DATA_FILE ??
  '.realtime/availability.json'

const origins = process.env.REALTIME_ORIGINS
  ?.split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

if (process.env.NODE_ENV === 'production' && !origins?.length) {
  throw new Error(
    'REALTIME_ORIGINS deve conter a URL do frontend em produção.',
  )
}

const server = await createRealtimeServer({
  port,
  file,
  origins,
})

console.log(`Kurio Socket.IO: ${server.url}`)

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    void server.close().then(() => process.exit(0))
  })
}
