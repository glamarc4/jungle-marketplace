import { createServer } from 'vite'

// Trace HTML files must not trigger a full page reload in another running test.
const server = await createServer({
  server: {
    host: '127.0.0.1', port: 5184, strictPort: true,
    watch: { ignored: ['**/reports/**', '**/test-results/**', '**/playwright-report/**'] },
  },
})
await server.listen()
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => { void server.close().then(() => process.exit(0)) })
}
