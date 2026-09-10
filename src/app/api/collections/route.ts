import { NextRequest, NextResponse } from 'next/server';
import { UserCollection } from '@/types';

export const dynamic = 'force-dynamic';

let collectionsDb: UserCollection[] = [
  {
    id: 'default',
    name: 'All Saved Spots',
    description: 'General bookmarks and dining wishlist',
    icon: '⭐',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'weekend_brunch',
    name: 'Weekend Brunch Spots',
    description: 'Cozy cafes with artisan coffee, sourdough & pastries',
    icon: '🥐',
    isDefault: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'must_try_kottu',
    name: 'Must-Try Kottu & Curries',
    description: 'The finest street eats, cheese kottu & black pork curries',
    icon: '🍲',
    isDefault: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'romantic_dates',
    name: 'Romantic Date Nights',
    description: 'Dim lighting, scenic rooftop vibes & fine dining',
    icon: '🕯️',
    isDefault: false,
    createdAt: new Date().toISOString(),
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: collectionsDb,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Collection name is required' }, { status: 400 });
    }

    const newCollection: UserCollection = {
      id: 'col_' + Date.now(),
      name: name.trim(),
      description: description?.trim() || '',
      icon: icon || '📁',
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    collectionsDb.push(newCollection);

    return NextResponse.json({
      success: true,
      data: newCollection,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in /api/collections POST:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create collection' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Collection id is required' }, { status: 400 });
    }

    if (id === 'default') {
      return NextResponse.json({ success: false, error: 'Cannot delete the default collection' }, { status: 400 });
    }

    collectionsDb = collectionsDb.filter(c => c.id !== id);

    return NextResponse.json({
      success: true,
      message: 'Collection deleted successfully',
    });
  } catch (error: any) {
    console.error('Error in /api/collections DELETE:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete collection' }, { status: 500 });
  }
}
