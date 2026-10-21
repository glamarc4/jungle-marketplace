
import { Link, useParams } from "@tanstack/react-router"

import { NftGallery } from "@/components/nft/NftGallery"
import { NftPurchasePanel } from "@/components/nft/NftPurchasePanel"
import { NftInformationTabs } from "@/components/nft/NftInformationTabs"
import { RelatedNfts } from "@/components/nft/RelatedNfts"

import { useNft } from "@/hooks/use-api"
import { RequestState } from "@/components/RequestState"

export function NftDetailPage() {
  const { nftId } = useParams({
    from: "/nft/$nftId",
  })

  const query = useNft(nftId)
  const nft = query.data
  if (query.isPending || query.isError) return <RequestState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />

  if (!nft) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center gap-5 px-4 text-center font-mono sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-foreground">
          NFT não encontrado
        </h1>

        <p className="text-sm text-kurio-text-secondary">
          Não encontramos um NFT com esse identificador.
        </p>

        <Link
          to="/"
          className="rounded-md bg-kurio-primary px-5 py-3 text-sm font-bold text-kurio-ink"
        >
          Voltar para o início
        </Link>
      </section>
    )
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <nav
          aria-label="Caminho de navegação"
          className="mb-3 font-mono text-xs font-bold text-foreground"
        >
          <Link
            to="/"
            className="transition-colors hover:text-kurio-primary"
          >
            Início
          </Link>

          <span className="mx-2 text-kurio-text-secondary">
            /
          </span>

          <span>Detalhes do NFT</span>
        </nav>

        <div className="grid items-start gap-7 lg:grid-cols-2 lg:gap-8">
          <NftGallery
            key={nft.id}
            title={nft.title}
            images={nft.gallery}
          />

          <NftPurchasePanel
            key={nft.id}
            nft={nft}
          />
        </div>

        <div className="mt-16 sm:mt-20">
          <NftInformationTabs
            key={nft.id}
            nft={nft}
          />
        </div>

        <div className="mt-16 sm:mt-20">
          <RelatedNfts
            key={nft.id}
            currentNftId={nft.id}
          />
        </div>
      </div>
    </div>
  )
}
