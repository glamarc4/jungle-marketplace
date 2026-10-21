import type { Database } from './database'
import type { Order } from '../../domain/api'
import { initialAvailability, type NftEvent, type OrderEvent, type NftEdition } from '../../realtime/contracts'
import { canonicalId } from './nfts'

export type RealtimeData = {
  nfts: Record<string, NftEvent>
  capabilities: Record<string, string>
  orderVersions: Record<string, number>
  outbox: { userId: string; event: OrderEvent }[]
}
export function realtimeData(db: Database): RealtimeData {
  return db.realtime ??= { nfts: {}, capabilities: {}, orderVersions: {}, outbox: [] }
}
export function availability(db: Database, id: string) {
  return db.realtime?.nfts[canonicalId(id)]?.payload.availability ?? initialAvailability()
}
export function unavailableItems(db: Database) {
  return db.cart.items.filter(item => !availability(db, item.nftId)[item.edition]).map(item => item.key)
}
export function editionAvailable(db: Database, id: string, edition: NftEdition) { return availability(db, id)[edition] }
export function queueOrderEvent(db: Database, userId: string, order: Order, type: OrderEvent['type']) {
  const data = realtimeData(db)
  const version = (data.orderVersions[order.orderId] ?? 0) + 1
  data.orderVersions[order.orderId] = version
  data.outbox.push({ userId, event: { protocol: 1, eventId: crypto.randomUUID(), type, entityId: order.orderId, version, occurredAt: new Date().toISOString(), payload: { status: order.status } } })
}
