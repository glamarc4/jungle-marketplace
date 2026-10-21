import { client } from './client'
import type { Cart } from '../domain/api'
import type { NftEdition } from '../data/nft-details'
export const cartApi = {
  get: (signal?: AbortSignal) => client.get<Cart>('/cart', { signal }).then(r => r.data),
  add: (input: { nftId: string; edition: NftEdition; quantity: number }) => client.post<Cart>('/cart/items', input).then(r => r.data),
  update: (input: { key: string; quantity: number }) => client.patch<Cart>(`/cart/items/${encodeURIComponent(input.key)}`, { quantity: input.quantity }).then(r => r.data),
  remove: (key: string) => client.delete<Cart>(`/cart/items/${encodeURIComponent(key)}`).then(r => r.data),
  coupon: (coupon: string | null) => client.patch<Cart>('/cart', { coupon }).then(r => r.data),
}
