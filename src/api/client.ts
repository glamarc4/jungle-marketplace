import { fromMoneyTransport } from '../domain/money-transport'
import axios from 'axios'
export const client = axios.create({ baseURL: '/api', timeout: 15_000, headers: { Accept: 'application/json' } })
// Decode the wire contract once, before handing data to Query or components.
client.interceptors.response.use(response => {
  response.data = fromMoneyTransport(response.data)
  return response
})
export function errorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) return error.response?.data?.message ?? 'Não foi possível acessar a API. Tente novamente.'
  return error instanceof Error ? error.message : 'Ocorreu um erro. Tente novamente.'
}

export function isUnauthorized(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401
}
