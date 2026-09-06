import { NextRequest, NextResponse } from 'next/server';
import { fetchNearbyRestaurants, searchRestaurants } from '@/services/googleApi';
import { generateReviewSummary, summarizeReviews } from '@/services/aiService';

export const dynamic = 'force-dynamic';

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
      ? searchParams.get('priceLevels')!.split(',').map(Number)
      : [];
    const openNow = searchParams.get('openNow') === 'true';

    // Fetch restaurants matching location, coordinates, and filters
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

    // Filter results if filters applied
    let filteredRestaurants = restaurants;
    if (minRating > 0) {
      filteredRestaurants = filteredRestaurants.filter(r => r.rating >= minRating);
    }
    if (priceLevels.length > 0) {
      filteredRestaurants = filteredRestaurants.filter(r => priceLevels.includes(r.priceLevel));
    }
    if (openNow) {
      filteredRestaurants = filteredRestaurants.filter(r => r.openNow);
    }

    // Combine reviews and generate AI summary
    const mergedRestaurants = await Promise.all(
      filteredRestaurants.map(async (restaurant) => {
        const top5Reviews = restaurant.reviews.slice(0, 5);
        const reviewsSingleString = top5Reviews.map(r => r.text).join(' ');

        const conciseSummary = await generateReviewSummary(reviewsSingleString);
        const fullAiSummary = await summarizeReviews(restaurant.name, top5Reviews);
        fullAiSummary.overallSummary = conciseSummary;

        return {
          ...restaurant,
          aiReviewSummary: conciseSummary,
          aiSummary: fullAiSummary,
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: mergedRestaurants.length,
      data: mergedRestaurants,
    });
  } catch (error: any) {
    console.error('Error in frontend /api/places GET route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch places' },
      { status: 500 }
    );
  }
}
