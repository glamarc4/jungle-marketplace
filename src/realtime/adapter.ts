import type { QueryClient } from '@tanstack/react-query'
import { keys } from '../api/query-client.ts'
import {
  eventKey,
  validEvent,
  type RealtimeEvent,
} from './contracts.ts'

export function createEventAdapter(
  client: QueryClient,
  persist: (event: RealtimeEvent) => Promise<boolean>,
) {
  const seen = new Set<string>()
  const versions = new Map<string, number>()

  let queue: Promise<unknown> = Promise.resolve()

  async function apply(input: unknown): Promise<boolean> {
    if (!validEvent(input)) return false

    const key = eventKey(input)

    // Ignora eventos duplicados ou com versões antigas.
    if (
      seen.has(input.eventId) ||
      input.version <= (versions.get(key) ?? 0)
    ) {
      return false
    }

    // Primeiro confirma a persistência da atualização.
    const applied = await persist(input)

    // Não marca o evento como processado se a persistência não aplicou.
    if (!applied) return false

    versions.set(key, input.version)
    seen.add(input.eventId)

    // Limita o histórico de IDs armazenados em memória.
    if (seen.size > 1024) {
      seen.delete(seen.values().next().value!)
    }

    if (input.type.startsWith('nft:')) {
      await Promise.all([
        client.invalidateQueries({
          predicate: query =>
            query.queryKey[0] === keys.nfts[0] &&
            (
              query.queryKey[1] !== 'detail' ||
              query.queryKey[2] === input.entityId ||
              (
                {
                  '042': '42',
                  '088': '88',
                  '166': '160',
                } as Record<string, string>
              )[input.entityId] === query.queryKey[2]
            ),
        }),
        client.invalidateQueries({
          queryKey: keys.cart,
        }),
      ])
    } else {
      await client.invalidateQueries({
        queryKey: keys.orders,
      })
    }

    return true
  }

  return {
    receive(input: unknown): Promise<boolean> {
      // Serializa eventos para preservar a ordem de processamento.
      const result = queue.then(() => apply(input))

      // Uma falha não pode bloquear os eventos seguintes.
      queue = result.catch(() => undefined)

      return result
    },

    async resync(): Promise<void> {
      await Promise.all(
        [
          keys.nfts,
          keys.cart,
          keys.orders,
          keys.session,
        ].map(queryKey =>
          client.invalidateQueries({ queryKey }),
        ),
      )
    },
  }
}
