import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';
import { Restaurant, RecommendedSpot, FoodPairing } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, history = [], restaurants = [] } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const availableSpotsContext = restaurants.map((r: Restaurant) => ({
      id: r.id,
      name: r.name,
      cuisine: r.cuisine,
      priceLevel: r.priceLevel,
      priceString: r.priceString,
      rating: r.rating,
      address: r.address,
      tags: r.tags,
      reviewsSnippet: r.reviews?.slice(0, 3).map(rev => rev.text).join(' ') || ''
    }));

    // If OpenRouter API Key exists, try to call LLM
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const systemMessage = `
You are "Chef AI Concierge", an elite culinary concierge and food matching expert for a top restaurant discovery app in Sri Lanka & worldwide.
You understand English, Sinhala, and Singlish (Sinhala written in Roman script).

User prompt: "${prompt}"

Available restaurants in the city:
${JSON.stringify(availableSpotsContext, null, 2)}

Instructions:
1. Analyze the user's intent (mood, party size, budget, specific cravings, date night, family, food & drink pairing).
2. If user is asking for restaurant recommendations based on mood/budget/guests, select up to 3 best matching restaurants from the provided list.
3. If user is asking for food and beverage/dessert pairings, provide rich pairing suggestions.
4. Respond in warm, welcoming, epicurean tone. If the user wrote in Singlish or Sinhala, you may respond in English with friendly Singlish/Sinhala greetings or natural English.

Return output strictly as valid JSON in the following format:
{
  "replyText": "Warm text response explaining your recommendations or pairings clearly to the user.",
  "recommendations": [
    {
      "restaurantId": "id from list",
      "restaurantName": "Name of place",
      "reason": "Why this matches their mood and budget",
      "suggestedDishes": ["Dish 1", "Dish 2"],
      "estimatedCostPerPerson": "Approx Rs. X per person"
    }
  ],
  "pairings": [
    {
      "dish": "Dish name",
      "beveragePairing": "Beverage / Mocktail / Wine match",
      "dessertPairing": "Ideal dessert pairing",
      "notes": "Flavor profile explanation"
    }
  ]
}
`;

        const responseText = await callOpenRouter(
          [
            { role: 'system', content: systemMessage },
            ...history.map((h: any) => ({
              role: h.sender === 'user' ? ('user' as const) : ('assistant' as const),
              content: h.text,
            })),
            { role: 'user', content: prompt }
          ],
          0.7,
          { type: 'json_object' }
        );

        const parsed = JSON.parse(responseText);
        return NextResponse.json({
          success: true,
          data: {
            replyText: parsed.replyText || 'Here are my top culinary recommendations for you!',
            recommendations: parsed.recommendations || [],
            pairings: parsed.pairings || [],
          }
        });
      } catch (aiErr) {
        console.warn('OpenRouter API call failed in /api/chat, executing smart local parser:', aiErr);
      }
    }

    // Smart Local Natural Language Parser & Fallback Generator
    const response = fallbackChefAi(prompt, restaurants);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error('Error in /api/chat route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process chat query' },
      { status: 500 }
    );
  }
}

/**
 * Smart offline fallback for Chef AI that handles Singlish, Sinhala, budget, mood, party size & pairings.
 */
function fallbackChefAi(prompt: string, restaurants: Restaurant[]) {
  const pLower = prompt.toLowerCase();
  
  // Extract numerical budget if any (e.g. 15000, 15,000)
  const budgetMatch = prompt.match(/\b(\d{1,2})[,\s]?000\b/);
  let parsedBudget = budgetMatch ? parseInt(budgetMatch[1]) * 1000 : null;

  // Extract party size (e.g. 4 denek, 4 guests, 4 friends, 2 people)
  const partyMatch = prompt.match(/\b(\d+)\s*(denek|dena|guests|people|friends|persons)\b/i);
  let partySize = partyMatch ? parseInt(partyMatch[1]) : 4;

  const isPairingQuery = pLower.includes('pair') || pLower.includes('drink') || pLower.includes('wine') || pLower.includes('mocktail') || pLower.includes('dessert') || pLower.includes('beverage');
  const isRomantic = pLower.includes('romantic') || pLower.includes('date') || pLower.includes('candlelit') || pLower.includes('intimate');
  const isSriLankan = pLower.includes('sri lankan') || pLower.includes('crab') || pLower.includes('curry') || pLower.includes('spicy') || pLower.includes('jaffna');
  const isItalian = pLower.includes('italian') || pLower.includes('pasta') || pLower.includes('pizza') || pLower.includes('trattoria');
  const isJapanese = pLower.includes('japanese') || pLower.includes('sushi') || pLower.includes('omakase') || pLower.includes('sashimi');
  const isCasual = pLower.includes('burger') || pLower.includes('fries') || pLower.includes('casual') || pLower.includes('shake');

  const recommendations: RecommendedSpot[] = [];
  const pairings: FoodPairing[] = [];

  // Filter or match restaurants from list
  let matchingSpots = [...restaurants];

  if (isRomantic || pLower.includes('vibe')) {
    matchingSpots = matchingSpots.filter(r => r.tags.some(t => t.toLowerCase().includes('romantic') || t.toLowerCase().includes('rooftop')) || r.cuisine.includes('Italian') || r.cuisine.includes('Japanese') || r.cuisine.includes('Sri Lankan'));
  }
  if (isItalian) {
    matchingSpots = matchingSpots.filter(r => r.cuisine.toLowerCase().includes('italian'));
  } else if (isJapanese) {
    matchingSpots = matchingSpots.filter(r => r.cuisine.toLowerCase().includes('japanese'));
  } else if (isSriLankan) {
    matchingSpots = matchingSpots.filter(r => r.cuisine.toLowerCase().includes('sri lankan') || r.tags.includes('Seafood'));
  } else if (isCasual) {
    matchingSpots = matchingSpots.filter(r => r.cuisine.toLowerCase().includes('american') || r.tags.includes('Casual'));
  }

  if (matchingSpots.length === 0) {
    matchingSpots = restaurants;
  }

  // Select top 2 spots
  const topSpots = matchingSpots.slice(0, 2);

  topSpots.forEach(r => {
    let perPersonEst = 'Rs. 3,000 - 4,000 per person';
    if (r.priceLevel === 1) perPersonEst = 'Rs. 1,500 - 2,500 per person';
    if (r.priceLevel === 3) perPersonEst = 'Rs. 4,500 - 6,000 per person';
    if (r.priceLevel === 4) perPersonEst = 'Rs. 7,000 - 9,500 per person';

    let suggestedDishes = ['Chef Signature Main', 'Artisanal Dessert'];
    if (r.cuisine.includes('Italian')) suggestedDishes = ['Handmade Truffle Tagliatelle', 'Woodfired Margherita Pizza'];
    if (r.cuisine.includes('Sri Lankan')) suggestedDishes = ['Jaffna Black Crab Curry', 'Spiced Pork Curry & Hoppers'];
    if (r.cuisine.includes('Japanese')) suggestedDishes = ['Salmon Aburi Roll', 'Chef Omakase Nigiri'];
    if (r.cuisine.includes('American')) suggestedDishes = ['Smashed Wagyu Bacon Burger', 'Truffle Mayo Crisp Fries'];

    recommendations.push({
      restaurantId: r.id,
      restaurantName: r.name,
      reason: isRomantic 
        ? `Ideal romantic ambiance with soft lighting, exceptional cuisine, and warm hospitality suitable for a memorable evening.`
        : `Fits your mood perfectly with highly rated ${r.cuisine} specialties and vibrant dining atmosphere.`,
      suggestedDishes,
      estimatedCostPerPerson: perPersonEst
    });
  });

  // Always generate rich beverage and dessert pairings
  if (isPairingQuery || recommendations.length > 0) {
    pairings.push({
      dish: isItalian ? 'Truffle Mushroom Tagliatelle' : isSriLankan ? 'Jaffna Crab Curry' : isJapanese ? 'Salmon Aburi Roll' : 'Smashed Wagyu Burger',
      beveragePairing: isItalian ? 'Aged Chianti Classico or Sparkling Pinot Noir Mocktail' : isSriLankan ? 'Chilled King Coconut Lime Mint Cooler' : isJapanese ? 'Crisp Junmai Ginjo Sake or Matcha Yuzu Tonic' : 'Craft Smoked Bourbon Mocktail / IPA',
      dessertPairing: isItalian ? 'Classic Creamy Tiramisu with Espresso Shot' : isSriLankan ? 'Warm Watalappan with Roasted Cashew Crisp' : isJapanese ? 'Matcha Green Tea Ice Cream & Mochi' : 'Salted Caramel Thick Milkshake',
      notes: 'The refreshing acidity and botanical notes in the beverage cut through rich savory fats, leaving a clean, elevated palate finish.'
    });
  }

  // Construct warm friendly response text in English/Singlish friendly tone
  let replyText = `Ayubowan! 👨‍🍳 I'm Chef AI, your personal culinary concierge.\n\n`;

  if (parsedBudget) {
    const totalEstPerPerson = Math.floor(parsedBudget / partySize);
    replyText += `I've analyzed your query for **${partySize} guests** with an overall budget of **Rs. ${parsedBudget.toLocaleString()}** (~Rs. ${totalEstPerPerson.toLocaleString()} per person).\n\n`;
  }

  if (isRomantic) {
    replyText += `Here are handpicked romantic venues with ambient lighting, scenic seating, and divine flavor profiles:`;
  } else if (isPairingQuery) {
    replyText += `Here is your bespoke Food & Beverage / Dessert Pairing guide prepared by our sommelier:`;
  } else {
    replyText += `Based on your mood and taste preferences, here are top culinary recommendations tailored for you:`;
  }

  return {
    replyText,
    recommendations,
    pairings,
  };
}
