
import { useEffect, useRef } from "react"
import { X } from "lucide-react"

import { MonkeyArtwork } from "@/components/home/MonkeyArtwork"
import { formatMicroEth } from "@/features/cart/cart-store"

import type { Order } from "@/domain/api"

type OrderConfirmationModalProps = {
  order: Order
  onClose: () => void
}

export function OrderConfirmationModal({
  order,
  onClose,
}: OrderConfirmationModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const isPending = order.status === "pending"
  const isDeclined = order.status === "declined"

  const statusTitle = isPending
    ? "Pagamento pendente"
    : isDeclined
      ? "Pagamento recusado"
      : "Seus NFTs foram registrados no pedido"

  const statusDescription = isPending
    ? "Seu pedido foi criado e aguarda a confirmação do pagamento. Os itens permanecem no carrinho até a confirmação."
    : isDeclined
      ? "O pagamento não foi aprovado. Seus NFTs continuam no carrinho para que você possa tentar novamente."
      : "Pedido de demonstração confirmado. Nenhuma transação blockchain foi realizada."

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement

    document.body.style.overflow = "hidden"
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      }
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overscroll-contain bg-[#100907]/35 px-3 py-4 backdrop-blur-md sm:px-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-confirmation-title"
        aria-describedby="order-confirmation-description"
        className="relative my-auto w-full max-w-[680px] max-h-[calc(100dvh-32px)] overflow-y-auto overscroll-contain rounded-xl border border-kurio-border bg-kurio-card font-mono text-foreground shadow-2xl"
      >
        {/* FECHAR */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar confirmação"
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-md text-kurio-primary transition-colors hover:bg-kurio-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-kurio-primary"
        >
          <X className="size-5" />
        </button>

        {/* CABEÇALHO */}
        <header className="px-5 pb-5 pt-6 text-center sm:px-8">
          <div className="mx-auto flex size-14 flex-col items-center justify-center rounded-lg border-2 border-kurio-primary text-kurio-primary">
            {isPending ? (
              <span className="text-xs font-black leading-tight">
                PENDING
              </span>
            ) : isDeclined ? (
              <span className="text-xs font-black leading-tight">
                FAILED
              </span>
            ) : (
              <>
                <span className="text-base font-black leading-[1.05]">
                  THANK
                </span>
                <span className="text-base font-black leading-[1.05]">
                  YOU
                </span>
              </>
            )}
          </div>

          <h2
            id="order-confirmation-title"
            className="mx-auto mt-3 max-w-lg text-base font-bold leading-snug text-foreground sm:text-lg"
          >
            {statusTitle}
          </h2>

          <p
            id="order-confirmation-description"
            className="mx-auto mt-2 max-w-md text-[11px] leading-[1.65] text-kurio-secondary sm:text-xs"
          >
            {statusDescription}
          </p>
        </header>

        {/* INFORMAÇÕES DO PEDIDO */}
        <section
          aria-label="Informações do pedido"
          className="border-y border-kurio-border bg-kurio-raised/60 px-5 py-4 sm:px-8"
        >
          <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-[1.25fr_1fr_0.85fr]">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-foreground">
                ID do pedido
              </p>

              <p
                className="mt-1 break-all text-[10px] leading-4 text-kurio-secondary"
                title={order.orderId}
              >
                {order.orderId}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-bold text-foreground">
                Data
              </p>

              <p className="mt-1 text-[11px] leading-4 text-kurio-text-secondary">
                {order.date}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-bold text-foreground">
                Total
              </p>

              <p className="mt-1 whitespace-nowrap text-xs font-bold text-kurio-primary">
                {formatMicroEth(order.totalMicroEth, 3)}
              </p>
            </div>

            <div className="col-span-2 min-w-0 border-t border-kurio-border/70 pt-3 sm:col-span-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
                <p className="shrink-0 text-[11px] font-bold text-foreground">
                  Carteira
                </p>

                <div className="min-w-0">
                  <p className="text-[11px] text-kurio-text-secondary">
                    {order.wallet}
                  </p>

                  <p className="mt-0.5 break-all text-[10px] leading-4 text-kurio-secondary">
                    {order.walletAddress} ({order.network})
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DETALHES */}
        <section className="px-5 pb-5 pt-5 sm:px-8">
          <h3 className="text-base font-bold text-foreground">
            Detalhes do pedido
          </h3>

          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_52px_95px] gap-2 border-b border-kurio-border pb-2 text-[11px] font-bold sm:grid-cols-[minmax(0,1fr)_75px_115px]">
            <span>NFTs</span>
            <span className="text-center">Edições</span>
            <span className="text-right">Subtotal</span>
          </div>

          <div className="divide-y divide-kurio-border/60">
            {order.items.map((item) => (
              <div
                key={item.key}
                className="grid grid-cols-[minmax(0,1fr)_52px_95px] items-center gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_75px_115px]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="size-12 shrink-0 overflow-hidden rounded-md sm:size-14">
                    <MonkeyArtwork variant={item.artwork} />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="truncate text-[11px] font-bold text-foreground sm:text-xs"
                      title={item.name}
                    >
                      {item.name}
                    </p>

                    <p className="mt-1 truncate text-[10px] text-kurio-secondary">
                      ID do token: {item.tokenId}
                    </p>
                  </div>
                </div>

                <span className="text-center text-[11px] text-kurio-text-secondary">
                  (x {item.quantity})
                </span>

                <strong className="whitespace-nowrap text-right text-[11px] text-kurio-primary sm:text-xs">
                  {formatMicroEth(
                    item.unitPriceMicroEth * item.quantity,
                  )}
                </strong>
              </div>
            ))}
          </div>

          {/* TOTAIS */}
          <div className="ml-auto mt-3 max-w-[300px] space-y-2 text-[11px] sm:text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-kurio-text-secondary">
                Subtotal
              </span>
              <span>
                {formatMicroEth(order.subtotalMicroEth)}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-kurio-text-secondary">
                Taxa de rede
              </span>
              <span>
                {formatMicroEth(order.networkFeeMicroEth, 3)}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-kurio-text-secondary">
                Desconto
              </span>
              <span>
                (-) {formatMicroEth(order.discountMicroEth)}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-t border-kurio-border pt-2 text-sm font-bold">
              <span>Total</span>
              <span className="text-kurio-primary">
                {formatMicroEth(order.totalMicroEth, 3)}
              </span>
            </div>
          </div>

          {/* AVISO E ETHERSCAN */}
          <footer className="mt-5 border-t border-kurio-border pt-4 text-center">
            <p className="mx-auto max-w-lg text-[11px] leading-[1.65] text-kurio-text-secondary">
              Este pedido é uma demonstração do fluxo da Kurio.
              Os NFTs ainda não foram transferidos para uma
              carteira e não existe transação registrada na rede.
            </p>

            <button
              type="button"
              disabled
              title="Disponível após uma transação real"
              className="mt-4 rounded-md bg-kurio-primary px-5 py-2.5 text-xs font-bold text-kurio-ink opacity-50"
            >
              Ver no Etherscan
            </button>
          </footer>
        </section>

        <div
          aria-hidden="true"
          className="h-1 w-full bg-kurio-primary"
        />
      </div>
    </div>
  )
}
