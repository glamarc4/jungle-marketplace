
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react"
import { ArrowRight, Eye, EyeOff, X } from "lucide-react"
import {
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router"

import {
  afterAuthDestination,
  validateAuthSearch,
} from "@/router/auth"
import { useAuth } from "@/hooks/use-api"
import { errorMessage } from "@/api/client"

type AuthMode = "login" | "register"

type AuthModalProps = {
  mode: AuthMode
}

const fieldClass =
  "h-11 w-full rounded-lg border border-kurio-border bg-kurio-surface-dark/60 px-4 font-mono text-sm text-foreground outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-kurio-secondary focus:border-kurio-primary focus:bg-kurio-surface-dark focus:ring-2 focus:ring-kurio-primary/10"

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.71-.06-1.42-.19-2.1H12v3.98h5.24a4.49 4.49 0 0 1-1.95 2.95v2.45h3.15c1.84-1.69 2.91-4.18 2.91-7.28Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.62 0 4.83-.87 6.44-2.24l-3.15-2.45c-.87.58-1.99.93-3.29.93-2.53 0-4.68-1.71-5.45-4.01H3.3v2.52A9.74 9.74 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.55 13.78a5.84 5.84 0 0 1 0-3.56V7.7H3.3a9.75 9.75 0 0 0 0 8.6l3.25-2.52Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.21c1.38 0 2.62.47 3.59 1.41l2.85-2.85A9.23 9.23 0 0 0 12 2.25 9.74 9.74 0 0 0 3.3 7.7l3.25 2.52C7.32 7.92 9.47 6.21 12 6.21Z"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      aria-hidden="true"
    >
      <path
        fill="#4267B2"
        d="M14.1 21v-8.2h2.75l.42-3.2H14.1V7.56c0-.93.26-1.56 1.59-1.56h1.7V3.14A22.7 22.7 0 0 0 14.91 3c-2.46 0-4.14 1.5-4.14 4.25V9.6H8v3.2h2.77V21h3.33Z"
      />
    </svg>
  )
}

export function AuthModal({ mode }: AuthModalProps) {
  const navigate = useNavigate()
  const auth = useAuth(mode)

  const returnTo = validateAuthSearch(
    useSearch({ strict: false }),
  )

  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")

  const isLogin = mode === "login"

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement

    document.body.style.overflow = "hidden"
    closeRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        void navigate({ to: "/" })
        return
      }

      if (event.key !== "Tab") return

      const dialog = dialogRef.current
      if (!dialog) return

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)

      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus()
      }
    }
  }, [navigate])

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setMessage("")

    if (!isLogin && password !== confirmPassword) {
      setMessage("As senhas não coincidem.")
      return
    }

    auth.mutate(
      { email, password, username },
      {
        onSuccess: () => {
          void navigate({
            ...afterAuthDestination(returnTo),
            replace: true,
          })
        },
        onError: (error) => {
          setMessage(errorMessage(error))
        },
      },
    )
  }

  return (
    <div
      className="
        fixed inset-0 z-[100] flex
        items-stretch justify-center
        overflow-hidden bg-kurio-card
        sm:items-center sm:overflow-y-auto
        sm:bg-black/25 sm:px-5 sm:py-4
        sm:backdrop-blur-md
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          void navigate({ to: "/" })
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="
          relative flex h-full min-h-0 w-full
          flex-col overflow-y-auto overscroll-contain
          rounded-none border-0
          bg-kurio-card text-foreground
          sm:h-auto sm:max-h-[calc(100dvh-32px)]
          sm:max-w-[480px] sm:rounded-2xl
          sm:border sm:border-kurio-border
          sm:shadow-[0_24px_90px_rgba(0,0,0,0.55)]
        "
      >
        <h1 id="auth-modal-title" className="sr-only">
          {isLogin
            ? "Entrar na Kurio"
            : "Criar conta na Kurio"}
        </h1>

        {/* Fechar — topo em todas as telas */}
        <div
          className="
            flex shrink-0 justify-end
            px-5 pb-0 pt-5
            sm:px-7 sm:pt-4
          "
        >
          <button
            ref={closeRef}
            type="button"
            aria-label="Fechar modal"
            onClick={() => void navigate({ to: "/" })}
            className="
              flex size-9 items-center justify-center
              rounded-lg text-kurio-primary
              transition-colors
              hover:bg-kurio-primary/10
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-kurio-primary
            "
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Conteúdo: sem flex-1 vazio */}
        <div
          className="
            w-full px-6 pb-8 pt-3
            sm:px-9 sm:pb-6 sm:pt-2
          "
        >
          {/* Entrar / Criar conta */}
          <nav
            aria-label="Escolha entre entrar e criar conta"
            className="
              grid grid-cols-2 gap-1
              rounded-xl border border-kurio-border
              bg-kurio-surface-dark p-1
            "
          >
            <Link
              to="/entrar"
              search={returnTo}
              aria-current={isLogin ? "page" : undefined}
              className={`flex min-h-10 items-center justify-center rounded-lg px-3 font-mono text-sm font-bold transition-[background-color,color,box-shadow] duration-200 ${
                isLogin
                  ? "bg-kurio-primary text-kurio-ink shadow-sm"
                  : "text-kurio-text-secondary hover:bg-kurio-primary/10 hover:text-foreground"
              }`}
            >
              Entrar
            </Link>

            <Link
              to="/cadastro"
              search={returnTo}
              aria-current={!isLogin ? "page" : undefined}
              className={`flex min-h-10 items-center justify-center rounded-lg px-3 font-mono text-sm font-bold transition-[background-color,color,box-shadow] duration-200 ${
                !isLogin
                  ? "bg-kurio-primary text-kurio-ink shadow-sm"
                  : "text-kurio-text-secondary hover:bg-kurio-primary/10 hover:text-foreground"
              }`}
            >
              Criar conta
            </Link>
          </nav>

          {/* Descrição */}
          <div
            className="
              mb-7 mt-8 text-center
              sm:mb-6 sm:mt-7
            "
          >
            <p className="mx-auto max-w-[390px] font-mono text-sm leading-6 text-foreground">
              {isLogin
                ? "Entre para gerenciar sua carteira, coleção e perfil de criador."
                : "Crie seu perfil de colecionador e conecte uma carteira quando quiser."}
            </p>
          </div>

          {/* Formulário */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-3"
          >
            {!isLogin && (
              <div>
                <label
                  htmlFor="auth-username"
                  className="sr-only"
                >
                  Nome de usuário
                </label>

                <input
                  id="auth-username"
                  type="text"
                  autoComplete="username"
                  placeholder="Nome de usuário"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  minLength={3}
                  maxLength={30}
                  required
                  className={fieldClass}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="sr-only"
              >
                E-mail
              </label>

              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder={
                  isLogin
                    ? "contato@email.com"
                    : "Digite seu e-mail"
                }
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                className={fieldClass}
              />
            </div>

            <div className="relative">
              <label
                htmlFor="auth-password"
                className="sr-only"
              >
                Senha
              </label>

              <input
                id="auth-password"
                type={
                  showPassword ? "text" : "password"
                }
                autoComplete={
                  isLogin
                    ? "current-password"
                    : "new-password"
                }
                placeholder={
                  isLogin ? "Sua senha" : "Senha"
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                minLength={8}
                required
                className={`${fieldClass} pr-12`}
              />

              <button
                type="button"
                aria-label={
                  showPassword
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
                onClick={() =>
                  setShowPassword(
                    (current) => !current,
                  )
                }
                className="
                  absolute right-2 top-1/2
                  flex size-9 -translate-y-1/2
                  items-center justify-center
                  rounded-md text-kurio-secondary
                  transition-colors
                  hover:bg-kurio-primary/10
                  hover:text-kurio-primary
                  focus-visible:outline-2
                  focus-visible:outline-kurio-primary
                "
              >
                {showPassword ? (
                  <Eye
                    className="size-5"
                    aria-hidden="true"
                  />
                ) : (
                  <EyeOff
                    className="size-5"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <label
                  htmlFor="auth-confirm-password"
                  className="sr-only"
                >
                  Confirmar senha
                </label>

                <input
                  id="auth-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  minLength={8}
                  required
                  className={`${fieldClass} pr-12`}
                />

                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar confirmação de senha"
                      : "Mostrar confirmação de senha"
                  }
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current,
                    )
                  }
                  className="
                    absolute right-2 top-1/2
                    flex size-9 -translate-y-1/2
                    items-center justify-center
                    rounded-md text-kurio-secondary
                    transition-colors
                    hover:bg-kurio-primary/10
                    hover:text-kurio-primary
                    focus-visible:outline-2
                    focus-visible:outline-kurio-primary
                  "
                >
                  {showConfirmPassword ? (
                    <Eye
                      className="size-5"
                      aria-hidden="true"
                    />
                  ) : (
                    <EyeOff
                      className="size-5"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      "A recuperação de senha será implementada com a autenticação.",
                    )
                  }
                  className="
                    font-mono text-xs font-medium
                    text-kurio-primary
                    transition-colors
                    hover:text-foreground
                    hover:underline
                  "
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={auth.isPending}
              className="
                group relative !mt-6 flex min-h-11
                w-full items-center justify-center
                rounded-lg bg-kurio-primary
                px-5 py-2.5 font-mono
                text-sm font-bold text-kurio-ink
                transition-[background-color,transform,opacity]
                duration-200
                hover:bg-kurio-primary-light
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
                motion-reduce:transform-none
                motion-reduce:transition-none
                sm:!mt-5
              "
            >
              <span>
                {auth.isPending
                  ? "Aguarde..."
                  : isLogin
                    ? "Entrar"
                    : "Criar conta"}
              </span>

              {!auth.isPending && (
                <ArrowRight
                  className="
                    absolute right-4 size-4
                    transition-transform duration-200
                    group-hover:translate-x-1
                    motion-reduce:transform-none
                  "
                  aria-hidden="true"
                />
              )}
            </button>
          </form>

          {message && (
            <p
              role="status"
              className="
                mt-3 rounded-lg
                border border-kurio-primary/25
                bg-kurio-primary/5 px-3 py-2.5
                text-center font-mono text-xs
                leading-5 text-kurio-primary
              "
            >
              {message}
            </p>
          )}

          {/* Divisor */}
          <div className="my-7 flex items-center gap-3 sm:my-6">
            <span
              className="h-px flex-1 bg-kurio-border"
              aria-hidden="true"
            />

            <span className="shrink-0 font-mono text-xs font-medium text-foreground">
              Ou continue com
            </span>

            <span
              className="h-px flex-1 bg-kurio-border"
              aria-hidden="true"
            />
          </div>

          {/* Login social — integração ainda indisponível */}
          <div className="space-y-3 sm:space-y-2.5">
            <button
              type="button"
              disabled
              title="Login com Google ainda não integrado"
              aria-label="Continuar com Google — integração indisponível"
              className="
                flex min-h-11 w-full
                cursor-not-allowed
                items-center justify-center gap-3
                rounded-lg border border-kurio-border
                bg-kurio-surface-dark/30
                px-4 font-mono text-sm font-medium
                text-kurio-text-secondary opacity-80
              "
            >
              <GoogleIcon />
              <span>Continuar com Google</span>
            </button>

            <button
              type="button"
              disabled
              title="Login com Facebook ainda não integrado"
              aria-label="Continuar com Facebook — integração indisponível"
              className="
                flex min-h-11 w-full
                cursor-not-allowed
                items-center justify-center gap-3
                rounded-lg border border-kurio-border
                bg-kurio-surface-dark/30
                px-4 font-mono text-sm font-medium
                text-kurio-text-secondary opacity-80
              "
            >
              <FacebookIcon />
              <span>Continuar com Facebook</span>
            </button>
          </div>
        </div>

        {/* Linha decorativa:
            no rodapé mobile; posição original no desktop */}
        <div
          className="
            mt-auto h-1 shrink-0
            bg-kurio-primary
            sm:mt-0
          "
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
