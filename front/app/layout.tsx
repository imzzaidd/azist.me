import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Web3Provider } from '@/lib/web3/providers'
import { AppProvider } from '@/lib/app-context'
import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })

export const metadata: Metadata = {
  title: 'azist.me - Proof of Presence',
  description: 'Gana recompensas por asistir a eventos del mundo real. Asiste, valida y gana.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0fdf4' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0f1a' },
  ],
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${_inter.variable} ${_spaceGrotesk.variable} font-sans antialiased`}>
        <Web3Provider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <AppProvider>
              {children}
            </AppProvider>
          </ThemeProvider>
        </Web3Provider>
        <Analytics />
      </body>
    </html>
  )
}
