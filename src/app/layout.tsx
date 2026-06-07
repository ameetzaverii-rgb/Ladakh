import type { Metadata } from 'next'
import './globals.css'
import { TabBar } from '@/components/TabBar'
import { CommandBar } from '@/components/CommandBar'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Leh Ladakh — Workation Manager',
  description: '21-day Leh Ladakh workation planner, journal, and budget tracker',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark text-sand font-sans antialiased min-h-screen">
        <main className="min-h-screen pb-24">
          {children}
        </main>
        <TabBar />
        <CommandBar />
        <Toaster
          theme="light"
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #e8e3d8',
              color: '#2a3140',
            },
          }}
        />
      </body>
    </html>
  )
}
