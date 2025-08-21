import type React from "react"
import { DM_Sans } from "next/font/google"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"

import { Toaster } from "sonner"
import { Providers } from "./providers"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable} dark`}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "rgb(15 23 42 / 0.9)",
                border: "1px solid rgb(132 204 22 / 0.2)",
                color: "rgb(226 232 240)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
