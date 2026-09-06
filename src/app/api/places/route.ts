import { NextRequest, NextResponse } from 'next/server';
import { searchRestaurants } from '@/services/googleApi';
import { generateReviewSummary, summarizeReviews } from '@/services/aiService';
import { Restaurant } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/places
 * Receives pre-fetched restaurants (e.g. from client-side OSM), enriches with AI summaries.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawRestaurants: Restaurant[] = body.restaurants || [];

    if (!Array.isArray(rawRestaurants) || rawRestaurants.length === 0) {
      return NextResponse.json({ success: false, error: 'No restaurants provided' }, { status: 400 });
    }

    const enriched = await Promise.all(
      rawRestaurants.map(async (restaurant) => {
        const top5Reviews = (restaurant.reviews || []).slice(0, 5);
        const reviewsText = top5Reviews.map(r => r.text).join(' ');
        try {
          const conciseSummary = await generateReviewSummary(reviewsText || restaurant.name);
          const fullAiSummary = await summarizeReviews(restaurant.name, top5Reviews);
          fullAiSummary.overallSummary = conciseSummary;
          return { ...restaurant, aiReviewSummary: conciseSummary, aiSummary: fullAiSummary };
        } catch {
          return restaurant;
        }
      })
    );

    return NextResponse.json({ success: true, count: enriched.length, data: enriched });
  } catch (error: any) {
    console.error('POST /api/places error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/places
 * Server-side restaurant search (curated dataset / Google Places if key set).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const location = searchParams.get('location') || '';
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : 6.9271;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : 79.8450;
    const keyword = searchParams.get('keyword') || searchParams.get('cuisine') || 'restaurant';
    const radius = parseFloat(searchParams.get('radius') || '15');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const priceLevels = searchParams.get('priceLevels')
      ? searchParams.get('priceLevels')!.split(',').filter(Boolean).map(Number)
      : [];
    const openNow = searchParams.get('openNow') === 'true';

    const restaurants = await searchRestaurants({
      keyword,
      location,
      radius,
      minRating,
      priceLevels,
      cuisine: searchParams.get('cuisine') || '',
      openNow,
      userLat: lat,
      userLng: lng,
    });

    let filtered = restaurants;
    if (minRating > 0) filtered = filtered.filter(r => r.rating >= minRating);
    if (priceLevels.length > 0) filtered = filtered.filter(r => priceLevels.includes(r.priceLevel));
    if (openNow) filtered = filtered.filter(r => r.openNow);

    const merged = await Promise.all(
      filtered.map(async (restaurant) => {
        const top5Reviews = (restaurant.reviews || []).slice(0, 5);
        const reviewsText = top5Reviews.map(r => r.text).join(' ');
        try {
          const conciseSummary = await generateReviewSummary(reviewsText);
          const fullAiSummary = await summarizeReviews(restaurant.name, top5Reviews);
          fullAiSummary.overallSummary = conciseSummary;
          return { ...restaurant, aiReviewSummary: conciseSummary, aiSummary: fullAiSummary };
        } catch {
          return restaurant;
        }
      })
    );

    return NextResponse.json({ success: true, count: merged.length, data: merged });
  } catch (error: any) {
    console.error('GET /api/places error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
