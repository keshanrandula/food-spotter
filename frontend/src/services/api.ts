import { Restaurant, SavedRestaurant, SearchFilters } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

export async function getPlaces(filters: SearchFilters): Promise<Restaurant[]> {
  const hasGpsCoords = filters.userLat !== undefined && filters.userLng !== undefined;

  const params = new URLSearchParams({
    keyword: filters.keyword || '',
    location: filters.location || 'Colombo, Sri Lanka',
    radius: (filters.radius || 15).toString(),
    minRating: (filters.minRating || 0).toString(),
    priceLevels: filters.priceLevels ? filters.priceLevels.join(',') : '',
    cuisine: filters.cuisine || '',
    openNow: filters.openNow ? 'true' : 'false',
  });

  // Only send coords when GPS-detected; omit them for text-based city searches
  // so the backend geocodes the location string instead of using stale defaults
  if (hasGpsCoords) {
    params.set('lat', filters.userLat!.toString());
    params.set('lng', filters.userLng!.toString());
  }


  try {
    const res = await fetch(`${API_BASE_URL}/places?${params.toString()}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
  } catch (err) {
    console.warn('Frontend API fetch error, falling back to local proxy:', err);
    try {
      const fallbackRes = await fetch(`/api/places?${params.toString()}`);
      const fallbackData = await fallbackRes.json();
      if (fallbackData.success && Array.isArray(fallbackData.data)) {
        return fallbackData.data;
      }
    } catch (e) {}
  }
  return [];
}

export async function getSavedPlaces(): Promise<SavedRestaurant[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/saved`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
  } catch (err) {
    console.warn('Failed to fetch saved places from backend:', err);
  }
  return [];
}

export async function savePlace(restaurant: Restaurant): Promise<SavedRestaurant | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/saved`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placeId: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        rating: restaurant.rating,
        priceLevel: restaurant.priceLevel,
        address: restaurant.address,
        photoUrl: restaurant.photos[0] || '',
        tags: restaurant.tags,
      }),
    });
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
  } catch (err) {
    console.error('Error saving restaurant to backend:', err);
  }
  return null;
}

export async function deleteSavedPlace(placeId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/saved?placeId=${placeId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return data.success ?? false;
  } catch (err) {
    console.error('Error deleting saved restaurant:', err);
    return false;
  }
}
