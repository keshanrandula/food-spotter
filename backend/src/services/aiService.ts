import axios from 'axios';
import { backendConfig } from '../config/env';

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

export interface ReviewItem {
  id?: string;
  authorName?: string;
  rating?: number;
  text?: string;
  relativeTime?: string;
}

const POSITIVE_WORDS = [
  'delicious', 'tasty', 'flavorful', 'fresh', 'amazing', 'superb', 'excellent',
  'great', 'wonderful', 'authentic', 'crispy', 'tender', 'juicy', 'exquisite',
  'friendly', 'attentive', 'hospitable', 'welcoming', 'cozy', 'romantic',
  'stunning', 'vibrant', 'clean', 'spotless', 'perfection', 'succulent',
  'masterful', 'generous', 'delightful', 'charming', 'top-notch', 'stellar'
];

const NEGATIVE_WORDS = [
  'slow', 'delay', 'waited', 'waiting', 'cold', 'salty', 'bland', 'tasteless',
  'overpriced', 'expensive', 'pricy', 'pricey', 'noisy', 'loud', 'crowded',
  'cramped', 'rude', 'unfriendly', 'poor', 'dirty', 'oily', 'greasy',
  'tough', 'small portion', 'disappointing', 'rush', 'hard to park', 'parking'
];

const COMMON_DISH_TERMS = [
  'curry', 'crab', 'prawns', 'seafood', 'kottu', 'kothu', 'hopper', 'roti', 'biryani',
  'pasta', 'tagliolini', 'tagliatelle', 'gnocchi', 'ravioli', 'risotto', 'pizza', 'sourdough',
  'sushi', 'sashimi', 'nigiri', 'maki', 'toro', 'ramen', 'wagyu', 'steak', 'ribeye',
  'burger', 'fries', 'tacos', 'truffle', 'cheesecake', 'tiramisu', 'gelato', 'fondant',
  'cocktail', 'espresso', 'cappuccino', 'mocktail', 'platter', 'salad', 'soup'
];

/**
 * Intelligent NLP Sentiment & Entity Extraction Fallback for Backend
 */
function analyzeReviewsHeuristically(restaurantName: string, reviews: ReviewItem[]): AiSummary {
  const allTexts = reviews.map(r => r.text || '').filter(Boolean);
  const combinedText = allTexts.join(' ');
  const textLower = combinedText.toLowerCase();

  let posScore = 0;
  let neuScore = 0;
  let negScore = 0;

  if (reviews.length > 0) {
    reviews.forEach(r => {
      const rText = (r.text || '').toLowerCase();
      let reviewPosWords = POSITIVE_WORDS.filter(w => rText.includes(w)).length;
      let reviewNegWords = NEGATIVE_WORDS.filter(w => rText.includes(w)).length;
      const rating = r.rating || 4;

      if (rating >= 4.5) reviewPosWords += 3;
      else if (rating >= 3.5) reviewPosWords += 1;
      else if (rating <= 2.5) reviewNegWords += 3;
      else neuScore += 1;

      if (reviewPosWords > reviewNegWords) posScore += (reviewPosWords - reviewNegWords + 1);
      else if (reviewNegWords > reviewPosWords) negScore += (reviewNegWords - reviewPosWords + 1);
      else neuScore += 1;
    });
  } else {
    posScore = 8;
    neuScore = 1;
    negScore = 1;
  }

  const total = Math.max(1, posScore + neuScore + negScore);
  const positive = Math.round((posScore / total) * 100);
  const negative = Math.round((negScore / total) * 100);
  const neutral = Math.max(0, 100 - positive - negative);

  const pros: string[] = [];
  const sentences = combinedText.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    const sLower = sentence.toLowerCase().trim();
    if (sLower.length < 15 || sLower.length > 120) continue;
    if (POSITIVE_WORDS.some(w => sLower.includes(w)) && !NEGATIVE_WORDS.some(w => sLower.includes(w))) {
      const formatted = sentence.trim().replace(/^[^a-zA-Z0-9]+/, '');
      if (formatted && !pros.includes(formatted)) pros.push(formatted);
    }
    if (pros.length >= 3) break;
  }

  if (pros.length === 0) {
    if (textLower.includes('service') || textLower.includes('staff')) pros.push('Attentive and welcoming hospitality from the service staff');
    if (textLower.includes('food') || textLower.includes('taste')) pros.push('Fresh, high-grade ingredients and flavorful presentations');
    if (pros.length === 0) pros.push('Consistently delightful dining and culinary craftsmanship');
  }

  const cons: string[] = [];
  for (const sentence of sentences) {
    const sLower = sentence.toLowerCase().trim();
    if (sLower.length < 15 || sLower.length > 130) continue;
    if (NEGATIVE_WORDS.some(w => sLower.includes(w)) || sLower.includes('however') || sLower.includes('although')) {
      const formatted = sentence.trim().replace(/^[^a-zA-Z0-9]+/, '');
      if (formatted && !cons.includes(formatted)) cons.push(formatted);
    }
    if (cons.length >= 2) break;
  }

  if (cons.length === 0) {
    cons.push('Advance table reservations strongly recommended during peak hours');
  }

  const mustTryDishes: string[] = [];
  for (const term of COMMON_DISH_TERMS) {
    if (textLower.includes(term)) {
      const match = sentences.find(s => s.toLowerCase().includes(term));
      if (match) {
        const words = match.split(/\s+/);
        const termIdx = words.findIndex(w => w.toLowerCase().includes(term));
        if (termIdx !== -1) {
          const start = Math.max(0, termIdx - 1);
          const end = Math.min(words.length, termIdx + 2);
          const dishName = words.slice(start, end).join(' ').replace(/[^a-zA-Z\s]/g, '').trim();
          if (dishName && dishName.length > 3 && dishName.length < 30 && !mustTryDishes.includes(dishName)) {
            mustTryDishes.push(dishName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
          }
        }
      }
      if (mustTryDishes.length >= 3) break;
    }
  }

  if (mustTryDishes.length === 0) mustTryDishes.push('Chef Signature Selection', 'House Specialty Platter');

  let ambiance = 'Warm & Contemporary';
  if (textLower.includes('romantic') || textLower.includes('candle')) ambiance = 'Intimate & Romantic';
  else if (textLower.includes('rooftop') || textLower.includes('view')) ambiance = 'Scenic Skyline & Rooftop View';
  else if (textLower.includes('garden') || textLower.includes('patio')) ambiance = 'Relaxed Garden Patio';
  else if (textLower.includes('lively') || textLower.includes('bar')) ambiance = 'Vibrant & Energetic Atmosphere';

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 4.5), 0) / reviews.length)
    : 4.6;
  const overallScore = Math.min(9.9, Math.max(7.0, Number(((avgRating * 1.8) + (positive / 100)).toFixed(1))));

  const foodHighlight = mustTryDishes.slice(0, 2).join(' and ');
  const overallSummary = `Guests highly praise the freshly prepared ${foodHighlight} and overall culinary quality at ${restaurantName}. The ${ambiance.toLowerCase()} complements the warm hospitality for a memorable dining experience.`;

  return {
    overallSummary,
    pros: pros.slice(0, 3),
    cons: cons.slice(0, 2),
    mustTryDishes: mustTryDishes.slice(0, 4),
    ambiance,
    overallScore,
    sentimentBreakdown: { positive, neutral, negative }
  };
}

/**
 * Detailed structured AI summary generator for backend endpoints
 */
export async function summarizeReviews(
  restaurantName: string,
  reviews: ReviewItem[]
): Promise<AiSummary> {
  const apiKey = backendConfig.openrouterApiKey;
  const model = backendConfig.openrouterModel;
  const reviewsText = reviews.map(r => `[${r.rating || 5}/5 stars by ${r.authorName || 'Diner'}]: "${r.text || ''}"`).join('\n');

  if (apiKey && reviewsText.trim().length > 0) {
    try {
      const prompt = `
You are a Michelin-grade culinary analyst. Analyze the customer reviews for "${restaurantName}" and generate a structured JSON review summary.

REVIEWS:
${reviewsText}

Return ONLY valid JSON matching this schema:
{
  "overallSummary": "A concise 2-sentence summary highlighting food quality and dining atmosphere.",
  "pros": ["Authentic strength 1 directly from reviews", "Strength 2", "Strength 3"],
  "cons": ["Genuine caveat or constructive wait/booking note", "Note 2"],
  "mustTryDishes": ["Specific dish 1 mentioned in reviews", "Specific dish 2"],
  "ambiance": "Short 2-4 word ambiance descriptor",
  "overallScore": 9.4,
  "sentimentBreakdown": { "positive": 85, "neutral": 10, "negative": 5 }
}
`;

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are an AI restaurant critic that responds exclusively with raw, valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const content = response.data?.choices?.[0]?.message?.content?.trim();
      if (content) {
        const cleaned = content.replace(/^```json\s*|^```\s*|```$/g, '');
        const parsed = JSON.parse(cleaned);
        if (
          parsed &&
          typeof parsed.overallSummary === 'string' &&
          Array.isArray(parsed.pros) &&
          Array.isArray(parsed.cons) &&
          Array.isArray(parsed.mustTryDishes) &&
          typeof parsed.overallScore === 'number'
        ) {
          return {
            overallSummary: parsed.overallSummary,
            pros: parsed.pros.slice(0, 4),
            cons: parsed.cons.length > 0 ? parsed.cons.slice(0, 3) : ['Advance reservations recommended during peak hours'],
            mustTryDishes: parsed.mustTryDishes.slice(0, 4),
            ambiance: parsed.ambiance || 'Warm & Welcoming',
            overallScore: Number(parsed.overallScore.toFixed(1)),
            sentimentBreakdown: parsed.sentimentBreakdown || { positive: 88, neutral: 8, negative: 4 }
          };
        }
      }
    } catch (err) {
      console.warn('[AI Service] OpenRouter call failed, utilizing intelligent NLP fallback analyzer:', err);
    }
  }

  return analyzeReviewsHeuristically(restaurantName, reviews);
}

/**
 * Concise 2-sentence summary generator
 */
export async function generateReviewSummary(reviewsText: string): Promise<string> {
  const apiKey = backendConfig.openrouterApiKey;
  const model = backendConfig.openrouterModel;

  if (!reviewsText || reviewsText.trim().length === 0) {
    return 'Offers exceptional culinary craftsmanship and fresh ingredients paired with a warm, welcoming dining ambiance.';
  }

  if (apiKey) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You summarize diner reviews in exactly 2 sentences highlighting food quality and atmosphere.'
            },
            {
              role: 'user',
              content: `Summarize these customer reviews in 2 concise sentences:\n"${reviewsText}"`
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 8000
        }
      );

      const summary = response.data?.choices?.[0]?.message?.content?.trim();
      if (summary && summary.length > 20) return summary.replace(/^"|"$/g, '');
    } catch (err) {
      console.warn('[AI Service] OpenRouter API call failed in backend, using fallback summary:', err);
    }
  }

  const heuristic = analyzeReviewsHeuristically('The restaurant', [{
    text: reviewsText,
    rating: 4.8
  }]);

  return heuristic.overallSummary;
}
