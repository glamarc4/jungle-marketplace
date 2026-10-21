import { afterAuthDestination, validateAuthSearch } from "@/router/auth"

import { useEffect, useRef, useState } from "react"
import { Eye, EyeOff, X } from "lucide-react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useAuth } from "@/hooks/use-api"
import { errorMessage } from "@/api/client"

type AuthMode = "login" | "register"

type AuthModalProps = {
    mode: AuthMode
}

const fieldClass =
    "h-12 w-full rounded-md border border-kurio-border bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-kurio-secondary focus:border-kurio-primary"

export function AuthModal({ mode }: AuthModalProps) {
    const navigate = useNavigate()
    const auth = useAuth(mode)
    const returnTo = validateAuthSearch(useSearch({ strict: false }))
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

            if (event.shiftKey && document.activeElement === first) {
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


    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setMessage("")

        if (!isLogin && password !== confirmPassword) {
            setMessage("As senhas não coincidem.")
            return
        }

        auth.mutate({ email, password, username }, {
            onSuccess: () => { void navigate({ ...afterAuthDestination(returnTo), replace: true }) },
            onError: error => setMessage(errorMessage(error)),
        })
    }


    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 px-3 py-4 font-mono sm:items-center"
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
                className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-[578px] flex-col overflow-y-auto overscroll-contain rounded-lg border border-kurio-border bg-kurio-card text-foreground shadow-2xl"
            >
                <button
                    ref={closeRef}
                    type="button"
                    aria-label="Fechar modal"
                    onClick={() => void navigate({ to: "/" })}
                    className="absolute right-5 top-5 z-10 text-kurio-primary hover:opacity-70"
                >
                    <X className="size-6" />
                </button>

                <div className="px-5 pb-8 pt-16 sm:px-12">
                    <h1
                        id="auth-modal-title"
                        className="flex items-center justify-center gap-3 text-2xl font-bold sm:text-3xl"
                    >
                        <Link
                            to="/entrar"
                            search={returnTo}
                            className={
                                isLogin
                                    ? "text-kurio-primary"
                                    : "text-foreground hover:text-kurio-primary"
                            }
                        >
                            Entrar
                        </Link>

                        <span className="h-7 w-px bg-kurio-primary" />

                        <Link
                            to="/cadastro"
                            search={returnTo}
                            className={
                                !isLogin
                                    ? "text-kurio-primary"
                                    : "text-foreground hover:text-kurio-primary"
                            }
                        >
                            Criar conta
                        </Link>
                    </h1>

                    <p className="mx-auto mb-7 mt-10 max-w-md text-center text-sm leading-6 text-foreground">
                        {isLogin
                            ? "Entre para gerenciar sua carteira, coleção e perfil de criador."
                            : "Crie seu perfil de colecionador e conecte uma carteira quando quiser."}
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-3"
                    >
                        {!isLogin && (
                            <div>
                                <label htmlFor="auth-username" className="sr-only">
                                    Nome de usuário
                                </label>
                                <input
                                    id="auth-username"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="Nome de usuário"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    minLength={3}
                                    maxLength={30}
                                    required
                                    className={fieldClass}
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="auth-email" className="sr-only">
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
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                className={fieldClass}
                            />
                        </div>

                        <div className="relative">
                            <label htmlFor="auth-password" className="sr-only">
                                Senha
                            </label>
                            <input
                                id="auth-password"
                                type={showPassword ? "text" : "password"}
                                autoComplete={
                                    isLogin ? "current-password" : "new-password"
                                }
                                placeholder={isLogin ? "Sua senha" : "Senha"}
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
                                    showPassword ? "Ocultar senha" : "Mostrar senha"
                                }
                                onClick={() =>
                                    setShowPassword((current) => !current)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-kurio-secondary hover:text-kurio-primary"
                            >
                                {showPassword ? (
                                    <Eye className="size-5" />
                                ) : (
                                    <EyeOff className="size-5" />
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
                                        showConfirmPassword ? "text" : "password"
                                    }
                                    autoComplete="new-password"
                                    placeholder="Confirmar senha"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(event.target.value)
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
                                        setShowConfirmPassword((current) => !current)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-kurio-secondary hover:text-kurio-primary"
                                >
                                    {showConfirmPassword ? (
                                        <Eye className="size-5" />
                                    ) : (
                                        <EyeOff className="size-5" />
                                    )}
                                </button>
                            </div>
                        )}

                        {isLogin && (
                            <p className="pt-1 text-right">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setMessage(
                                            "A recuperação de senha será implementada com a autenticação.",
                                        )
                                    }
                                    className="text-xs text-kurio-primary hover:underline"
                                >
                                    Esqueceu a senha?
                                </button>
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={auth.isPending}
                            className="mt-4 w-full rounded-md bg-kurio-primary px-5 py-3 text-sm font-bold text-kurio-ink transition-opacity hover:opacity-90"
                        >
                            {isLogin ? "Entrar" : "Criar conta"}
                        </button>
                    </form>

                    {message && (
                        <p
                            role="status"
                            className="mt-4 text-center text-xs leading-5 text-kurio-primary"
                        >
                            {message}
                        </p>
                    )}

                    <div className="my-7 flex items-center gap-4">
                        <div className="h-px flex-1 bg-kurio-border" />
                        <span className="whitespace-nowrap text-xs text-foreground">
                            Ou continue com
                        </span>
                        <div className="h-px flex-1 bg-kurio-border" />
                    </div>

                    <div className="space-y-3">
                        <button
                            type="button"
                            disabled
                            title="Disponível após a integração de autenticação"
                            className="flex w-full items-center justify-center gap-4 rounded-md border border-kurio-border px-4 py-3 text-sm text-kurio-secondary opacity-60"
                        >
                            <span className="text-lg font-bold text-[#4285F4]">
                                G
                            </span>
                            Google (demonstrativo)
                        </button>

                        <button
                            type="button"
                            disabled
                            title="Disponível após a integração de autenticação"
                            className="flex w-full items-center justify-center gap-4 rounded-md border border-kurio-border px-4 py-3 text-sm text-kurio-secondary opacity-60"
                        >
                            <span className="text-lg font-bold text-[#4267B2]">
                                f
                            </span>
                            Facebook (demonstrativo)
                        </button>
                    </div>
                </div>

                <div className="h-2 shrink-0 bg-kurio-primary" />
            </div>
        </div>
    )
}
