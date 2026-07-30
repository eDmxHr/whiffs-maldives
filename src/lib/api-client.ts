import axios from "axios"

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = error.response?.data?.error

    if (apiError) {
      return Promise.reject(apiError)
    }

    return Promise.reject({
      code: "SERVER_ERROR",
      message: "Something went wrong. Please try again.",
    })
  }
)
