import { client } from './client'
import type { NftDetail } from '../data/nft-details'
import type { NftFilters, NftList } from '../domain/api'
export const nftsApi = {
  list: (params: NftFilters, signal?: AbortSignal) => client.get<NftList>('/nfts', { params, signal }).then(r => r.data),
  detail: (id: string, signal?: AbortSignal) => client.get<NftDetail>(`/nfts/${encodeURIComponent(id)}`, { signal }).then(r => r.data),
}
