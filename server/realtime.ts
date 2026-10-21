import { createServer, type IncomingMessage } from 'node:http'
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises'
import { dirname } from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import { Server } from 'socket.io'
import { EDITIONS, initialAvailability, validEvent, validCapability, isRecord, eventKey, type ClientEvents, type ServerEvents, type NftEvent, type RealtimeEvent } from '../src/realtime/contracts.ts'
import { mockNfts } from '../src/data/mock-nfts.ts'

export async function createRealtimeServer(options: { port?: number; file: string; origins?: string[] }) {
  const isProduction = process.env.NODE_ENV === 'production'
  const latest: Record<string, NftEvent> = {}
  try {
    const saved: unknown = JSON.parse(await readFile(options.file, 'utf8'))
    if (!Array.isArray(saved) || !saved.every(event => validEvent(event) && event.type.startsWith('nft:'))) throw new Error('Registro realtime inválido; restaure o arquivo, não reinicie versões.')
    for (const event of saved as NftEvent[]) latest[event.entityId] = event
  } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
  const origins = options.origins ?? ['http://localhost:5173', 'http://127.0.0.1:5173']
  const allowed = (request: IncomingMessage) => !request.headers.origin || origins.includes(request.headers.origin)
  let serial: Promise<unknown> = Promise.resolve()
  const httpServer = createServer((request, response) => {
    // No browser admin API. Only the local CLI (no Origin) can send commands.
    if (
      isProduction ||
      request.method !== 'POST' ||
      request.url !== '/dev/command' ||
      request.headers.origin ||
      !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(
        request.socket.remoteAddress ?? '',
      )
    ) {
      response.writeHead(404).end(); return
    }
    let source = ''
    request.on('data', chunk => { source += chunk; if (source.length > 4096) request.destroy() })
    request.on('end', () => {
      const work = async () => {
        try {
          const input: unknown = JSON.parse(source)
          if (!isRecord(input)) throw new Error('Comando inválido')
          if (input.action === 'disconnect') {
            for (const socket of io.sockets.sockets.values()) socket.conn.close()
            return { disconnected: true }
          }
          if (typeof input.nftId !== 'string' || !mockNfts.some(nft => nft.id === input.nftId)) throw new Error('NFT inválido')
          const previous = latest[input.nftId]
          if (input.action === 'duplicate' || input.action === 'old') {
            if (!previous) throw new Error('Altere a disponibilidade primeiro')
            const replay = input.action === 'duplicate' ? previous : { ...previous, eventId: randomUUID(), version: Math.max(1, previous.version - 1) }
            io.emit('event', replay)
            return replay
          }
          if (input.action !== 'set' || !EDITIONS.includes(input.edition as typeof EDITIONS[number]) || typeof input.available !== 'boolean') throw new Error('Use set, NFT, edição e disponibilidade booleana')
          const event: NftEvent = {
            protocol: 1, eventId: randomUUID(), type: input.type === 'nft:updated' ? 'nft:updated' : 'nft:availability-changed',
            entityId: input.nftId, version: (previous?.version ?? 0) + 1, occurredAt: new Date().toISOString(),
            payload: { availability: { ...(previous?.payload.availability ?? initialAvailability()), [String(input.edition)]: input.available } },
          }
          // Write the authoritative command snapshot before broadcasting. No phantom success.
          const next = { ...latest, [event.entityId]: event }
          await mkdir(dirname(options.file), { recursive: true })
          await writeFile(options.file + '.tmp', JSON.stringify(Object.values(next)), 'utf8')
          await rename(options.file + '.tmp', options.file)
          latest[event.entityId] = event
          io.emit('event', event)
          return event
        } catch (error) {
          response.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ message: error instanceof Error ? error.message : 'Erro' }))
          return undefined
        }
      }
      const pending = serial.then(work, work)
      serial = pending.catch(() => undefined)
      void pending.then(result => { if (result) response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(result)) })
    })
  })
  const io = new Server<ClientEvents, ServerEvents>(httpServer, {
    cors: { origin: origins }, allowRequest: (request, callback) => callback(null, allowed(request)), maxHttpBufferSize: 16_384,
  })
  io.use((socket, next) => {
    const auth: unknown = socket.handshake.auth
    // A bearer capability is the private room password, never a userId or public room name.
    if (!isRecord(auth) || Object.keys(auth).some(key => key !== 'capability') || (auth.capability !== undefined && auth.capability !== null && !validCapability(auth.capability))) return next(new Error('Credencial realtime inválida'))
    const capability = auth.capability
    if (validCapability(capability)) socket.data.room = 'private:' + createHash('sha256').update(capability).digest('hex')
    next()
  })
  const privateVersions = new Map<string, number>()
  io.on('connection', socket => {
    const room: string | undefined = socket.data.room
    if (room) void socket.join(room)
    socket.on('sync', callback => { if (typeof callback === 'function') callback(Object.values(latest)) })
    socket.on('private:publish', (value: RealtimeEvent, callback) => {
      if (typeof callback !== 'function') return
      if (!room || !validEvent(value) || !value.type.startsWith('order:')) { callback({ ok: false }); return }
      const key = room + ':' + eventKey(value)
      if (value.version > (privateVersions.get(key) ?? 0)) {
        privateVersions.set(key, value.version)
        io.to(room).emit('event', value)
      }
      callback({ ok: true })
    })
  })
  await new Promise<void>((resolve, reject) => {
    httpServer.once('error', reject)
    httpServer.listen(
      options.port ?? 3001,
      isProduction ? '0.0.0.0' : '127.0.0.1',
      resolve,
    )
  })
  const address = httpServer.address()
  if (!address || typeof address === 'string') throw new Error('Porta indisponível')
  return { io, url: `http://127.0.0.1:${address.port}`, close: () => new Promise<void>(resolve => io.close(() => resolve())) }
}
