import axios from 'axios'
export const client = axios.create({ baseURL: '/api', timeout: 15_000, headers: { Accept: 'application/json' } })
export function errorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) return error.response?.data?.message ?? 'Não foi possível acessar a API. Tente novamente.'
  return error instanceof Error ? error.message : 'Ocorreu um erro. Tente novamente.'
}

export function isUnauthorized(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401
}
