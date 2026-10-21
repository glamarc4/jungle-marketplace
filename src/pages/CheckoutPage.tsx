
import { useState, useRef } from "react"
import { Link, Navigate, useNavigate } from "@tanstack/react-router"

import {
  CollectorForm,
} from "@/components/checkout/CollectorForm"

import {
  CheckoutSummary,
  type CheckoutWallet,
} from "@/components/checkout/CheckoutSummary"

import { useCartQuery, useCreateOrder, useProfile, useWallets, useSession } from "@/hooks/use-api"
import { initialCollectorValues, type CollectorFormValues } from "@/domain/collector"
import { cartSignature } from "@/domain/api"
import { errorMessage, isUnauthorized } from "@/api/client"
import { RequestState } from "@/components/RequestState"

export function CheckoutPage() {
  const navigate = useNavigate()
  const query = useCartQuery()
  const profile = useProfile()
  const wallets = useWallets()
  const session = useSession()
  const create = useCreateOrder()
  const [draft, setDraft] = useState<CollectorFormValues | null>(null)
  const primary = wallets.data?.find(wallet => wallet.primary)
  const collector: CollectorFormValues = draft ?? {
    ...initialCollectorValues,
    displayName: profile.data?.displayName ?? "", username: profile.data?.username ?? "",
    email: profile.data?.email ?? session.data?.email ?? "", profileName: primary?.profileName ?? "",
    network: primary?.network ?? "", walletAddress: primary?.address ?? "",
    secondaryWallet: primary?.secondaryAddress || wallets.data?.find(wallet => !wallet.primary && wallet.network === primary?.network)?.address || "",
    walletType: primary?.walletType ?? "coinbase", referralCode: primary?.referralCode ?? "",
  }
  const [walletOverride, setWalletOverride] = useState<CheckoutWallet | null>(null)
  const selectedWallet = walletOverride ?? (collector.walletType as CheckoutWallet)
  const [error, setError] = useState("")
  const submission = useRef<{ fingerprint: string; key: string } | null>(null)
  const inFlight = useRef(false)

  function handleCollectorChange(values: CollectorFormValues) {
    setDraft(values)
    setError("")
  }

  async function handleSubmit() {
    if (inFlight.current || !query.data) return
    setError("")
    const input = { collector, selectedWallet, cartSignature: cartSignature(query.data) }
    const fingerprint = JSON.stringify(input)
    // Keep the key on errors: retries after an uncertain response are safe.
    if (submission.current?.fingerprint !== fingerprint) submission.current = { fingerprint, key: crypto.randomUUID() }
    inFlight.current = true
    try {
      const order = await create.mutateAsync({ ...input, key: submission.current.key })
      await navigate({ to: "/pedido/confirmacao", search: { orderId: order.orderId }, replace: true })
    } catch (error) {
      if (isUnauthorized(error)) await navigate({ to: "/entrar", search: { redirect: "/checkout" }, replace: true })
      else setError(errorMessage(error))
    }
    finally { inFlight.current = false }
  }

  function requestConfirmation() {
    setError("")

    const form = document.getElementById(
      "kurio-checkout-form",
    )

    if (form instanceof HTMLFormElement) {
      form.requestSubmit()
    }
  }

  if (session.isSuccess && !session.data) return <Navigate to="/entrar" search={{ redirect: "/checkout" }} replace />

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 font-mono sm:px-6 lg:px-8">
        <nav
          aria-label="Caminho de navegação"
          className="mb-8 text-xs font-bold text-foreground"
        >
          <Link
            to="/"
            className="hover:text-kurio-primary"
          >
            Início
          </Link>

          <span className="mx-2 text-kurio-secondary">
            /
          </span>

          <Link
            to="/mercado"
            className="hover:text-kurio-primary"
          >
            Mercado
          </Link>

          <span className="mx-2 text-kurio-secondary">
            /
          </span>

          <span>Pagamento</span>
        </nav>

        <RequestState error={profile.error ?? wallets.error ?? session.error} retry={() => { void profile.refetch(); void wallets.refetch(); void session.refetch() }} />
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,.95fr)] lg:gap-8">
          <div className="min-w-0">
          {!!wallets.data?.length && <label className="mb-4 block text-xs">Usar carteira cadastrada
            <select aria-label="Usar carteira cadastrada" value={wallets.data.find(wallet => wallet.address === collector.walletAddress)?.id ?? ""} onChange={event => {
              const wallet = wallets.data?.find(item => item.id === event.target.value)
              if (!wallet) { setDraft({ ...collector, walletAddress: "", secondaryWallet: "", useAnotherWallet: false }); return }
              if (wallet) { setDraft({ ...collector, walletAddress: wallet.address, network: wallet.network, walletType: wallet.walletType, profileName: wallet.profileName, referralCode: wallet.referralCode, secondaryWallet: wallet.secondaryAddress, useAnotherWallet: false }); setWalletOverride(wallet.walletType as CheckoutWallet) }
            }} className="ml-2 rounded border border-kurio-border bg-kurio-card p-2">
              <option value="">Endereço manual</option>
              {wallets.data.map(wallet => <option key={wallet.id} value={wallet.id}>{wallet.nickname} ({wallet.network})</option>)}
            </select>
          </label>}
          <CollectorForm
            values={collector}
            onChange={handleCollectorChange}
            onSubmit={() => void handleSubmit()}
          />
          </div>

          <CheckoutSummary
            selectedWallet={selectedWallet}
            onWalletChange={(wallet) => {
              setWalletOverride(wallet)
              setError("")
            }}
            onConfirm={requestConfirmation}
            error={error}
            pending={create.isPending}
          />
        </div>
      </div>

    </>
  )
}
