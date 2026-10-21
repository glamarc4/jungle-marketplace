
import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
    Heart,
    Mail,
    Minus,
    Plus,
    Star,
} from "lucide-react"

import { useAddCartItem } from "@/hooks/use-api"
import { RequestState } from "@/components/RequestState"

import type { NftDetail, NftEdition } from "@/data/nft-details"

type NftPurchasePanelProps = {
    nft: NftDetail
}

export function NftPurchasePanel({ nft }: NftPurchasePanelProps) {
    const navigate = useNavigate()
    const add = useAddCartItem()

    const [quantity, setQuantity] = useState(1)
    const [edition, setEdition] = useState<NftEdition>("1/50")
    const available = nft.availability?.[edition] !== false
    const [isFavorite, setIsFavorite] = useState(() => {
        try {
            return localStorage.getItem(`kurio:favorite:${nft.id}`) === "true"
        } catch {
            return false
        }
    })

    function toggleFavorite() {
        const nextValue = !isFavorite
        setIsFavorite(nextValue)

        try {
            localStorage.setItem(
                `kurio:favorite:${nft.id}`,
                String(nextValue),
            )
        } catch {
            // O favorito continua funcionando durante a sessão.
        }
    }


    function handleBuy() {
        add.mutate({ nftId: nft.id, edition, quantity }, { onSuccess: () => { void navigate({ to: "/carrinho" }) } })
    }


    return (
        <section className="min-w-0 font-mono">
            <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                {nft.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-kurio-border pb-3">
                <strong className="text-xl text-kurio-primary">
                    {nft.price} ETH
                </strong>

                <div className="flex items-center gap-2 text-xs text-foreground">
                    <div
                        className="flex gap-0.5 text-kurio-primary"
                        aria-label={`Avaliação: ${nft.rating} de 5 estrelas`}
                    >
                        {Array.from({ length: 5 }, (_, index) => (
                            <Star
                                key={index}
                                className="size-3.5"
                                fill={index < nft.rating ? "currentColor" : "none"}
                                aria-hidden="true"
                            />
                        ))}
                    </div>
                    <span>{nft.reviewCount} avaliações de colecionadores</span>
                </div>
            </div>

            <div className="mt-3">
                <h2 className="text-sm font-bold text-foreground">
                    Sobre este NFT:
                </h2>
                <p className="mt-2 text-xs leading-6 text-kurio-text-secondary sm:text-sm">
                    {nft.description}
                </p>
            </div>

            <fieldset className="mt-3">
                <legend className="mb-2 text-sm font-bold text-foreground">
                    Edição:
                </legend>

                <div className="flex flex-wrap gap-2">
                    {nft.availableEditions.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setEdition(option)}
                            aria-pressed={edition === option}
                            aria-label={`${option}${nft.availability?.[option] === false ? " — indisponível" : ""}`}
                            disabled={nft.availability?.[option] === false}
                            className={`rounded-full border px-2 py-1 text-xs transition-colors ${edition === option
                                    ? "border-kurio-primary text-kurio-primary"
                                    : "border-kurio-border text-kurio-text-secondary hover:border-kurio-primary"
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </fieldset>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                        disabled={quantity === 1}
                        aria-label="Diminuir quantidade"
                        className="flex size-9 items-center justify-center rounded-full bg-kurio-primary text-kurio-ink disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Minus className="size-4" aria-hidden="true" />
                    </button>

                    <output
                        aria-live="polite"
                        aria-label={`Quantidade: ${quantity}`}
                        className="min-w-4 text-center text-base text-foreground"
                    >
                        {quantity}
                    </output>

                    <button
                        type="button"
                        onClick={() => setQuantity((current) => Math.min(99, current + 1))}
                        disabled={quantity === 99}
                        aria-label="Aumentar quantidade"
                        className="flex size-9 items-center justify-center rounded-full bg-kurio-primary text-kurio-ink disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Plus className="size-4" aria-hidden="true" />
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleBuy}
                        disabled={add.isPending || !available}
                        className="min-w-28 rounded-md bg-kurio-primary px-5 py-2.5 text-xs font-bold text-kurio-ink transition-opacity hover:opacity-90"
                    >
                        COMPRAR
                    </button>

                    <button
                        type="button"
                        onClick={toggleFavorite}
                        aria-pressed={isFavorite}
                        className={`inline-flex items-center gap-2 rounded-md border px-3 py-2.5 text-xs transition-colors ${isFavorite
                                ? "border-kurio-primary bg-kurio-primary/10 text-kurio-primary"
                                : "border-kurio-primary text-kurio-primary hover:bg-kurio-primary/10"
                            }`}
                    >
                        <Heart
                            className="size-4"
                            fill={isFavorite ? "currentColor" : "none"}
                            aria-hidden="true"
                        />
                        {isFavorite ? "Favoritado" : "Favoritar"}
                    </button>
                </div>
            </div>

            {!available && <p role="status" className="mt-3 text-xs text-kurio-secondary">Esta edição está indisponível. Selecione outra edição.</p>}
            <RequestState error={add.error} />
            <dl className="mt-4 space-y-2 text-xs leading-5 text-kurio-text-secondary sm:text-sm">
                <div className="flex flex-wrap gap-2">
                    <dt>ID do token:</dt>
                    <dd>{nft.tokenId}</dd>
                </div>

                <div className="flex flex-wrap gap-2">
                    <dt>Coleção:</dt>
                    <dd>{nft.collection}</dd>
                </div>

                <div className="flex flex-wrap gap-2">
                    <dt>Atributos:</dt>
                    <dd>{nft.attributes.join(", ")}</dd>
                </div>
            </dl>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-foreground">
                <strong>Compartilhar este NFT:</strong>

                <button
                    type="button"
                    onClick={() => {
                        const url = window.location.href
                        void navigator.clipboard?.writeText(url)
                    }}
                    className="inline-flex items-center gap-1 text-kurio-primary hover:underline"
                    aria-label="Copiar link deste NFT"
                >
                    <Mail className="size-4" aria-hidden="true" />
                    Copiar link
                </button>
            </div>
        </section>
    )
}
