import { NextRequest, NextResponse } from 'next/server';
import { VoiceQueryResult } from '@/types';
import { callOpenRouter } from '@/lib/openrouter';
import { serverConfig } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, language = 'si-LK' } = body;

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Voice transcript is required' },
        { status: 400 }
      );
    }

    // 1. Try AI-powered Voice Understanding if OpenRouter Key available
    if (serverConfig.openrouterApiKey) {
      try {
        const systemPrompt = `You are an elite multilingual natural language parser for a Sri Lankan & Global food discovery platform.
You understand Sinhala (සිංහල), Singlish (Sinhala written in Roman alphabet), and English.
Analyze the user's spoken voice query and extract structured search parameters.

User transcript: "${transcript}"

Extract the following JSON strictly:
{
  "rawTranscript": "${transcript}",
  "language": "${language}",
  "extractedLocation": "City/Area or null (e.g., Nugegoda, Colombo, Kandy, Galle, Negombo, Mount Lavinia, Battaramulla, Rajagiriya, Maharagama)",
  "extractedKeyword": "Primary food/dish keyword or vibe (e.g., Biryani, Pizza, Seafood, Kotthu, Coffee, Burger)",
  "extractedCuisine": "Cuisine type or null (e.g., Sri Lankan, Italian, Japanese, Indian, Chinese, Cafe, Fast Food)",
  "extractedMood": "Mood or vibe (e.g., Romantic, Casual, Family, Late Night, Budget Friendly)",
  "extractedBudget": null,
  "interpretedIntent": "Clear, friendly one-sentence interpretation in English",
  "suggestedAction": "search_map"
}`;

        const responseText = await callOpenRouter(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: transcript },
          ],
          0.3,
          { type: 'json_object' }
        );

        const parsed = JSON.parse(responseText);
        return NextResponse.json({
          success: true,
          data: parsed,
        });
      } catch (aiErr) {
        console.warn('OpenRouter failed in voice query route, using deterministic NLP parser:', aiErr);
      }
    }

    // 2. Deterministic Multilingual NLP Parser (Sinhala / Singlish / English)
    const parsedData = parseVoiceTranscript(transcript, language);

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error in /api/voice-query:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process voice query' },
      { status: 500 }
    );
  }
}

/**
 * Intelligent deterministic rule-based NLP parser for Sri Lankan geography and food queries.
 */
function parseVoiceTranscript(transcript: string, language: string): VoiceQueryResult {
  const t = transcript.toLowerCase();

  // Known Sri Lankan Locations Dictionary (Sinhala, Singlish & English)
  const locationMap: Record<string, string> = {
    'නුගේගොඩ': 'Nugegoda',
    'nugegoda': 'Nugegoda',
    'nugegodin': 'Nugegoda',
    'කොළඹ': 'Colombo',
    'colombo': 'Colombo',
    'colombowalin': 'Colombo',
    'ගාල්ල': 'Galle',
    'galle': 'Galle',
    'මහනුවර': 'Kandy',
    'kandy': 'Kandy',
    'මීගමුව': 'Negombo',
    'negombo': 'Negombo',
    'බත්තරමුල්ල': 'Battaramulla',
    'battaramulla': 'Battaramulla',
    'රාජගිරිය': 'Rajagiriya',
    'rajagiriya': 'Rajagiriya',
    'දෙහිවල': 'Dehiwala',
    'dehiwala': 'Dehiwala',
    'ගල්කිස්ස': 'Mount Lavinia',
    'mount lavinia': 'Mount Lavinia',
    'මහරගම': 'Maharagama',
    'maharagama': 'Maharagama',
    'කිරිබත්ගොඩ': 'Kiribathgoda',
    'kiribathgoda': 'Kiribathgoda',
    'පානදුර': 'Panadura',
    'panadura': 'Panadura',
    'කෝට්ටේ': 'Kotte',
    'kotte': 'Kotte',
    'කොල්ලුපිටිය': 'Kollupitiya',
    'kollupitiya': 'Kollupitiya',
    'බම්බලපිටිය': 'Bambalapitiya',
    'bambalapitiya': 'Bambalapitiya',
  };

  let extractedLocation: string | undefined;
  for (const [key, val] of Object.entries(locationMap)) {
    if (t.includes(key)) {
      extractedLocation = val;
      break;
    }
  }

  // Food / Dish / Keyword Dictionary
  const keywordMap: Record<string, { keyword: string; cuisine?: string }> = {
    'බිරියානි': { keyword: 'Biryani', cuisine: 'Indian' },
    'බුරියානි': { keyword: 'Biryani', cuisine: 'Indian' },
    'biryani': { keyword: 'Biryani', cuisine: 'Indian' },
    'buriyani': { keyword: 'Biryani', cuisine: 'Indian' },
    'කොත්තු': { keyword: 'Kottu', cuisine: 'Sri Lankan' },
    'kottu': { keyword: 'Kottu', cuisine: 'Sri Lankan' },
    'kotthu': { keyword: 'Kottu', cuisine: 'Sri Lankan' },
    'පීසා': { keyword: 'Pizza', cuisine: 'Italian' },
    'pizza': { keyword: 'Pizza', cuisine: 'Italian' },
    'බර්ගර්': { keyword: 'Burger', cuisine: 'Fast Food' },
    'burger': { keyword: 'Burger', cuisine: 'Fast Food' },
    'සීෆුඩ්': { keyword: 'Seafood', cuisine: 'Seafood' },
    'කකුළුවො': { keyword: 'Crab', cuisine: 'Seafood' },
    'seafood': { keyword: 'Seafood', cuisine: 'Seafood' },
    'crab': { keyword: 'Crab', cuisine: 'Seafood' },
    'කෝපි': { keyword: 'Coffee', cuisine: 'Cafe' },
    'coffee': { keyword: 'Coffee', cuisine: 'Cafe' },
    'cafe': { keyword: 'Cafe', cuisine: 'Cafe' },
    'සුෂි': { keyword: 'Sushi', cuisine: 'Japanese' },
    'sushi': { keyword: 'Sushi', cuisine: 'Japanese' },
    'japanese': { keyword: 'Japanese', cuisine: 'Japanese' },
    'chinese': { keyword: 'Chinese', cuisine: 'Chinese' },
    'චයිනීස්': { keyword: 'Chinese', cuisine: 'Chinese' },
    'ඉතාලි': { keyword: 'Italian', cuisine: 'Italian' },
    'pasta': { keyword: 'Pasta', cuisine: 'Italian' },
    'පැස්ටා': { keyword: 'Pasta', cuisine: 'Italian' },
    'රයිස්': { keyword: 'Rice & Curry', cuisine: 'Sri Lankan' },
    'rice and curry': { keyword: 'Rice & Curry', cuisine: 'Sri Lankan' },
    'ආප්ප': { keyword: 'Hoppers', cuisine: 'Sri Lankan' },
    'hoppers': { keyword: 'Hoppers', cuisine: 'Sri Lankan' },
  };

  let extractedKeyword: string | undefined;
  let extractedCuisine: string | undefined;

  for (const [key, val] of Object.entries(keywordMap)) {
    if (t.includes(key)) {
      extractedKeyword = val.keyword;
      extractedCuisine = val.cuisine;
      break;
    }
  }

  // Mood detection
  let extractedMood: string | undefined;
  if (t.includes('romantic') || t.includes('date') || t.includes('ජෝඩු')) extractedMood = 'Romantic';
  if (t.includes('cheap') || t.includes('budget') || t.includes('ලාබ')) extractedMood = 'Budget Friendly';
  if (t.includes('night') || t.includes('රෑට')) extractedMood = 'Late Night';
  if (t.includes('family') || t.includes('පවුල')) extractedMood = 'Family Dining';

  // Budget detection (e.g. 5000, 2000)
  const budgetMatch = transcript.match(/\b(\d{1,2})[,\s]?000\b/);
  const extractedBudget = budgetMatch ? parseInt(budgetMatch[1]) * 1000 : undefined;

  // Build clean English interpretation sentence
  const locStr = extractedLocation ? `in ${extractedLocation}` : 'nearby';
  const foodStr = extractedKeyword || extractedCuisine || 'top-rated food';
  const interpretedIntent = `Looking for ${foodStr} spots ${locStr}${extractedMood ? ` (${extractedMood} vibe)` : ''}.`;

  return {
    rawTranscript: transcript,
    language: (language as any) || 'si-LK',
    extractedLocation,
    extractedKeyword: extractedKeyword || (extractedCuisine ? `${extractedCuisine} food` : undefined),
    extractedCuisine,
    extractedMood,
    extractedBudget,
    interpretedIntent,
    suggestedAction: 'search_map',
  };
}
