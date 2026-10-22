import { toMoneyTransport } from '../../domain/money-transport'
import { HttpResponse, type JsonBodyType } from 'msw'
import { transaction, type Database } from '../data/database'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) { super(message); this.status = status }
}
export function requireValue(condition: unknown, message: string, status = 400): asserts condition {
  if (!condition) throw new ApiError(status, message)
}
export async function body(request: Request): Promise<Record<string, unknown>> {
  try {
    const value: unknown = await request.json()
    requireValue(typeof value === 'object' && value !== null && !Array.isArray(value), 'JSON inválido.')
    return value as Record<string, unknown>
  } catch { throw new ApiError(400, 'Corpo JSON inválido.') }
}
export function textField(value: unknown, label: string, max = 200) {
  requireValue(typeof value === 'string' && value.trim().length > 0 && value.length <= max, `${label} inválido ou ausente.`)
  return value.trim()
}
export function respond(write: boolean, action: (db: Database) => JsonBodyType | Promise<JsonBodyType>, status = 200) {
  return transaction(write, action)
    .then(data => HttpResponse.json(toMoneyTransport(data), { status }))
    .catch((error: unknown) => HttpResponse.json({ message: error instanceof ApiError ? error.message : 'Não foi possível acessar a base local. Verifique o armazenamento do navegador.' }, { status: error instanceof ApiError ? error.status : 503 }))
}
