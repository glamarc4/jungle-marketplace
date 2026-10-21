import type { NftArtworkVariant, NftEdition } from "../data/nft-details"

export type CartItem = {
  key: string
  nftId: string
  name: string
  tokenId: string
  artwork: NftArtworkVariant
  edition: NftEdition
  unitPriceMicroEth: number
  quantity: number
}

