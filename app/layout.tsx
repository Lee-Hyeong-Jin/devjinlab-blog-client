import type { Metadata } from "next"
import {
  Geist_Mono,
  Gowun_Batang,
  Instrument_Serif,
  Inter,
} from "next/font/google"

import "./globals.css"
import { GrainOverlay } from "@/components/grain-overlay"
import { Header } from "@/components/layout/header"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const SITE_URL = "https://blog.devjinlab.com"
const SITE_DESCRIPTION = "개발하며 정리한 생각을 기록하는 공간입니다."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "devjinlab blog", template: "%s | devjinlab blog" },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "devjinlab blog",
    title: "devjinlab blog",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: "devjinlab blog",
    description: SITE_DESCRIPTION,
  },
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
})

const gowunBatang = Gowun_Batang({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-kr-serif",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        instrumentSerif.variable,
        gowunBatang.variable
      )}
    >
      <body>
        <ThemeProvider>
          <GrainOverlay />
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
