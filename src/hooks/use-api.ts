import { useMutation, useQuery, useQueryClient, useIsMutating } from '@tanstack/react-query'
import { keys } from '../api/query-client'
import { nftsApi } from '../api/nfts'
import { authApi } from '../api/auth'
import { cartApi } from '../api/cart'
import { profileApi } from '../api/profile'
import { walletsApi } from '../api/wallets'
import { ordersApi } from '../api/orders'
import type { NftFilters, Session, Cart } from '../domain/api'

export function useNfts(filters: NftFilters = {}) { return useQuery({ queryKey: [...keys.nfts, filters], queryFn: ({ signal }) => nftsApi.list(filters, signal) }) }
export function useNft(id: string) { return useQuery({ queryKey: [...keys.nfts, 'detail', id], queryFn: ({ signal }) => nftsApi.detail(id, signal) }) }
export function useSession() {
  const cache = useQueryClient()
  return useQuery({ queryKey: keys.session, refetchInterval: 15_000, queryFn: async ({ signal }) => {
    const session = await authApi.me(signal)
    if (!signal.aborted && cache.getQueryData<Session | null>(keys.session)?.userId !== session?.userId) {
      await cache.cancelQueries({ queryKey: ['account'] })
      cache.removeQueries({ queryKey: ['account'] })
    }
    return session
  } })
}
export function useAuth(mode: 'login' | 'register' | 'logout') {
  const client = useQueryClient()
  return useMutation({ mutationFn: mode === 'logout' ? authApi.logout : authApi[mode], onSuccess: async (session: Session | null) => {
    await client.cancelQueries({ queryKey: keys.session })
    client.setQueryData(keys.session, session)
    await client.cancelQueries({ queryKey: ['account'] })
    client.removeQueries({ queryKey: ['account'] })
    client.setQueryData(keys.session, session)
    await client.invalidateQueries({ queryKey: ['account'] })
  } })
}
export function useCartQuery() { return useQuery({ queryKey: keys.cart, queryFn: ({ signal }) => cartApi.get(signal) }) }
function useCartMutation<T>(mutationFn: (input: T) => Promise<Cart>) {
  const client = useQueryClient()
  return useMutation({ mutationKey: keys.cart, scope: { id: 'cart' }, mutationFn,
    onMutate: () => client.cancelQueries({ queryKey: keys.cart }),
    onSuccess: data => { client.setQueryData(keys.cart, data) },
    onSettled: () => client.invalidateQueries({ queryKey: keys.cart }),
  })
}
export function useAddCartItem() { return useCartMutation(cartApi.add) }
export function useUpdateCartItem() { return useCartMutation(cartApi.update) }
export function useRemoveCartItem() { return useCartMutation(cartApi.remove) }
export function useCoupon() { return useCartMutation(cartApi.coupon) }
export function useCartBusy() { return useIsMutating({ mutationKey: keys.cart }) > 0 }
export function useProfile() {
  const session = useSession()
  return useQuery({ queryKey: [...keys.profile, session.data?.userId ?? 'guest'], queryFn: ({ signal }) => profileApi.get(signal), enabled: !!session.data })
}
export function useSaveProfile() {
  const client = useQueryClient()
  return useMutation({ mutationFn: profileApi.update, onSuccess: async () => {
    await Promise.all([client.invalidateQueries({ queryKey: keys.profile }), client.invalidateQueries({ queryKey: keys.session })])
  } })
}
export function useWallets() {
  const session = useSession()
  return useQuery({ queryKey: [...keys.wallets, session.data?.userId ?? 'guest'], queryFn: ({ signal }) => walletsApi.list(signal), enabled: !!session.data })
}
function useWalletMutation<T, R>(mutationFn: (input: T) => Promise<R>) {
  const client = useQueryClient()
  return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: keys.wallets }) })
}
export function useCreateWallet() { return useWalletMutation(walletsApi.create) }
export function useUpdateWallet() { return useWalletMutation(walletsApi.update) }
export function useDeleteWallet() { return useWalletMutation(walletsApi.remove) }
export function useCreateOrder() {
  const client = useQueryClient()
  return useMutation({ mutationFn: ordersApi.create, onSuccess: async order => {
    client.setQueryData([...keys.orders, client.getQueryData<Session>(keys.session)?.userId, 'detail', order.orderId], order)
    await Promise.all([client.invalidateQueries({ queryKey: keys.cart }), client.invalidateQueries({ queryKey: keys.orders })])
  } })
}
export function useOrders() {
  const session = useSession()
  return useQuery({ queryKey: [...keys.orders, session.data?.userId, 'list'], queryFn: ({ signal }) => ordersApi.list(signal), enabled: !!session.data })
}
export function useOrder(id: string) {
  const session = useSession()
  return useQuery({ queryKey: [...keys.orders, session.data?.userId, 'detail', id], queryFn: ({ signal }) => ordersApi.get(id, signal), enabled: !!session.data && !!id })
}
