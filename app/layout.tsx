import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import BottomNav from './components/BottomNav'
import Navbar from './components/Navbar'
import { Providers } from './providers'
import { Toaster } from 'sonner'
import ErrorBoundary from './components/ErrorBoundary'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat'
})

export const metadata: Metadata = {
  title: 'KitchenAI - Smart Meal Planning & Food Inventory',
  description: 'AI-powered meal planning and food inventory management with budget optimization and deal finding',
  keywords: ['meal planning', 'AI', 'recipes', 'food inventory', 'cooking', 'kitchen management'],
  authors: [{ name: 'KitchenAI Team' }],
  openGraph: {
    title: 'KitchenAI - Smart Meal Planning & Food Inventory',
    description: 'AI-powered meal planning and food inventory management with budget optimization and deal finding',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KitchenAI - Smart Meal Planning & Food Inventory',
    description: 'AI-powered meal planning and food inventory management with budget optimization and deal finding',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KitchenAI',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body className={`h-full bg-gray-light`}>
        <ErrorBoundary>
          <Providers>
            <Navbar />
            <main className="min-h-full pb-16">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
            <BottomNav />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'white',
                  color: 'black',
                  border: '1px solid #e5e7eb',
                },
              }}
            />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
} 