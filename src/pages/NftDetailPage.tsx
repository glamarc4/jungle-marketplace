
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"

import { NftGallery } from "@/components/nft/NftGallery"
import { NftPurchasePanel } from "@/components/nft/NftPurchasePanel"
import { NftInformationTabs } from "@/components/nft/NftInformationTabs"
import { RelatedNfts } from "@/components/nft/RelatedNfts"

import { useNft } from "@/hooks/use-api"
import { RequestState } from "@/components/RequestState"

export function NftDetailPage() {
  const navigate = useNavigate()

  const { nftId } = useParams({
    from: "/nft/$nftId",
  })

  const query = useNft(nftId)
  const nft = query.data

  if (query.isPending || query.isError) {
    return (
      <RequestState
        pending={query.isPending}
        error={query.error}
        retry={() => void query.refetch()}
      />
    )
  }

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
    <div className="relative w-full">
      <div className="mx-auto max-w-7xl pb-20 pt-5 md:px-6 md:pt-6 lg:px-8">
        {/* Navegação mobile */}
        <div className="mb-4 flex items-center justify-between px-5 md:hidden">
          <button
            type="button"
            aria-label="Voltar"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back()
              } else {
                void navigate({ to: "/mercado" })
              }
            }}
            className="flex size-11 items-center justify-center rounded-full border border-[#4A291D] bg-[#301C16] text-[#C8A981]"
          >
            <ChevronLeft size={23} strokeWidth={2}/>
          </button>
        </div>

        {/* Breadcrumb apenas desktop */}
        <nav
          aria-label="Caminho de navegação"
          className="mb-5 hidden items-center gap-2 font-mono text-xs font-bold md:flex"
        >
          <Link
            to="/"
            className="text-foreground transition-colors hover:text-kurio-primary"
          >
            Início
          </Link>

          <span aria-hidden="true" className="text-kurio-text-secondary">
            /
          </span>

          <span
            aria-current="page"
            className="text-kurio-text-secondary"
          >
            Mercado
          </span>
        </nav>

        {/* Galeria + informações */}
        <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="px-5 md:px-0">
            <NftGallery
              key={nft.id}
              title={nft.title}
              images={nft.gallery}
            />
          </div>

          <div className="px-5 md:px-0">
            <NftPurchasePanel
              key={nft.id}
              nft={nft}
            />
          </div>
        </div>

        {/* Conteúdo inferior preservado */}
        <div className="mt-16 px-5 md:mt-20 md:px-0">
          <NftInformationTabs
            key={nft.id}
            nft={nft}
          />
        </div>

        <div className="mt-16 px-5 md:mt-20 md:px-0">
          <RelatedNfts
            key={nft.id}
            currentNftId={nft.id}
          />
        </div>
      </div>
    </div>
  )
}
