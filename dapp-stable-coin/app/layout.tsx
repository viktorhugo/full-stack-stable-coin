import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"

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

export const metadata: Metadata = {
  title: "DSC Protocol - Decentralized StableCoin",
  description: "Advanced DeFi protocol for decentralized stablecoin management",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable} dark`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
