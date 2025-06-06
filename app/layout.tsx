import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import BottomNav from './components/BottomNav'
import Navbar from './components/Navbar'
import GoogleAnalytics from './components/GoogleAnalytics'
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
  title: 'KitchenAI - Smart Recipe Discovery & AI Meal Planning',
  description: 'Discover amazing recipes from top food creators, watch interactive cooking videos, and let AI plan your meals. Save recipes, generate smart shopping lists, and master cooking with KitchenAI.',
  keywords: [
    'recipe discovery', 'cooking videos', 'AI meal planning', 'food creators', 'instagram recipes',
    'smart shopping lists', 'meal prep', 'cooking app', 'recipe collection', 'food inventory',
    'kitchen management', 'recipe reels', 'chef videos', 'cooking tutorials', 'meal planning app'
  ],
  authors: [{ name: 'KitchenAI Team' }],
  creator: 'KitchenAI',
  publisher: 'KitchenAI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'KitchenAI - Smart Recipe Discovery & AI Meal Planning',
    description: 'Discover amazing recipes from top food creators, watch interactive cooking videos, and let AI plan your meals. Save recipes, generate smart shopping lists, and master cooking.',
    type: 'website',
    locale: 'en_US',
    url: 'https://kitchenai.vercel.app',
    siteName: 'KitchenAI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'KitchenAI - Smart Recipe Discovery & AI Meal Planning'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@KitchenAI',
    creator: '@KitchenAI',
    title: 'KitchenAI - Smart Recipe Discovery & AI Meal Planning',
    description: 'Discover amazing recipes from top food creators, watch interactive cooking videos, and let AI plan your meals. 🍳✨',
    images: ['/twitter-image.jpg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KitchenAI',
    startupImage: '/apple-startup.png',
  },
  applicationName: 'KitchenAI',
  category: 'food',
  classification: 'Recipe Discovery & Meal Planning',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'KitchenAI',
    'msapplication-TileColor': '#91c11e',
    'msapplication-config': '/browserconfig.xml',
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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "KitchenAI",
    "description": "Discover amazing recipes from top food creators, watch interactive cooking videos, and let AI plan your meals. Save recipes, generate smart shopping lists, and master cooking.",
    "url": "https://kitchenai.vercel.app",
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web Browser, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    },
    "author": {
      "@type": "Organization",
      "name": "KitchenAI Team"
    },
    "keywords": "recipe discovery, cooking videos, AI meal planning, food creators, smart shopping lists",
    "screenshot": "https://kitchenai.vercel.app/screenshot.jpg"
  };

  return (
    <html lang="en" className={`h-full ${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#91c11e" />
        <meta name="theme-color" content="#91c11e" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`h-full bg-gray-light`}>
        <GoogleAnalytics />
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