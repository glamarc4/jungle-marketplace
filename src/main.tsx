import { RealtimeProvider } from './realtime/RealtimeProvider'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './api/query-client'
import './index.css'
import App from './App.tsx'
import './styles/globals.css'

async function start() {
  // This repository is a standalone demo, including `npm run preview`.
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledFrame: 'bypass' })
  window.addEventListener('storage', event => {
    if (event.key === 'kurio:api:v1' || event.key === null) void queryClient.invalidateQueries()
  })
  createRoot(document.getElementById('root')!).render(
    <StrictMode><QueryClientProvider client={queryClient}><RealtimeProvider><App /></RealtimeProvider></QueryClientProvider></StrictMode>,
  )
}
void start().catch(() => {
  document.getElementById('root')!.textContent = 'Não foi possível iniciar a API de demonstração. Use localhost ou HTTPS e permita service workers. Recarregue para tentar novamente.'
})
