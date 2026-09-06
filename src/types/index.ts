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
  priceLevel: number; // 1 ($), 2 ($$), 3 ($$$), 4 ($$$$)
  priceString: string;
  address: string;
  lat: number;
  lng: number;
  photos: string[];
  reviews: Review[];
  phone?: string;
  website?: string;
  openNow: boolean;
  distance?: number; // In kilometers
  cuisine: string;
  tags: string[];
  isSaved?: boolean;
  menuDishes?: string[];
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
  radius: number; // km
  minRating: number;
  priceLevels: number[];
  cuisine: string;
  openNow: boolean;
  userLat?: number;
  userLng?: number;
}

export interface RecommendedSpot {
  restaurantId: string;
  restaurantName: string;
  reason: string;
  suggestedDishes?: string[];
  estimatedCostPerPerson?: string;
}

export interface FoodPairing {
  dish: string;
  beveragePairing: string;
  dessertPairing: string;
  notes: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendations?: RecommendedSpot[];
  pairings?: FoodPairing[];
}

