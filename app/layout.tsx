import type { Metadata } from 'next'
import { Fraunces, Outfit } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', weight: ['300','400','600','700'] })
const outfit   = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['400','500','600','700','800'] })

export const metadata: Metadata = {
  title: 'Mautoulouse — La communauté mauricienne de Toulouse',
  description: 'Rejoignez la communauté des Mauriciens de Toulouse. Posez vos questions, participez aux événements.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${outfit.variable}`}>
      <body className="font-body bg-sand min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
