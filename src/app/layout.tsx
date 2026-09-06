import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Find Resturant - AI-Powered Restaurant Locator & Review Insights',
  description: 'Discover top-rated local restaurants with Google Places integration, instant AI review summaries powered by OpenRouter, interactive mapping, and personal bookmarks.',
  keywords: ['restaurant finder', 'food locator', 'AI review summary', 'Google places', 'dining colombo'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col selection:bg-savor-600 selection:text-white">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

