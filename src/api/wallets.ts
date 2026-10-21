import { client } from './client'
import type { Wallet } from '../domain/api'
export const walletsApi = {
  list: (signal?: AbortSignal) => client.get<Wallet[]>('/wallets', { signal }).then(r => r.data),
  create: (input: Omit<Wallet, 'id'>) => client.post<Wallet>('/wallets', input).then(r => r.data),
  update: ({ id, ...input }: Partial<Wallet> & { id: string }) => client.patch<Wallet>(`/wallets/${encodeURIComponent(id)}`, input).then(r => r.data),
  remove: (id: string) => client.delete(`/wallets/${encodeURIComponent(id)}`).then(() => undefined),
}
