import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client } from '../api/client'
import { keys } from '../api/query-client'
import type { Session } from '../domain/api'
import { useSession } from './use-api'

export function useFavorites() {
  const session = useSession()
  const cache = useQueryClient()
  const owner = session.data?.userId
  const queryKey = ['account', 'favorites', owner]
  const headers = { 'X-Account-Id': owner }
  const current = () => !!owner && cache.getQueryData<Session | null>(keys.session)?.userId === owner
  const query = useQuery({ queryKey, enabled: !!owner,
    queryFn: ({ signal }) => client.get<string[]>('/favorites', { signal, headers }).then(r => r.data),
  })
  const mutation = useMutation({
    mutationFn: ({ id, selected }: { id: string; selected: boolean }) => {
      if (!current()) throw new Error('Entre na sua conta para favoritar.')
      return client.request<string[]>({ url: `/favorites/${encodeURIComponent(id)}`, method: selected ? 'PUT' : 'DELETE', headers }).then(r => r.data)
    },
    onMutate: async ({ id, selected }) => {
      await cache.cancelQueries({ queryKey })
      const previous = cache.getQueryData<string[]>(queryKey)
      if (current()) cache.setQueryData(queryKey, selected ? [...new Set([...(previous ?? []), id])] : previous?.filter(value => value !== id) ?? [])
      return { previous }
    },
    onError: (_error, _variables, context) => { if (current()) cache.setQueryData(queryKey, context?.previous ?? []) },
    onSuccess: data => { if (current()) cache.setQueryData(queryKey, data) },
    onSettled: () => { if (current()) return cache.invalidateQueries({ queryKey }) },
  })
  return { query, mutation, authenticated: !!owner }
}
