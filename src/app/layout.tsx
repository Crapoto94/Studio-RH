import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider'

export const metadata: Metadata = {
  title: 'RH Studio — DSI Ivry-sur-Seine',
  description: 'Application de gestion des agents, licences et Active Directory',
}

import { TooltipProvider } from '@/components/ui/tooltip'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body>
        <SessionProvider>
          <ReactQueryProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
