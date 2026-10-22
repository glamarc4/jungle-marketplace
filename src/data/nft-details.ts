
import type { ComponentProps } from "react"
import type { MonkeyArtwork } from "@/components/home/MonkeyArtwork"

import type { Availability, NftEdition } from "../realtime/contracts"

export type { NftEdition } from "../realtime/contracts"

export type NftArtworkVariant = ComponentProps<
  typeof MonkeyArtwork
>["variant"]

export type NftDetail = {
  availability?: Availability
  id: string
  title: string
  price: string
  artwork: NftArtworkVariant
  gallery: NftArtworkVariant[]
  description: string
  tokenId: string
  collection: string
  attributes: string[]
  reviewCount: number
  rating: number
  availableEditions: NftEdition[]
}

export type RelatedNft = {
  id: string
  title: string
  price: string
  artwork: NftArtworkVariant
}

/**
 * A imagem principal do detalhe deve ser a mesma
 * utilizada no card do NFT.
 *
 * Por enquanto, repetimos a imagem principal nas
 * quatro miniaturas, pois temos um arquivo por macaco.
 */
export function createNftGallery(
  artwork: NftArtworkVariant,
): NftArtworkVariant[] {
  return Array.from({ length: 4 }, () => artwork)
}

export const emeraldApe: NftDetail = {
  id: "42",
  title: "Emerald Ape #042",
  price: "1.19",
  artwork: "gold",
  gallery: createNftGallery("gold"),
  description:
    "Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na Ethereum, com arte desbloqueável e acesso para colecionadores.",
  tokenId: "#0042",
  collection: "Kurio Apes",
  attributes: ["Óculos", "Esmeralda", "Raro"],
  reviewCount: 19,
  rating: 5,
  availableEditions: ["1/1", "1/10", "1/50", "ABERTA"],
}

export const relatedNfts: RelatedNft[] = [
  {
    id: "118",
    title: "Cosmic Bloom #118",
    price: "1.29",
    artwork: "violet",
  },
  {
    id: "314",
    title: "Violet Nomad #314",
    price: "1.39",
    artwork: "violet",
  },
  {
    id: "88",
    title: "Ivory Baron #088",
    price: "1.79",
    artwork: "emerald",
  },
  {
    id: "207",
    title: "Golden Beat #207",
    price: "0.99",
    artwork: "gold",
  },
  {
    id: "160",
    title: "Golden Signal #160",
    price: "0.39",
    artwork: "gold",
  },
]

export const nftDetailsById: Record<string, NftDetail> = {
  "42": emeraldApe,
  "042": emeraldApe,

  ...Object.fromEntries(
    relatedNfts.map((nft) => [
      nft.id,
      {
        ...emeraldApe,
        id: nft.id,
        title: nft.title,
        price: nft.price,
        artwork: nft.artwork,
        gallery: createNftGallery(nft.artwork),
        tokenId: `#${nft.id.padStart(4, "0")}`,
      },
    ]),
  ),
}
