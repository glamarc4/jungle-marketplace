import { errorMessage } from '@/api/client'
export function RequestState({ pending, error, retry }: { pending?: boolean; error?: unknown; retry?: () => void }) {
  if (pending) return <p role="status" className="p-4 font-mono text-sm text-kurio-secondary">Carregando...</p>
  if (!error) return null
  return <div role="alert" className="p-4 font-mono text-sm text-red-400">{errorMessage(error)}{retry && <button type="button" onClick={retry} className="ml-3 underline">Tentar novamente</button>}</div>
}
