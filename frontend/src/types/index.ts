export interface Review {
  id: string;
  authorName: string;
  authorPhoto?: string;
  rating: number;
  relativeTime: string;
  text: string;
}

export interface AiSummary {
  overallSummary: string;
  pros: string[];
  cons: string[];
  mustTryDishes: string[];
  ambiance: string;
  overallScore: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  userRatingsTotal: number;
  priceLevel: number;
  priceString: string;
  address: string;
  lat: number;
  lng: number;
  photos: string[];
  reviews: Review[];
  phone?: string;
  website?: string;
  openNow: boolean;
  distance?: number;
  cuisine: string;
  tags: string[];
  isSaved?: boolean;
  aiReviewSummary?: string;
  aiSummary?: AiSummary;
}

export interface SavedRestaurant {
  _id?: string;
  id?: string;
  placeId: string;
  name: string;
  cuisine: string;
  rating: number;
  address: string;
  photoUrl?: string;
  notes?: string;
  createdAt?: string;
}

export interface SearchFilters {
  keyword: string;
  location: string;
  radius: number;
  minRating: number;
  priceLevels: number[];
  cuisine: string;
  openNow: boolean;
  userLat?: number;
  userLng?: number;
}
