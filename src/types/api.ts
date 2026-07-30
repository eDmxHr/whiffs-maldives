export type ApiErrorCode =
  | "DUPLICATE_SLUG"
  | "DUPLICATE_OFFERING_SIZE"
  | "INVALID_PRICE_INPUT"
  | "INVALID_PUBLISH_STATE"
  | "INSUFFICIENT_PUBLISH_DATA"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"

export interface ApiError {
  code: ApiErrorCode
  message: string
  details?: Record<string, unknown>
}

export interface ApiSuccess<T> {
  data: T
}

export interface ApiCollection<T> {
  data: T[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

export interface ApiFailure {
  error: ApiError
}
