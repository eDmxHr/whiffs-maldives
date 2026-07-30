import { Manrope } from "next/font/google"
import localFont from "next/font/local"

import "./globals.css"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" })

const canela = localFont({
  src: [
    { path: "../../Canela Collection/Canela Family/Canela-Regular-Trial.otf", weight: "400", style: "normal" },
    { path: "../../Canela Collection/Canela Family/Canela-Medium-Trial.otf", weight: "500", style: "normal" },
    { path: "../../Canela Collection/Canela Family/Canela-Bold-Trial.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-canela",
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", manrope.variable, canela.variable, "font-sans")}
    >
      <body>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
