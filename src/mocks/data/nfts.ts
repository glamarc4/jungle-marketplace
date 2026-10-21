import { mockNfts, formatEth } from '../../data/mock-nfts'
import { emeraldApe, nftDetailsById, type NftDetail } from '../../data/nft-details'

export const nfts = mockNfts
export function canonicalId(id: string) {
  // Preserve old links, while using catalog IDs as the single source of truth.
  return ({ '42': '042', '88': '088', '160': '166' } as Record<string, string>)[id] ?? id
}
export function getNft(id: string): NftDetail | undefined {
  const nft = nfts.find(item => item.id === canonicalId(id))
  if (!nft) return undefined
  return {
    ...(nftDetailsById[nft.id] ?? emeraldApe), id: nft.id,
    title: nft.name, price: formatEth(nft.priceCents).replace(' ETH', ''),
    artwork: nft.artwork, gallery: Array.from({ length: 4 }, () => nft.artwork),
    tokenId: `#${nft.id.padStart(4, '0')}`,
  }
}
