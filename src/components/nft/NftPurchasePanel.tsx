
import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  Check,
  Copy,
  Heart,
  Mail,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react"

import { useFavorites } from "@/hooks/use-favorites"
import { useAddCartItem } from "@/hooks/use-api"
import { RequestState } from "@/components/RequestState"

import type { NftDetail, NftEdition } from "@/data/nft-details"

type NftPurchasePanelProps = {
  nft: NftDetail
}

/**
 * Multiplica valores decimais usando BigInt para evitar
 * imprecisão de ponto flutuante em valores de ETH.
 */
function multiplyEth(price: string | number, quantity: number) {
  const value = String(price).trim()
  const match = /^(\d+)(?:\.(\d+))?$/.exec(value)

  if (!match) {
    return value
  }

  const integerPart = match[1]
  const decimalPart = match[2] ?? ""
  const scale = 10n ** BigInt(decimalPart.length)

  const units =
    BigInt(integerPart) * scale +
    BigInt(decimalPart || "0")

  const total = units * BigInt(quantity)

  if (decimalPart.length === 0) {
    return total.toString()
  }

  const whole = total / scale
  const remainder = total % scale

  const fractional = remainder
    .toString()
    .padStart(decimalPart.length, "0")
    .replace(/0+$/, "")

  return fractional
    ? `${whole}.${fractional}`
    : whole.toString()
}

export function NftPurchasePanel({
  nft,
}: NftPurchasePanelProps) {
  const navigate = useNavigate()
  const add = useAddCartItem()
  const favorites = useFavorites()

  const [quantity, setQuantity] = useState(1)
  const [edition, setEdition] = useState<NftEdition>(() => {
    const preferred = nft.availableEditions.find(
      (option) =>
        option === "1/50" &&
        nft.availability?.[option] !== false,
    )

    return (
      preferred ??
      nft.availableEditions.find(
        (option) => nft.availability?.[option] !== false,
      ) ??
      nft.availableEditions[0] ??
      "1/50"
    )
  })

  const [copied, setCopied] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const available = nft.availability?.[edition] !== false

  const isFavorite =
    favorites.authenticated &&
    (favorites.query.data?.includes(nft.id) ?? false)

  const totalPrice = multiplyEth(nft.price, quantity)

  function toggleFavorite() {
    if (!favorites.authenticated) {
      void navigate({ to: "/entrar" })
      return
    }

    if (!favorites.mutation.isPending) {
      favorites.mutation.mutate({
        id: nft.id,
        selected: !isFavorite,
      })
    }
  }

  function addToCart(navigateAfterAdd: boolean) {
    if (add.isPending || !available) return

    setAddedToCart(false)

    add.mutate(
      {
        nftId: nft.id,
        edition,
        quantity,
      },
      {
        onSuccess: () => {
          if (navigateAfterAdd) {
            void navigate({ to: "/carrinho" })
          } else {
            setAddedToCart(true)
          }
        },
      },
    )
  }

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1))
    setAddedToCart(false)
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(99, current + 1))
    setAddedToCart(false)
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(
        window.location.href,
      )
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  function handleShare(
    platform: "linkedin" | "twitter" | "email",
  ) {
    const url = window.location.href
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(nft.title)

    if (platform === "email") {
      window.location.href =
        `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
      return
    }

    const shareUrl =
      platform === "linkedin"
        ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        : `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`

    window.open(
      shareUrl,
      "_blank",
      "noopener,noreferrer",
    )
  }

  return (
    <section className="flex min-w-0 flex-col font-mono lg:h-full lg:justify-between">
      {/* Favorito superior: somente mobile.
          Posicionado em relação à página de detalhes. */}
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={favorites.mutation.isPending}
        aria-label={
          isFavorite
            ? "Remover NFT dos favoritos"
            : "Adicionar NFT aos favoritos"
        }
        aria-pressed={isFavorite}
        className="absolute right-5 top-5 z-20 flex size-11 items-center justify-center rounded-full border border-[#4A291D] bg-[#301C16] text-[#D28A4C] transition-colors active:scale-95 disabled:opacity-50 md:hidden"
      >
        <Heart
          size={23}
          strokeWidth={1.7}
          fill={isFavorite ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </button>

      <div>
        {/* Título e avaliação: mobile */}
        <div className="flex items-center justify-between gap-3 md:hidden">
          <h1 className="min-w-0 text-[22px] font-bold leading-tight tracking-tight text-foreground">
            {nft.title}
          </h1>

          <div
            className="flex shrink-0 items-center gap-1 rounded-full border border-[#D28A4C] px-2 py-1 text-[12px] text-foreground"
            aria-label={`Avaliação ${nft.rating} de 5, ${nft.reviewCount} avaliações`}
          >
            <Star
              size={14}
              fill="#D28A4C"
              color="#D28A4C"
              aria-hidden="true"
            />
            <span>{nft.rating}</span>
            <span className="text-[#C8A981]">
              ({nft.reviewCount})
            </span>
          </div>
        </div>

        {/* Título, preço e avaliações: desktop */}
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-[28px]">
            {nft.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-3">
            <strong className="text-xl font-bold text-kurio-primary">
              {nft.price} ETH
            </strong>

            <div className="flex items-center gap-2 text-[11px] text-foreground">
              <div
                className="flex gap-0.5 text-kurio-primary"
                aria-label={`Avaliação: ${nft.rating} de 5 estrelas`}
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className="size-3.5"
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
          </div>
        </div>

        {/* Descrição */}
        <div className="mt-4 md:mt-4">
          <h2 className="hidden text-sm font-bold text-foreground md:block">
            Sobre este NFT:
          </h2>

          <p className="text-[13px] leading-6 text-[#C8A981] md:mt-1.5 md:text-xs md:leading-5 md:text-kurio-text-secondary">
            {nft.description}
          </p>
        </div>

        {/* Edições */}
        <fieldset className="mt-5 md:mt-4">
          <legend className="mb-2 text-[15px] font-bold text-foreground md:text-sm">
            Edição:
          </legend>

          <div className="flex flex-wrap gap-2">
            {nft.availableEditions.map((option) => {
              const isSelected = edition === option
              const isUnavailable =
                nft.availability?.[option] === false

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setEdition(option)
                    setAddedToCart(false)
                  }}
                  aria-pressed={isSelected}
                  aria-label={`${option}${isUnavailable ? " — indisponível" : ""}`}
                  disabled={isUnavailable}
                  className={[
                    "rounded-full border transition-colors",
                    "min-h-8 px-3 py-1 text-[12px]",
                    "md:min-h-7 md:text-[11px]",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kurio-primary",
                    isSelected
                      ? "border-[#D28A4C] bg-[#D28A4C]/10 text-[#D28A4C]"
                      : "border-[#4A291D] text-[#C8A981] hover:border-[#D28A4C]",
                    isUnavailable
                      ? "cursor-not-allowed opacity-40"
                      : "",
                  ].join(" ")}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* Compra original: somente desktop */}
        <div className="mt-5 hidden flex-wrap items-center justify-between gap-4 md:flex">
          <div
            role="group"
            aria-label="Selecionar quantidade"
            className="inline-flex h-10 items-center gap-3 rounded-full border border-kurio-border-soft px-1"
          >
            <button
              type="button"
              onClick={decreaseQuantity}
              disabled={quantity === 1}
              aria-label="Diminuir quantidade"
              className="flex size-8 items-center justify-center rounded-full bg-kurio-primary text-kurio-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>

            <output
              aria-live="polite"
              aria-label={`Quantidade: ${quantity}`}
              className="min-w-4 text-center text-sm font-bold text-foreground"
            >
              {quantity}
            </output>

            <button
              type="button"
              onClick={increaseQuantity}
              disabled={quantity === 99}
              aria-label="Aumentar quantidade"
              className="flex size-8 items-center justify-center rounded-full bg-kurio-primary text-kurio-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => addToCart(true)}
              disabled={add.isPending || !available}
              className="min-w-28 rounded-md bg-kurio-primary px-5 py-2.5 text-xs font-bold text-kurio-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              {add.isPending ? "AGUARDE..." : "COMPRAR"}
            </button>

            <button
              type="button"
              onClick={toggleFavorite}
              disabled={favorites.mutation.isPending}
              aria-pressed={isFavorite}
              className="inline-flex items-center gap-2 rounded-md border border-kurio-primary px-3 py-2.5 text-xs text-kurio-primary disabled:opacity-50"
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

        {!available && (
          <p
            role="status"
            className="mt-3 text-xs text-kurio-secondary"
          >
            Esta edição está indisponível. Selecione outra edição.
          </p>
        )}

        <RequestState
          error={
            add.error ??
            favorites.mutation.error ??
            favorites.query.error
          }
        />

        {addedToCart && (
          <p
            role="status"
            className="mt-3 text-xs text-kurio-primary"
          >
            NFT adicionado ao carrinho!
          </p>
        )}
      </div>

      {/* Metadados e compartilhamento */}
      <div className="mt-5">
        <dl className="space-y-3 text-[13px] leading-5 md:space-y-2 md:text-xs">
          <div className="flex flex-wrap gap-2">
            <dt className="text-[#B99870] md:text-kurio-text-secondary">
              ID do token:
            </dt>
            <dd className="text-[#B99870] md:text-kurio-primary">
              {nft.tokenId}
            </dd>
          </div>

          <div className="flex flex-wrap gap-2">
            <dt className="text-[#B99870] md:text-kurio-text-secondary">
              Coleção:
            </dt>
            <dd className="text-[#B99870] md:text-foreground">
              {nft.collection}
            </dd>
          </div>

          <div className="flex flex-wrap gap-2">
            <dt className="text-[#B99870] md:text-kurio-text-secondary">
              Atributos:
            </dt>
            <dd className="text-[#B99870] md:text-foreground">
              {nft.attributes.join(", ")}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs md:mt-4">
          <strong className="text-foreground">
            Compartilhar este NFT:
          </strong>

          <div className="flex items-center gap-3 text-kurio-text-secondary">
            <button
              type="button"
              onClick={() => handleShare("linkedin")}
              aria-label="Compartilhar no LinkedIn"
              title="Compartilhar no LinkedIn"
              className="transition-colors hover:text-kurio-primary"
            >
              <span
                aria-hidden="true"
                className="flex size-4 items-center justify-center rounded-[2px] bg-current font-sans text-[10px] font-extrabold leading-none"
              >
                <span className="text-kurio-card">in</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleShare("email")}
              aria-label="Compartilhar por e-mail"
              title="Compartilhar por e-mail"
              className="transition-colors hover:text-kurio-primary"
            >
              <Mail className="size-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => handleShare("twitter")}
              aria-label="Compartilhar no X"
              title="Compartilhar no X"
              className="transition-colors hover:text-kurio-primary"
            >
              <span
                aria-hidden="true"
                className="flex size-4 items-center justify-center font-sans text-base font-medium leading-none"
              >
                𝕏
              </span>
            </button>

            <button
              type="button"
              onClick={() => void handleCopyLink()}
              aria-label="Copiar link deste NFT"
              title={copied ? "Link copiado" : "Copiar link"}
              className="transition-colors hover:text-kurio-primary"
            >
              {copied ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {copied && (
            <span
              role="status"
              className="text-[11px] text-kurio-primary"
            >
              Link copiado!
            </span>
          )}
        </div>
      </div>

      {/* Bottom sheet fixo: somente mobile */}
      <div
        aria-label="Painel de compra do NFT"
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-[36px] bg-[#241612] px-5 pb-[max(22px,env(safe-area-inset-bottom))] pt-6 shadow-[0_-10px_30px_#0A060473] md:hidden"
      >
        <div className="mx-auto max-w-[480px]">
          {/* Quantidade e preço */}
          <div className="flex items-center justify-between gap-3">
            <div
              role="group"
              aria-label="Selecionar quantidade"
              className="flex items-center gap-2.5"
            >
              <span className="text-[13px] font-semibold text-[#C8A981]">
                Qtd.
              </span>

              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity === 1}
                aria-label="Diminuir quantidade"
                className="flex size-9 items-center justify-center rounded-full bg-[#D28A4C] text-[#241612] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Minus size={18} aria-hidden="true" />
              </button>

              <output
                aria-live="polite"
                aria-label={`Quantidade: ${quantity}`}
                className="min-w-5 text-center text-[17px] font-bold text-foreground"
              >
                {quantity}
              </output>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={quantity === 99}
                aria-label="Aumentar quantidade"
                className="flex size-9 items-center justify-center rounded-full bg-[#D28A4C] text-[#241612] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>

            <output
              aria-live="polite"
              aria-label={`Valor total: ${totalPrice} ETH`}
              className="shrink-0 text-[21px] font-bold tracking-wide text-[#D28A4C]"
            >
              {totalPrice} ETH
            </output>
          </div>

          {/* Ações de compra */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => addToCart(true)}
              disabled={add.isPending || !available}
              className="flex h-[58px] min-w-0 flex-1 items-center justify-center rounded-full bg-[#D28A4C] px-4 text-[15px] font-bold text-[#241612] transition-colors hover:bg-[#E5A366] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {add.isPending
                ? "Aguarde..."
                : "Comprar NFT"}
            </button>

            <button
              type="button"
              onClick={() => addToCart(false)}
              disabled={add.isPending || !available}
              aria-label="Adicionar NFT ao carrinho sem sair da página"
              className="flex size-[58px] shrink-0 items-center justify-center rounded-full border border-[#4A291D] bg-[#301C16] text-[#C8A981] transition-colors hover:border-[#D28A4C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart
                size={23}
                fill="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </button>
          </div>

          {!available && (
            <p
              role="status"
              className="mt-3 text-center text-xs text-[#D28A4C]"
            >
              Edição indisponível
            </p>
          )}

          {addedToCart && (
            <p
              role="status"
              className="mt-3 text-center text-xs text-[#C8A981]"
            >
              Adicionado ao carrinho!
            </p>
          )}

          {add.error && (
            <div className="mt-3">
              <RequestState error={add.error} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
