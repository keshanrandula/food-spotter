import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SavorAI - Discover Exceptional Dining Powered by AI',
  description: 'Real-time menus, sentiment analysis, and dish recommendations tailored to your exact taste.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-savor-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
