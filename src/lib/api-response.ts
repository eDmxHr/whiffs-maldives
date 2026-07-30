import type { ApiErrorCode } from "@/types/api"

export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json({ data }, init)
}

export function collection<T>(data: T[], init?: ResponseInit) {
  return Response.json(
    {
      data,
      meta: {
        page: 1,
        perPage: data.length,
        total: data.length,
        totalPages: 1,
      },
    },
    init
  )
}

export function fail(
  code: ApiErrorCode,
  message: string,
  status = 400,
  details?: Record<string, unknown>
) {
  return Response.json({ error: { code, message, details } }, { status })
}
