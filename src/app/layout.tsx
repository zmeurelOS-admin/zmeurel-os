import type { Metadata, Viewport } from 'next'

import { HighVisibilityInit } from '@/components/app/HighVisibilityInit'
import { ServiceWorkerRegister } from '@/components/app/ServiceWorkerRegister'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zmeurel',
  description: 'Aplicatie agricola pentru management de teren, productie si vanzari.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Zmeurel',
  appleWebApp: {
    capable: true,
    title: 'Zmeurel',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: '/apple-icon.png',
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1f8f4a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <HighVisibilityInit />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
