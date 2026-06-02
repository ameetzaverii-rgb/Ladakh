import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { CommandBar } from '@/components/CommandBar'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Leh Ladakh — Workation Manager',
  description: '21-day Leh Ladakh workation planner, journal, and budget tracker',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(localStorage.getItem('theme')==='light'){document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();",
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark text-sand font-sans antialiased min-h-screen">
        <Navbar />
        <main className="min-h-screen pt-14">
          {children}
        </main>
        <CommandBar />
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: '#1a1208',
              border: '1px solid rgba(201,153,58,0.3)',
              color: '#e8d9bc',
            },
          }}
        />
      </body>
    </html>
  )
}
