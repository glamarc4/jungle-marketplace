
import { useState } from "react"
import { Star } from "lucide-react"

import type { NftDetail } from "@/data/nft-details"

type NftInformationTabsProps = {
  nft: NftDetail
}

type ActiveTab = "details" | "reviews"

export function NftInformationTabs({
  nft,
}: NftInformationTabsProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("details")

  return (
    <section className="font-mono">
      <div
        role="tablist"
        aria-label="Informações do NFT"
        className="flex flex-wrap gap-6 border-b border-kurio-border"
      >
        <button
          id="nft-details-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "details"}
          aria-controls="nft-information-panel"
          onClick={() => setActiveTab("details")}
          className={`border-b-2 pb-2 text-xs sm:text-sm ${
            activeTab === "details"
              ? "border-kurio-primary font-bold text-kurio-primary"
              : "border-transparent text-foreground hover:text-kurio-primary"
          }`}
        >
          Detalhes do NFT
        </button>

        <button
          id="nft-reviews-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "reviews"}
          aria-controls="nft-information-panel"
          onClick={() => setActiveTab("reviews")}
          className={`border-b-2 pb-2 text-xs sm:text-sm ${
            activeTab === "reviews"
              ? "border-kurio-primary font-bold text-kurio-primary"
              : "border-transparent text-foreground hover:text-kurio-primary"
          }`}
        >
          Avaliações de colecionadores ({nft.reviewCount})
        </button>
      </div>

      <div
        id="nft-information-panel"
        role="tabpanel"
        aria-labelledby={
          activeTab === "details"
            ? "nft-details-tab"
            : "nft-reviews-tab"
        }
        className="min-h-52 pt-4 text-xs leading-6 text-kurio-text-secondary sm:text-sm"
      >
        {activeTab === "details" ? (
          <div className="space-y-4">
            <p>
              {nft.title} é uma obra digital da coleção Kurio
              Editions. Cada atributo fica armazenado nos metadados
              do token e verificado na Ethereum. A obra explora
              identidade, movimento e luz em um mundo digital sem
              fronteiras.
            </p>

            <p>
              A propriedade inclui a arte em alta resolução,
              lançamentos exclusivos para colecionadores e um
              registro permanente de procedência registrado na
              rede. Nova Sato recebe 5% de direitos autorais nas
              vendas secundárias, apoiando novos trabalhos e
              lançamentos da comunidade.
            </p>

            <div>
              <strong className="block text-foreground">Rede:</strong>
              <p>
                Cunhado na Ethereum com procedência imutável e
                metadados armazenados no IPFS.
              </p>
            </div>

            <div>
              <strong className="block text-foreground">
                Contrato:
              </strong>
              <p>
                Direitos autorais do criador: 5% nas vendas
                secundárias, pagos automaticamente pelos mercados
                compatíveis.
              </p>
            </div>

            <div>
              <strong className="block text-foreground">
                Direitos autorais:
              </strong>
              <p>
                0x7A42...19E8 · Contrato inteligente ERC-721
                verificado.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="flex text-kurio-primary"
                aria-label={`${nft.rating} de 5 estrelas`}
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className="size-4"
                    fill={
                      index < nft.rating
                        ? "currentColor"
                        : "none"
                    }
                    aria-hidden="true"
                  />
                ))}
              </div>

              <span>
                {nft.reviewCount} avaliações de colecionadores
              </span>
            </div>

            <p>
              As avaliações individuais estarão disponíveis
              quando conectarmos os dados de colecionadores à
              API da Kurio.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
