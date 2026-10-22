import { integerToEth } from '../domain/money-transport'
import { client } from './client'
import type { NftDetail } from '../data/nft-details'
import type { NftFilters, NftList } from '../domain/api'
export const nftsApi = {
  list: (params: NftFilters, signal?: AbortSignal) => client.get<NftList>('/nfts', { params: { ...params, minPrice: undefined, maxPrice: undefined, minPriceEth: params.minPrice === undefined ? undefined : integerToEth(params.minPrice, 2), maxPriceEth: params.maxPrice === undefined ? undefined : integerToEth(params.maxPrice, 2) }, signal }).then(r => r.data),
  detail: (id: string, signal?: AbortSignal) => client.get<NftDetail>(`/nfts/${encodeURIComponent(id)}`, { signal }).then(r => r.data),
}
