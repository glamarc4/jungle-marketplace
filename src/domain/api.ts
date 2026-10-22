import { toMoneyTransport } from './money-transport'
import type { OrderStatus } from "../realtime/contracts"
import type { Nft } from '../data/mock-nfts'
import type { CartItem } from './cart'
import type { CollectorFormValues } from './collector'
import type { WalletValues } from './wallet'
import type { calculateTotals } from './money'

export type Session = { userId: string; email: string }
export type Credentials = { email: string; password: string; username?: string }
export type Wallet = WalletValues & { id: string; primary: boolean }
export type Totals = ReturnType<typeof calculateTotals>
export type Cart = Totals & { items: CartItem[]; coupon: string | null; unavailableItems?: string[] }
export type Order = Totals & {
  orderId: string; date: string; createdAt: string; status: OrderStatus
  wallet: string; walletAddress: string; network: string; items: CartItem[]; coupon: string | null
}
export type CreateOrder = { collector: CollectorFormValues; selectedWallet: string; cartSignature: string }
export type NftFilters = {
  page?: number; pageSize?: number; search?: string; collection?: string | null
  network?: string | null; minPrice?: number; maxPrice?: number; sort?: string; tab?: string
}
export type NftList = {
  items: Nft[]; total: number; page: number; totalPages: number
  facets: { collections: Record<string, number>; networks: Record<string, number> }
}
export function cartSignature(cart: Cart) {
  return JSON.stringify(toMoneyTransport({ items: cart.items.map(({ key, quantity, unitPriceMicroEth }) => ({ key, quantity, unitPriceMicroEth })), coupon: cart.coupon }))
}
