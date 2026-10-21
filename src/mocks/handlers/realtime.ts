import { http, HttpResponse } from 'msw'
import { account, validSession } from '../data/database'
import { realtimeData } from '../data/realtime'
import { validEvent } from '../../realtime/contracts'
import { body, requireValue, respond } from './http'

export const realtimeHandlers = [
  http.get('/api/realtime/session', () => respond(true, db => {
    const session = validSession(db)
    if (!session) return { capability: null }
    const data = realtimeData(db)
    const capability = data.capabilities[session.userId] ??= Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('')
    return { capability }
  })),
  http.post('/api/realtime/events', ({ request }) => {
    if (!import.meta.env.DEV) return HttpResponse.json({ message: 'Ponte disponível apenas em desenvolvimento.' }, { status: 404 })
    return respond(true, async db => {
      const event = await body(request)
      requireValue(validEvent(event), 'Evento inválido.')
      if (event.type === 'nft:updated' || event.type === 'nft:availability-changed') {
        const data = realtimeData(db)
        const previous = data.nfts[event.entityId]
        if (previous && (event.eventId === previous.eventId || event.version <= previous.version)) return { applied: false }
        data.nfts[event.entityId] = event
        return { applied: true }
      }
      requireValue(validSession(db), 'Sessão inválida.', 401)
      // Private messages are hints only. Never accept remote status/prices as persisted truth.
      return { applied: account(db).orders.some(order => order.orderId === event.entityId) }
    })
  }),
  http.get('/api/realtime/outbox', () => respond(false, db => {
    const session = validSession(db)
    requireValue(session, 'Sessão inválida.', 401)
    return (db.realtime?.outbox ?? []).filter(item => item.userId === session.userId).map(item => item.event)
  })),
  http.delete('/api/realtime/outbox/:id', ({ params }) => respond(true, db => {
    const session = validSession(db)
    requireValue(session, 'Sessão inválida.', 401)
    const data = realtimeData(db)
    data.outbox = data.outbox.filter(item => item.userId !== session.userId || item.event.eventId !== params.id)
    return { ok: true }
  })),
]
