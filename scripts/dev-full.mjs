import { spawn } from 'node:child_process'
const children = [
  spawn(process.execPath, ['--experimental-strip-types', 'server/start.ts'], { stdio: 'inherit', windowsHide: true }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', '5173', '--strictPort'], { stdio: 'inherit', windowsHide: true }),
]
let stopping = false
function stop(code = 0) {
  if (stopping) return
  stopping = true
  process.exitCode = code
  for (const child of children) child.kill()
}
for (const child of children) { child.on('error', () => stop(1)); child.on('exit', code => stop(code ?? 0)) }
process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())
