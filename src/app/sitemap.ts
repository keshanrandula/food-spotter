import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://foodspotter.io';
  const currentDate = new Date().toISOString();

  const cuisineSlugs = [
    'sri-lankan',
    'seafood',
    'italian',
    'japanese',
    'chinese',
    'indian',
    'burgers-fast-food',
    'cafes-desserts',
    'rooftop-bars',
    'buffet-fine-dining',
  ];

  const cuisineEntries: MetadataRoute.Sitemap = cuisineSlugs.map((slug) => ({
    url: `${baseUrl}/?cuisine=${slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'always',
      priority: 1.0,
    },
    ...cuisineEntries,
  ];
}
