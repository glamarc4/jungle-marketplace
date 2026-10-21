import { mockNfts } from '../data/mock-nfts.ts'

export const EDITIONS = ['1/1', '1/10', '1/50', 'ABERTA'] as const
export type NftEdition = typeof EDITIONS[number]
export type Availability = Record<NftEdition, boolean>
export const initialAvailability = (): Availability => ({ '1/1': true, '1/10': true, '1/50': true, ABERTA: true })
export type OrderStatus = 'demo-confirmed' | 'demo-completed'
type Envelope<T extends string, P> = {
  protocol: 1; eventId: string; type: T; entityId: string; version: number; occurredAt: string; payload: P
}
export type NftEvent = Envelope<'nft:updated' | 'nft:availability-changed', { availability: Availability }>
export type OrderEvent = Envelope<'order:created' | 'order:status-changed', { status: OrderStatus }>
export type RealtimeEvent = NftEvent | OrderEvent
export type Ack = { ok: boolean }
export interface ServerEvents { event: (event: RealtimeEvent) => void }
export interface ClientEvents {
  sync: (callback: (events: NftEvent[]) => void) => void
  'private:publish': (event: OrderEvent, callback: (ack: Ack) => void) => void
}
export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
export const validCapability = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)
export function validEvent(value: unknown): value is RealtimeEvent {
  if (!isRecord(value) || value.protocol !== 1 || typeof value.eventId !== 'string' || !/^[a-f0-9-]{36}$/.test(value.eventId) || typeof value.entityId !== 'string' || !Number.isSafeInteger(value.version) || Number(value.version) < 1 || typeof value.occurredAt !== 'string' || !Number.isFinite(Date.parse(value.occurredAt)) || !isRecord(value.payload)) return false
  if (value.type === 'nft:updated' || value.type === 'nft:availability-changed') {
    const availability = value.payload.availability
    return mockNfts.some(nft => nft.id === value.entityId) && isRecord(availability) && Object.keys(value.payload).length === 1 && Object.keys(availability).length === EDITIONS.length && EDITIONS.every(edition => typeof availability[edition] === 'boolean')
  }
  return (value.type === 'order:created' || value.type === 'order:status-changed') && /^DEMO-[a-f0-9-]{36}$/.test(value.entityId) && Object.keys(value.payload).length === 1 && ['demo-confirmed', 'demo-completed'].includes(String(value.payload.status))
}
export function eventKey(event: RealtimeEvent) { return `${event.type.startsWith('nft:') ? 'nft' : 'order'}:${event.entityId}` }
