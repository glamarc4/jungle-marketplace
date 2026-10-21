import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'
export const queryClient = new QueryClient({ defaultOptions: {
  queries: { staleTime: 30_000, retry: (count, error) => count < 1 && (!axios.isAxiosError(error) || !error.response || error.response.status >= 500) },
  mutations: { retry: false },
} })
export const keys = { nfts: ['nfts'], cart: ['cart'], session: ['session'], profile: ['account', 'profile'], wallets: ['account', 'wallets'], orders: ['account', 'orders'] } as const
