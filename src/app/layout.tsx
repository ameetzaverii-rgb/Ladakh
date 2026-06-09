import type { Metadata } from 'next'
import './globals.css'
import { TabBar } from '@/components/TabBar'
import { CommandBar } from '@/components/CommandBar'
import { Providers } from '@/components/Providers'
import { Toaster } from 'sonner'
import { ensureSchema } from '@/lib/migrations'
import { ensureContent } from '@/lib/seedContent'

export const metadata: Metadata = {
  title: 'Tarcho — Himalayan trip planner',
  description: 'Tarcho — plan, journal and budget your Himalayan trip in one calm, colourful place.',
  icons: { icon: '/favicon.ico' },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Self-heal the schema on first boot so deploys with new columns never 500,
  // then seed any destination content that hasn't been populated yet.
  await ensureSchema()
  await ensureContent()
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Marcellus&family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark text-sand font-sans antialiased min-h-screen">
        <Providers>
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
        </Providers>
      </body>
    </html>
  )
}
