import { client } from './client'
import type { OrderEvent, RealtimeEvent } from '../realtime/contracts'
export const realtimeApi = {
  session: () => client.get<{ capability: string | null }>('/realtime/session').then(r => r.data),
  apply: (event: RealtimeEvent) => client.post<{ applied: boolean }>('/realtime/events', event).then(r => r.data.applied),
  outbox: () => client.get<OrderEvent[]>('/realtime/outbox').then(r => r.data),
  acknowledge: (id: string) => client.delete(`/realtime/outbox/${encodeURIComponent(id)}`).then(() => undefined),
}
