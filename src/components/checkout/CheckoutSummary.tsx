import { useCartQuery, useCartBusy } from "@/hooks/use-api"
import { RequestState } from "@/components/RequestState"

import { Link } from "@tanstack/react-router"

import { MonkeyArtwork } from "@/components/home/MonkeyArtwork"
import {
  formatMicroEth,
} from "@/features/cart/cart-store"

export type CheckoutWallet =
  | "walletconnect"
  | "metamask"
  | "coinbase"

type CheckoutSummaryProps = {
  selectedWallet: CheckoutWallet
  onWalletChange: (wallet: CheckoutWallet) => void
  onConfirm: () => void
  error?: string
  pending?: boolean
}


const wallets: {
  id: CheckoutWallet
  label: string
}[] = [
  { id: "walletconnect", label: "WalletConnect" },
  { id: "metamask", label: "MetaMask" },
  { id: "coinbase", label: "Coinbase Wallet" },
]

export function CheckoutSummary({
  selectedWallet,
  onWalletChange,
  onConfirm,
  error,
  pending,
}: CheckoutSummaryProps) {
  const query = useCartQuery()
  const busy = useCartBusy()
  const items = query.data?.items ?? []
  const needsReview = (query.data?.unavailableItems?.length ?? 0) > 0
  const subtotal = query.data?.subtotalMicroEth ?? 0
  const discount = query.data?.discountMicroEth ?? 0
  const networkFee = query.data?.networkFeeMicroEth ?? 0
  const total = query.data?.totalMicroEth ?? 0
  if (query.isPending || query.isError) return <RequestState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />

  return (
    <aside className="min-w-0 font-mono">
      <h2 className="mb-3 text-sm font-bold text-foreground">
        Seus NFTs
      </h2>

      <div className="mb-2 flex justify-between border-b border-kurio-border pb-2 text-xs font-bold text-foreground">
        <span>NFTs</span>
        <span>Subtotal</span>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-3 bg-kurio-card p-2"
          >
            <Link
              to="/nft/$nftId"
              params={{ nftId: item.nftId }}
              className="size-14 shrink-0 overflow-hidden rounded-sm"
              aria-label={`Ver ${item.name}`}
            >
              <MonkeyArtwork variant={item.artwork} />
            </Link>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-foreground">
                {item.name}
              </p>
              <p className="mt-1 text-[10px] text-kurio-secondary">
                ID do token: {item.tokenId} (x {item.quantity})
              </p>
            </div>

            <strong className="shrink-0 text-xs text-kurio-primary">
              {formatMicroEth(
                item.unitPriceMicroEth * item.quantity,
              )}
            </strong>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="rounded-sm border border-kurio-border p-5 text-center">
          <p className="text-xs text-kurio-secondary">
            Seu carrinho está vazio.
          </p>
          <Link
            to="/mercado"
            className="mt-3 inline-block text-xs text-kurio-primary underline"
          >
            Explorar NFTs
          </Link>
        </div>
      )}

      <p className="mt-3 text-center text-[11px] text-foreground">
        Tem um código promocional?{" "}
        <Link to="/carrinho" className="text-kurio-primary hover:underline">
          Aplique aqui
        </Link>
      </p>

      <dl className="mt-4 space-y-3 text-xs text-foreground">
        <div className="flex justify-between gap-3">
          <dt>Subtotal</dt>
          <dd>{formatMicroEth(subtotal)}</dd>
        </div>

        <div className="flex justify-between gap-3">
          <dt>Desconto do lançamento</dt>
          <dd>(-) {formatMicroEth(discount)}</dd>
        </div>

        <div className="flex justify-between gap-3">
          <dt>Taxa de rede</dt>
          <dd>{formatMicroEth(networkFee, 3)}</dd>
        </div>
      </dl>

      <p className="mt-2 text-right text-[10px] text-kurio-primary">
        Taxa estimada
      </p>

      <div className="mt-4 flex justify-between gap-3 border-t border-kurio-border pt-3 text-sm font-bold">
        <span className="text-foreground">Total</span>
        <span className="text-kurio-primary">
          {formatMicroEth(total, 3)}
        </span>
      </div>

      <fieldset className="mt-5">
        <legend className="mb-3 text-center text-sm font-bold text-foreground">
          Carteira e rede
        </legend>

        <div className="space-y-3">
          {wallets.map((wallet) => (
            <label
              key={wallet.id}
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-sm border px-3 text-xs transition-colors ${
                selectedWallet === wallet.id
                  ? "border-kurio-primary text-foreground"
                  : "border-kurio-border text-kurio-secondary hover:border-kurio-primary"
              }`}
            >
              <input
                type="radio"
                name="checkout-wallet"
                value={wallet.id}
                checked={selectedWallet === wallet.id}
                onChange={() => onWalletChange(wallet.id)}
                className="size-4 accent-[#D28A4C]"
              />
              {wallet.label}
            </label>
          ))}
        </div>
      </fieldset>

      {needsReview && <p role="alert" className="mt-4 text-xs text-red-400">Há edições indisponíveis no carrinho. Revise os itens antes de confirmar.</p>}
      {error && (
        <p
          role="alert"
          className="mt-4 text-xs leading-5 text-red-400"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onConfirm}
        disabled={pending || busy || needsReview || items.length === 0}
        className="mt-5 w-full rounded-sm bg-kurio-primary px-5 py-3 text-xs font-bold text-kurio-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Confirmar compra
      </button>

      <p className="mt-3 text-center text-[10px] leading-5 text-kurio-secondary">
        Prévia do checkout. Nenhuma transação será enviada
        à blockchain nesta etapa.
      </p>
    </aside>
  )
}
