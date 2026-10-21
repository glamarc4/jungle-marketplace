
import { useState } from "react"

import { useWallets, useCreateWallet, useUpdateWallet, useDeleteWallet, useSession } from "@/hooks/use-api"
import { RequestState } from "@/components/RequestState"
import { errorMessage } from "@/api/client"
import { validWalletAddress } from "@/domain/validation"
import type { Wallet } from "@/domain/api"

import { emptyWallet, type WalletValues } from "@/domain/wallet"

const inputClass =
  "h-10 w-full rounded-sm border border-kurio-border bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-kurio-secondary focus:border-kurio-primary"

export function WalletsForm() {
  const query = useWallets()
  const session = useSession()
  if (!query.data) return <RequestState pending={query.isPending && !session.error} error={session.error ?? query.error} retry={() => { void session.refetch(); void query.refetch() }} />
  return <WalletEditor key={session.data?.userId ?? "guest"} wallets={query.data} email={session.data?.email ?? ""} />
}

function WalletEditor({ wallets, email }: { wallets: Wallet[]; email: string }) {
  const initial = wallets.find(item => item.primary)
  const secondary = wallets.find(item => !item.primary)
  const create = useCreateWallet()
  const patch = useUpdateWallet()
  const remove = useDeleteWallet()
  const [editingId, setEditingId] = useState(initial?.id)
  const [wallet, setWallet] = useState<WalletValues>(initial ?? { ...emptyWallet, email })
  const [usePrimary, setUsePrimary] = useState(!!initial && initial.address === initial.secondaryAddress)
  const [isPrimary, setIsPrimary] = useState(initial?.primary ?? true)
  const [showSecondary, setShowSecondary] = useState(!!secondary)
  const [secondaryNickname, setSecondaryNickname] = useState(secondary?.nickname ?? "")
  const [secondaryAddress, setSecondaryAddress] = useState(secondary?.address ?? "")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const busy = create.isPending || patch.isPending || remove.isPending

  function update(field: keyof WalletValues, value: string) {
    setWallet((previous) => ({
      ...previous,
      [field]: value,
    }))
    setMessage("")
    setError("")
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(""); setError("")
    if (!validWalletAddress(wallet.network, wallet.address) || (wallet.secondaryAddress && !validWalletAddress(wallet.network, wallet.secondaryAddress))) {
      setError("Informe endereços válidos para a rede selecionada."); return
    }
    if (isPrimary && showSecondary && !usePrimary && (!secondaryNickname.trim() || !validWalletAddress(wallet.network, secondaryAddress))) {
      setError("Preencha apelido e endereço secundário válido para a rede selecionada."); return
    }
    let firstSaved = false
    try {
      const values = { ...wallet, secondaryAddress: usePrimary ? wallet.address : wallet.secondaryAddress, primary: isPrimary }
      const primary = editingId
        ? await patch.mutateAsync({ ...values, id: editingId })
        : await create.mutateAsync(values)
      setEditingId(primary.id)
      firstSaved = true
      if (isPrimary && showSecondary && !usePrimary) {
        const data = { ...wallet, nickname: secondaryNickname, address: secondaryAddress, secondaryAddress: "", primary: false }
        const existing = wallets.find(item => !item.primary && item.id !== primary.id)
        if (existing) await patch.mutateAsync({ ...data, id: existing.id })
        else await create.mutateAsync(data)
      }
      setMessage("Carteiras salvas nesta demonstração.")
    } catch (error) { setError((firstSaved ? "A primeira carteira foi salva; revise a secundária. " : "") + errorMessage(error)) }
  }

  return (
    <form onSubmit={handleSave} className="w-full font-mono">
      {wallets.length > 0 && <div className="mb-5 flex flex-wrap items-center gap-3 text-xs">
        <label>Carteiras salvas <select aria-label="Carteiras salvas" value={editingId ?? ""} onChange={event => { const item = wallets.find(w => w.id === event.target.value); if (item) { setEditingId(item.id); setWallet(item); setIsPrimary(item.primary); setUsePrimary(item.address === item.secondaryAddress); setShowSecondary(false) } }} className="ml-2 rounded border border-kurio-border bg-kurio-card p-2">
          <option value="" disabled>Nova carteira</option>
          {wallets.map(item => <option key={item.id} value={item.id}>{item.nickname}{item.primary ? " (principal)" : " (secundária)"}</option>)}
        </select></label>
        {editingId && <button type="button" disabled={busy} className="text-kurio-primary underline" onClick={() => remove.mutate(editingId, { onSuccess: () => { setEditingId(undefined); setWallet({ ...emptyWallet, email }); setMessage("Carteira removida.") }, onError: error => setError(errorMessage(error)) })}>Remover carteira</button>}
      </div>}
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-base font-bold">Carteira principal</h1>
          <p className="mt-1 text-xs leading-5 text-kurio-secondary">
            Estas carteiras ficam disponíveis no pagamento e para
            simular o recebimento de NFTs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setWallet({ ...emptyWallet, email })
            setEditingId(undefined)
            setIsPrimary(true)
            setShowSecondary(false)
            setUsePrimary(false)
            setMessage("")
          }}
          className="text-sm font-bold text-kurio-primary hover:underline"
        >
          Adicionar
        </button>
      </div>

      <label className="mb-4 flex items-center gap-2 text-xs">
        <input type="checkbox" checked={isPrimary} onChange={event => setIsPrimary(event.target.checked)} className="accent-[#D28A4C]" />
        Definir como carteira principal
      </label>
      <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm">
            Nome de exibição <span className="text-kurio-primary">*</span>
          </span>
          <input
            required
            className={inputClass}
            value={wallet.displayName}
            onChange={(event) =>
              update("displayName", event.target.value)
            }
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm">
            Apelido da carteira <span className="text-kurio-primary">*</span>
          </span>
          <input
            required
            className={inputClass}
            value={wallet.nickname}
            onChange={(event) =>
              update("nickname", event.target.value)
            }
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm">
            Rede <span className="text-kurio-primary">*</span>
          </span>
          <select
            required
            className={inputClass}
            value={wallet.network}
            onChange={(event) =>
              update("network", event.target.value)
            }
          >
            <option value="">Selecione uma rede</option>
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="solana">Solana</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm">
            Nome do perfil <span className="text-kurio-primary">*</span>
          </span>
          <input
            required
            className={inputClass}
            value={wallet.profileName}
            onChange={(event) =>
              update("profileName", event.target.value)
            }
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm">
            Endereço da carteira <span className="text-kurio-primary">*</span>
          </span>
          <input
            required
            placeholder={wallet.network === "solana" ? "Endereço Solana (base58)" : "Endereço 0x da carteira"}
            className={inputClass}
            value={wallet.address}
            onChange={(event) =>
              update("address", event.target.value)
            }
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm">
            Carteira secundária (opcional)
          </span>
          <input
            placeholder="Endereço secundário (opcional)"
            className={inputClass}
            value={wallet.secondaryAddress}
            onChange={(event) =>
              update("secondaryAddress", event.target.value)
            }
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm">
            Tipo de carteira <span className="text-kurio-primary">*</span>
          </span>
          <select
            required
            className={inputClass}
            value={wallet.walletType}
            onChange={(event) =>
              update("walletType", event.target.value)
            }
          >
            <option value="">Selecione uma carteira</option>
            <option value="metamask">MetaMask</option>
            <option value="walletconnect">WalletConnect</option>
            <option value="coinbase">Coinbase Wallet</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm">
            Código de indicação <span className="text-kurio-primary">*</span>
          </span>
          <input
            required
            className={inputClass}
            value={wallet.referralCode}
            onChange={(event) =>
              update("referralCode", event.target.value)
            }
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm">
            E-mail <span className="text-kurio-primary">*</span>
          </span>
          <input
            type="email"
            required
            className={inputClass}
            value={wallet.email}
            onChange={(event) =>
              update("email", event.target.value)
            }
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm">
            Nome ENS <span className="text-kurio-primary">*</span>
          </span>
          <span className="flex gap-2">
            <span className={`${inputClass} flex w-20 shrink-0 items-center`}>
              .eth
            </span>
            <input
              required
              className={inputClass}
              value={wallet.ens}
              onChange={(event) =>
                update("ens", event.target.value)
              }
            />
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-7 rounded-sm bg-kurio-primary px-5 py-3 text-sm font-bold text-kurio-ink hover:opacity-90"
      >
        Salvar carteira
      </button>

      {isPrimary && <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold">Carteira secundária</h2>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={usePrimary}
                onChange={(event) => {
                  setUsePrimary(event.target.checked)
                  if (!event.target.checked && wallet.secondaryAddress === wallet.address) update("secondaryAddress", "")
                }}
                className="accent-[#D28A4C]"
              />
              Igual à carteira principal
            </label>

            <button
              type="button"
              onClick={() => setShowSecondary(true)}
              className="text-sm font-bold text-kurio-primary"
            >
              Adicionar
            </button>
          </div>
        </div>

        {showSecondary && !usePrimary ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm">Apelido</span>
              <input
                className={inputClass}
                value={secondaryNickname}
                onChange={(event) =>
                  setSecondaryNickname(event.target.value)
                }
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm">Endereço</span>
              <input
                className={inputClass}
                value={secondaryAddress}
                onChange={(event) =>
                  setSecondaryAddress(event.target.value)
                }
              />
            </label>
          </div>
        ) : (
          <p className="mt-2 text-xs text-kurio-secondary">
            {usePrimary
              ? "A carteira principal será usada como secundária."
              : "Você ainda não adicionou uma carteira secundária."}
          </p>
        )}
      </section>}

      {error && (
        <p role="alert" className="mt-5 text-sm text-red-400">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="mt-5 text-sm text-kurio-primary">
          {message}
        </p>
      )}
    </form>
  )
}
