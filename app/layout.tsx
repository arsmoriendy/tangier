import { Geist, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { LocalStorageProvider } from "@/contexts/local-storage-ctx"
import { I18nProvider } from "@/components/ui/i18n-provider"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
      className={cn(
        "antialiased",
        fontSans.variable,
        "font-mono",
        jetbrainsMono.variable
      )}
    >
      <head>
        <title>Tangier</title>
        <link rel="icon" href="/icon.svg" />
      </head>
      <body>
        <ThemeProvider>
          <LocalStorageProvider>
            <I18nProvider locale="en-ID">{children}</I18nProvider>
            <Toaster />
          </LocalStorageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
