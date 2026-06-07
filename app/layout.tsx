import { Geist, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { LocalStorageProvider } from "@/contexts/local-storage-ctx"
import { I18nProvider } from "@/components/ui/i18n-provider"
import { NextIntlClientProvider } from "next-intl"
import { ZodConfig } from "@/lib/zod-config"

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
        <title>tangier</title>
        <link rel="icon" href="/icon.svg" />
      </head>
      <body>
        <ThemeProvider>
          <LocalStorageProvider>
            <NextIntlClientProvider>
              <I18nProvider>
                <ZodConfig>
                  {children}
                  <Toaster />
                </ZodConfig>
              </I18nProvider>
            </NextIntlClientProvider>
          </LocalStorageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
