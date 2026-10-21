import { client } from './client'
import type { CreateOrder, Order } from '../domain/api'
export const ordersApi = {
  create: ({ key, ...input }: CreateOrder & { key: string }) => client.post<Order>('/orders', input, { headers: { 'Idempotency-Key': key } }).then(r => r.data),
  list: (signal?: AbortSignal) => client.get<Order[]>('/orders', { signal }).then(r => r.data),
  get: (id: string, signal?: AbortSignal) => client.get<Order>(`/orders/${encodeURIComponent(id)}`, { signal }).then(r => r.data),
}
