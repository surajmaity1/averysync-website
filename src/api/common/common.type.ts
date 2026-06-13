export type TMinimalUser = {
  id: string
  name: string
}

export type TApiResponse<T> = {
  data: T
  message: string
}
