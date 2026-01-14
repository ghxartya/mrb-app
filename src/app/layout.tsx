import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'

import './globals.css'
import { Providers } from './providers'

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800']
})

export const metadata: Metadata = {
  title: 'Meeting Room Booking App',
  description: 'Book meeting rooms easily and efficiently'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${montserrat.variable} min-h-screen antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
