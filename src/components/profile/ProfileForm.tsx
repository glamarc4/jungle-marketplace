
import { useState, type FormEvent } from "react"
import { Eye, EyeOff, ImagePlus } from "lucide-react"

import {
  useProfile,
  useSaveProfile,
  useSession,
} from "@/hooks/use-api"

import { RequestState } from "@/components/RequestState"
import { errorMessage } from "@/api/client"

import type { ProfileValues } from "@/domain/profile"

const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-[#493025] bg-[#241612] px-3 font-mono text-xs text-foreground outline-none placeholder:text-kurio-secondary transition-colors focus:border-kurio-primary"

const labelClass = "text-xs text-foreground"

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [visible, setVisible] = useState(false)

  return (
    <label className="block space-y-2">
      <span className={labelClass}>{label}</span>

      <span className="relative block">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={
            label === "Senha atual"
              ? "current-password"
              : "new-password"
          }
          className={`${inputClass} pr-11`}
        />

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-kurio-secondary transition-colors hover:text-kurio-primary"
        >
          {visible ? (
            <Eye size={17} />
          ) : (
            <EyeOff size={17} />
          )}
        </button>
      </span>
    </label>
  )
}

export function ProfileForm() {
  const query = useProfile()
  const session = useSession()

  if (!query.data) {
    return (
      <RequestState
        pending={query.isPending && !session.error}
        error={session.error ?? query.error}
        retry={() => {
          void session.refetch()
          void query.refetch()
        }}
      />
    )
  }

  return (
    <ProfileEditor
      key={session.data?.userId ?? "guest"}
      initial={query.data}
    />
  )
}

function ProfileEditor({
  initial,
}: {
  initial: ProfileValues
}) {
  const save = useSaveProfile()

  const [values, setValues] = useState<ProfileValues>(initial)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  function update(
    field: keyof ProfileValues,
    value: string,
  ) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }))

    setMessage("")
    setError("")
  }

  function handleAvatar(file?: File) {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem.")
      return
    }

    if (file.size > 500_000) {
      setError(
        "Use uma imagem de até 500 KB nesta demonstração.",
      )
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        update("avatar", reader.result)
      }
    }

    reader.readAsDataURL(file)
  }

  async function handleSave(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setError("")
    setMessage("")

    const wantsPasswordChange =
      currentPassword !== "" ||
      newPassword !== "" ||
      confirmPassword !== ""

    if (wantsPasswordChange) {
      if (!currentPassword || newPassword.length < 8) {
        setError(
          "Para alterar a senha, informe a atual e uma nova senha com pelo menos 8 caracteres.",
        )
        return
      }

      if (newPassword !== confirmPassword) {
        setError(
          "A confirmação da nova senha não coincide.",
        )
        return
      }
    }

    try {
      const result = await save.mutateAsync({
        ...values,
        ...(wantsPasswordChange
          ? { currentPassword, newPassword }
          : {}),
      })

      setValues(result)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      setMessage(
        "Dados do perfil salvos nesta demonstração.",
      )
    } catch (caughtError) {
      setError(errorMessage(caughtError))
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="w-full font-mono"
    >
      <h3 className="mb-6 text-base font-bold text-foreground">
        Perfil do colecionador
      </h3>

      <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>
            Nome de exibição{" "}
            <span className="text-kurio-primary">*</span>
          </span>

          <input
            required
            className={inputClass}
            value={values.displayName}
            onChange={(event) =>
              update("displayName", event.target.value)
            }
          />
        </label>

        <label className="space-y-2">
          <span className={labelClass}>
            Nome de usuário{" "}
            <span className="text-kurio-primary">*</span>
          </span>

          <input
            required
            minLength={3}
            className={inputClass}
            value={values.username}
            onChange={(event) =>
              update("username", event.target.value)
            }
          />
        </label>

        <label className="space-y-2">
          <span className={labelClass}>
            E-mail{" "}
            <span className="text-kurio-primary">*</span>
          </span>

          <input
            type="email"
            required
            className={inputClass}
            value={values.email}
            onChange={(event) =>
              update("email", event.target.value)
            }
          />
        </label>

        <div className="space-y-2">
          <label
            htmlFor="profile-ens"
            className={`block ${labelClass}`}
          >
            Nome ENS{" "}
            <span className="text-kurio-primary">*</span>
          </label>

          <div className="flex min-w-0 gap-2">
            <select
              aria-label="Sufixo ENS"
              className={`${inputClass} !w-20 shrink-0`}
              value={values.ensSuffix}
              onChange={(event) =>
                update("ensSuffix", event.target.value)
              }
            >
              <option value=".eth">.eth</option>
            </select>

            <input
              id="profile-ens"
              required
              className={inputClass}
              value={values.ens}
              onChange={(event) =>
                update("ens", event.target.value)
              }
            />
          </div>
        </div>

        <label className="space-y-2">
          <span className={labelClass}>
            Apelido da carteira{" "}
            <span className="text-kurio-primary">*</span>
          </span>

          <input
            required
            className={inputClass}
            value={values.walletNickname}
            onChange={(event) =>
              update("walletNickname", event.target.value)
            }
          />
        </label>

        <div className="space-y-2">
          <span className={`block ${labelClass}`}>
            Avatar
          </span>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex size-11 items-center justify-center overflow-hidden rounded-full border border-[#493025] bg-[#241612]">
              {values.avatar ? (
                <img
                  src={values.avatar}
                  alt="Prévia do avatar"
                  className="size-full object-cover"
                />
              ) : (
                <ImagePlus
                  size={20}
                  className="text-kurio-primary"
                />
              )}
            </div>

            <label className="cursor-pointer rounded-md bg-kurio-primary px-5 py-2.5 text-xs font-bold text-kurio-ink transition-opacity hover:opacity-90">
              Alterar

              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) =>
                  handleAvatar(event.target.files?.[0])
                }
              />
            </label>

            <button
              type="button"
              onClick={() => update("avatar", "")}
              className="text-xs text-foreground transition-colors hover:text-kurio-primary"
            >
              Remover
            </button>
          </div>
        </div>
      </div>

      <section className="mt-7 max-w-[390px] space-y-4">
        <h2 className="text-base font-bold text-foreground">
          Alterar senha
        </h2>

        <PasswordField
          label="Senha atual"
          value={currentPassword}
          onChange={setCurrentPassword}
        />

        <PasswordField
          label="Nova senha"
          value={newPassword}
          onChange={setNewPassword}
        />

        <PasswordField
          label="Confirmar nova senha"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
      </section>

      {error && (
        <p
          role="alert"
          className="mt-5 text-xs text-red-400"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="mt-5 text-xs text-kurio-primary"
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={save.isPending}
        className="mt-6 min-w-32 rounded-md bg-kurio-primary px-6 py-2.5 text-xs font-bold text-kurio-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Salvar
      </button>
    </form>
  )
}
