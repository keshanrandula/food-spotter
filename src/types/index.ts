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
  priceLevel?: number;
  address: string;
  photoUrl?: string;
  notes?: string;
  collectionId?: string; // e.g. "default", "weekend_brunch", "must_try"
  isVisited?: boolean;
  tags?: string[];
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  badge?: string;
  favoriteCuisines: string[];
  dietaryPreferences: string[];
  createdAt: string;
}

export interface UserCollection {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface UserReview {
  id: string;
  restaurantId: string;
  restaurantName: string;
  authorId?: string;
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  photos?: string[];
  recommendedDish?: string;
  visitDate?: string;
  likesCount?: number;
  createdAt: string;
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

export interface DietaryInfo {
  isVeg: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isGlutenFree: boolean;
  spicyLevel: 0 | 1 | 2 | 3; // 0=mild, 1=low, 2=medium, 3=extra spicy
}

export interface ScannedMenuItem {
  id: string;
  name: string;
  localName?: string;
  category: string;
  price: string;
  description: string;
  dietary: DietaryInfo;
  allergens: string[];
  confidenceScore: number;
  recommendedPairing?: string;
}

export interface MenuScanResult {
  restaurantName?: string;
  currency?: string;
  categories: string[];
  items: ScannedMenuItem[];
  summary: string;
  healthTips?: string[];
}

export interface VoiceQueryResult {
  rawTranscript: string;
  language: 'si-LK' | 'en-US' | 'singlish';
  extractedLocation?: string;
  extractedKeyword?: string;
  extractedCuisine?: string;
  extractedMood?: string;
  extractedBudget?: number;
  interpretedIntent: string;
  suggestedAction: 'search_map' | 'ask_chef' | 'filter_list';
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  streetName?: string;
  maneuverType?: 'depart' | 'turn-left' | 'turn-right' | 'straight' | 'roundabout' | 'arrive';
}

export interface TransitStop {
  id: string;
  name: string;
  type: 'bus' | 'train' | 'parking';
  distanceMeters: number;
  lat: number;
  lng: number;
  lines?: string[];
}

export interface RouteDetails {
  origin: { lat: number; lng: number; name?: string };
  destination: { lat: number; lng: number; name?: string };
  distanceKm: number;
  durationMinutes: number;
  travelMode: 'driving' | 'walking' | 'cycling' | 'transit';
  polyline: [number, number][]; // [lat, lng] array
  steps: RouteStep[];
  nearbyTransit: TransitStop[];
  trafficLevel?: 'low' | 'moderate' | 'heavy';
}

export interface MenuItem {
  id: string;
  name: string;
  localName?: string;
  category: 'Appetizers' | 'Signature Mains' | 'Wood-Fired & Grills' | 'Street Specialties' | 'Beverages' | 'Artisanal Desserts';
  price: number;
  priceFormatted: string;
  description: string;
  imageUrl?: string;
  isSignature?: boolean;
  dietary: DietaryInfo;
  allergens?: string[];
  preparationTimeMins?: number;
}

export interface PreOrderItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface TableReservation {
  id: string;
  bookingCode: string; // e.g. "FS-92841"
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhoto?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // e.g. "07:30 PM"
  guestsCount: number;
  seatingArea: 'indoor_ac' | 'rooftop' | 'garden_patio' | 'chefs_counter';
  specialOccasion?: 'none' | 'birthday' | 'anniversary' | 'romantic_date' | 'business';
  specialRequests?: string;
  preOrderedItems: PreOrderItem[];
  totalEstimatedCost: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}
