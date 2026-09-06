import { NextRequest, NextResponse } from 'next/server';
import { summarizeReviews } from '@/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantName, reviews } = body;

    if (!restaurantName) {
      return NextResponse.json(
        { success: false, error: 'Restaurant name is required' },
        { status: 400 }
      );
    }

    const aiSummary = await summarizeReviews(restaurantName, reviews || []);
    return NextResponse.json({ success: true, data: aiSummary });
  } catch (error: any) {
    console.error('Error generating AI review summary:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate review summary' },
      { status: 500 }
    );
  }
}
