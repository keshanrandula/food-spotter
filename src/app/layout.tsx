import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://foodspotter.io';

export const viewport: Viewport = {
  themeColor: '#e11d48',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'FoodSpotter - AI-Powered Restaurant Finder & Dining Guide',
    template: '%s | FoodSpotter AI',
  },
  description:
    'Discover top-rated restaurants, authentic Sri Lankan curries, fresh seafood, cafes, and fine dining. Features live interactive Leaflet maps, table reservations, and instant AI review summaries powered by OpenRouter.',
  keywords: [
    'restaurant finder',
    'find restaurants near me',
    'Colombo restaurants',
    'Sri Lanka food guide',
    'AI restaurant reviews',
    'table booking Sri Lanka',
    'Jaffna crab curry',
    'best seafood restaurants',
    'open now dining',
    'food spotter',
    'interactive restaurant map',
    'halal dining colombo',
  ],
  authors: [{ name: 'FoodSpotter Team', url: siteUrl }],
  creator: 'FoodSpotter Intelligence',
  publisher: 'FoodSpotter Inc.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FoodSpotter - Discover Best Dining & AI Restaurant Insights',
    description:
      'Search restaurants by cuisine, budget, live open status, and dietary needs with interactive map exploration and instant AI review synthesis.',
    url: siteUrl,
    siteName: 'FoodSpotter',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'FoodSpotter - Modern AI Restaurant Discovery Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FoodSpotter - AI Restaurant Locator & Table Reservations',
    description:
      'Find the best food spots near you with real-time interactive maps, table reservations, and AI review summaries.',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'Food & Drink',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FoodSpotter',
    url: siteUrl,
    description: 'AI-Powered Restaurant Discovery, Live Maps & Table Reservations Platform.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?keyword={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const jsonLdOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FoodSpotter',
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`,
    sameAs: [
      'https://twitter.com/foodspotter',
      'https://facebook.com/foodspotter',
      'https://instagram.com/foodspotter',
    ],
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col selection:bg-rose-600 selection:text-white">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
