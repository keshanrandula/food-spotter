import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FoodSpotter - AI-Powered Restaurant & Dining Guide',
    short_name: 'FoodSpotter',
    description: 'Find top-rated local restaurants, Jaffna curries, artisan pizzas, and seafood with live maps and AI review summaries.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#e11d48',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
