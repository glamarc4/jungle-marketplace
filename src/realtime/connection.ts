import { io, type Socket } from 'socket.io-client'
import type { QueryClient } from '@tanstack/react-query'
import { realtimeApi } from '../api/realtime'
import { createEventAdapter } from './adapter'
import { validEvent, type ServerEvents, type ClientEvents } from './contracts'

// One lifecycle owner at the root. No component creates its own socket.
export function startRealtime(client: QueryClient, url: string, bridge = realtimeApi) {
  const socket: Socket<ServerEvents, ClientEvents> = io(url, { autoConnect: false, reconnection: true, reconnectionDelay: 500, reconnectionDelayMax: 5000, timeout: 3000, forceNew: true })
  let stopped = false
  let capability: string | null = null
  let flushing = false
  let retry: ReturnType<typeof setTimeout> | undefined
  const adapter = createEventAdapter(client, async event => stopped ? false : bridge.apply(event))
  const retrySync = () => {
    if (stopped || retry) return
    retry = setTimeout(() => { retry = undefined; if (socket.connected) void sync() }, 2000)
  }
  async function flush() {
    if (stopped || !socket.connected || !capability || flushing) return
    flushing = true
    try {
      for (const event of await bridge.outbox()) {
        if (stopped || !socket.connected) break
        if (!validEvent(event) || !event.type.startsWith('order:')) continue
        const result = await socket.timeout(3000).emitWithAck('private:publish', event)
        if (result.ok && !stopped) await bridge.acknowledge(event.eventId)
      }
    } catch { retrySync() }
    finally { flushing = false }
  }
  async function sync() {
    try {
      const events: unknown = await socket.timeout(3000).emitWithAck('sync')
      if (stopped || !Array.isArray(events) || events.length > 100) return
      for (const event of events) { if (stopped) return; await adapter.receive(event) }
      if (stopped) return
      await adapter.resync() // Includes private REST state: the relay does not retain private history.
      await flush()
    } catch { retrySync() }
  }
  const onEvent = (event: unknown) => { if (!stopped) void adapter.receive(event).catch(retrySync) }
  const onConnect = () => { void sync() }
  const onWrite = () => { void flush() }
  socket.on('event', onEvent)
  socket.on('connect', onConnect)
  // REST remains usable during connect_error; Socket.IO retries in the background.
  socket.on('connect_error', () => undefined)
  if (typeof window !== 'undefined') {
    window.addEventListener('kurio:database-written', onWrite)
    window.addEventListener('storage', onWrite)
  }
  const ready = bridge.session().then(session => {
    if (stopped) return
    capability = session.capability
    socket.auth = capability ? { capability } : {}
    socket.connect()
  }).catch(() => { /* Local REST errors are presented by existing queries. */ })
  return { socket, ready, sync, flush, stop() {
    stopped = true
    if (retry) clearTimeout(retry)
    socket.removeAllListeners()
    socket.disconnect()
    if (typeof window !== 'undefined') {
      window.removeEventListener('kurio:database-written', onWrite)
      window.removeEventListener('storage', onWrite)
    }
  } }
}
