import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { GoogleTagManager } from '@/components/analytics/GoogleTagManager'
import { VercelAnalytics } from '@/components/analytics/VercelAnalytics'
import { OrganizationJsonLd } from '@/components/seo/OrganizationJsonLd'
import { buildHomeMetadata } from '@/lib/seo/metadata'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = buildHomeMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID ?? ''

  return (
    <html lang="es" className={inter.variable}>
      <head>
        <OrganizationJsonLd />
      </head>
      <body>
        <a href="#main-content" className="skip-nav">
          Ir al contenido principal
        </a>
        <GoogleTagManager gtmId={gtmId} />
        <main id="main-content">{children}</main>
        <VercelAnalytics />
      </body>
    </html>
  )
}
