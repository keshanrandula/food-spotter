import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import RestaurantModel from '@/models/Restaurant';

let memorySaved: any[] = [];

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const saved = await RestaurantModel.find({}).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, count: saved.length, data: saved });
    }
    
    return NextResponse.json({ success: true, count: memorySaved.length, data: memorySaved });
  } catch (error: any) {
    console.error('Error fetching saved restaurants:', error);
    return NextResponse.json({ success: true, count: memorySaved.length, data: memorySaved });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placeId, name, cuisine, rating, priceLevel, address, photoUrl, notes, tags } = body;

    if (!placeId || !name) {
      return NextResponse.json(
        { success: false, error: 'placeId and name are required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    if (db) {
      const existing = await RestaurantModel.findOne({ placeId });
      if (existing) {
        return NextResponse.json({ success: true, message: 'Already saved', data: existing });
      }

      const newSaved = await RestaurantModel.create({
        placeId,
        name,
        cuisine: cuisine || 'General',
        rating: rating || 0,
        priceLevel: priceLevel || 2,
        address: address || '',
        photoUrl: photoUrl || '',
        notes: notes || '',
        tags: tags || [],
      });

      return NextResponse.json({ success: true, data: newSaved }, { status: 201 });
    }

    if (!memorySaved.some(item => item.placeId === placeId)) {
      const newItem = {
        _id: 'mem_' + Date.now(),
        placeId,
        name,
        cuisine: cuisine || 'General',
        rating: rating || 0,
        priceLevel: priceLevel || 2,
        address: address || '',
        photoUrl: photoUrl || '',
        notes: notes || '',
        tags: tags || [],
        createdAt: new Date().toISOString(),
      };
      memorySaved.unshift(newItem);
      return NextResponse.json({ success: true, data: newItem }, { status: 201 });
    }

    return NextResponse.json({ success: true, message: 'Already saved in memory', data: memorySaved.find(i => i.placeId === placeId) });
  } catch (error: any) {
    console.error('Error saving restaurant:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save restaurant' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');

    if (!placeId) {
      return NextResponse.json(
        { success: false, error: 'placeId parameter is required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    if (db) {
      await RestaurantModel.deleteOne({ placeId });
    }

    memorySaved = memorySaved.filter(item => item.placeId !== placeId);
    return NextResponse.json({ success: true, message: 'Restaurant removed from saved items' });
  } catch (error: any) {
    console.error('Error deleting saved restaurant:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete saved restaurant' },
      { status: 500 }
    );
  }
}
