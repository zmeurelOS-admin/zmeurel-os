import type { Metadata, Viewport } from 'next'

import { HighVisibilityInit } from '@/components/app/HighVisibilityInit'
import { ServiceWorkerRegister } from '@/components/app/ServiceWorkerRegister'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zmeurel',
  description: 'Aplicatie agricola pentru management de teren, productie si vanzari.',
  manifest: '/manifest.json',
  applicationName: 'Zmeurel',
  appleWebApp: {
    capable: true,
    title: 'Zmeurel',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: '/icons/icon-192.png',
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#166534" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Zmeurel" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <HighVisibilityInit />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
