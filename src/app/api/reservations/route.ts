import { NextRequest, NextResponse } from 'next/server';
import { TableReservation } from '@/types';
import { connectToDatabase } from '@/lib/mongodb';
import ReservationModel from '@/models/Reservation';

export const dynamic = 'force-dynamic';

// In-memory reservations storage fallback
const memoryReservationsDb: TableReservation[] = [
  {
    id: 'res_demo_1',
    bookingCode: 'FS-84912',
    restaurantId: 'demo_colombo_1',
    restaurantName: 'Ministry of Crab',
    restaurantAddress: 'Old Dutch Hospital, Colombo 01',
    restaurantPhoto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    guestName: 'Keshan Randula',
    guestEmail: 'demo@foodspotter.com',
    guestPhone: '+94 77 123 4567',
    date: '2026-09-12',
    timeSlot: '07:30 PM',
    guestsCount: 2,
    seatingArea: 'garden_patio',
    specialOccasion: 'romantic_date',
    specialRequests: 'Candlelight table in the courtyard with extra garlic butter roast paan.',
    preOrderedItems: [
      {
        menuItem: {
          id: 'dish_crab_1',
          name: 'Jaffna Black Mud Crab Curry',
          localName: 'යාපනේ කළු කකුළු ව්‍යංජනය',
          category: 'Signature Mains',
          price: 3850,
          priceFormatted: 'Rs. 3,850',
          description: 'Lagoon mud crabs simmered in roasted Jaffna spices and coconut milk.',
          isSignature: true,
          dietary: { isVeg: false, isVegan: false, isHalal: true, isGlutenFree: true, spicyLevel: 3 },
          allergens: ['Crustaceans'],
        },
        quantity: 1,
      },
      {
        menuItem: {
          id: 'dish_dessert_1',
          name: 'Artisanal Watalappan with Kitul Treacle',
          localName: 'කිතුල් හකුරු වටලප්පන්',
          category: 'Artisanal Desserts',
          price: 750,
          priceFormatted: 'Rs. 750',
          description: 'Spiced coconut custard with pure Kitul jaggery and roasted cashews.',
          isSignature: true,
          dietary: { isVeg: true, isVegan: false, isHalal: true, isGlutenFree: true, spicyLevel: 0 },
        },
        quantity: 2,
      }
    ],
    totalEstimatedCost: 5350,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }
];

function formatReservationDoc(doc: any): TableReservation {
  return {
    id: doc._id?.toString() || doc.id || ('res_' + Date.now()),
    bookingCode: doc.bookingCode,
    restaurantId: doc.restaurantId,
    restaurantName: doc.restaurantName,
    restaurantAddress: doc.restaurantAddress,
    restaurantPhoto: doc.restaurantPhoto,
    guestName: doc.guestName,
    guestEmail: doc.guestEmail,
    guestPhone: doc.guestPhone,
    date: doc.date,
    timeSlot: doc.timeSlot,
    guestsCount: doc.guestsCount,
    seatingArea: doc.seatingArea,
    specialOccasion: doc.specialOccasion,
    specialRequests: doc.specialRequests,
    preOrderedItems: doc.preOrderedItems || [],
    totalEstimatedCost: doc.totalEstimatedCost || 0,
    status: doc.status || 'confirmed',
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const db = await connectToDatabase().catch(() => null);

    if (db) {
      const query = email ? { guestEmail: email.toLowerCase().trim() } : {};
      const docs = await ReservationModel.find(query).sort({ createdAt: -1 });
      const data = docs.map(formatReservationDoc);
      return NextResponse.json({ success: true, count: data.length, data });
    }

    // Memory Fallback
    if (email) {
      const userBookings = memoryReservationsDb.filter(r => r.guestEmail.toLowerCase() === email.toLowerCase());
      return NextResponse.json({ success: true, count: userBookings.length, data: userBookings });
    }

    return NextResponse.json({ success: true, count: memoryReservationsDb.length, data: memoryReservationsDb });
  } catch (error: any) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      restaurantId,
      restaurantName,
      restaurantAddress,
      restaurantPhoto,
      guestName,
      guestEmail,
      guestPhone,
      date,
      timeSlot,
      guestsCount = 2,
      seatingArea = 'indoor_ac',
      specialOccasion = 'none',
      specialRequests = '',
      preOrderedItems = [],
    } = body;

    if (!restaurantName || !guestName || !guestEmail || !date || !timeSlot) {
      return NextResponse.json(
        { success: false, error: 'Restaurant details, guest name, email, date and time slot are required' },
        { status: 400 }
      );
    }

    const totalEstimatedCost = preOrderedItems.reduce(
      (acc: number, item: any) => acc + (Number(item.menuItem?.price || 0) * Number(item.quantity || 1)),
      0
    );

    const bookingCode = 'FS-' + Math.floor(10000 + Math.random() * 90000);
    const db = await connectToDatabase().catch(() => null);

    if (db) {
      const created = await ReservationModel.create({
        bookingCode,
        restaurantId: restaurantId || 'unknown',
        restaurantName: restaurantName.trim(),
        restaurantAddress: restaurantAddress || 'Colombo, Sri Lanka',
        restaurantPhoto: restaurantPhoto || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
        guestName: guestName.trim(),
        guestEmail: guestEmail.toLowerCase().trim(),
        guestPhone: guestPhone?.trim() || '+94 77 000 0000',
        date,
        timeSlot,
        guestsCount: Number(guestsCount) || 2,
        seatingArea,
        specialOccasion,
        specialRequests: specialRequests.trim(),
        preOrderedItems,
        totalEstimatedCost,
        status: 'confirmed',
      });

      return NextResponse.json({
        success: true,
        message: `Table booked successfully! Confirmation saved to database for ${guestEmail}`,
        data: formatReservationDoc(created),
      }, { status: 201 });
    }

    // Memory Fallback
    const newReservation: TableReservation = {
      id: 'res_' + Date.now(),
      bookingCode,
      restaurantId: restaurantId || 'unknown',
      restaurantName,
      restaurantAddress: restaurantAddress || 'Colombo, Sri Lanka',
      restaurantPhoto: restaurantPhoto || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone?.trim() || '+94 77 000 0000',
      date,
      timeSlot,
      guestsCount: Number(guestsCount) || 2,
      seatingArea,
      specialOccasion,
      specialRequests: specialRequests.trim(),
      preOrderedItems,
      totalEstimatedCost,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    memoryReservationsDb.unshift(newReservation);

    return NextResponse.json({
      success: true,
      message: `Table booked successfully! Confirmation sent to ${guestEmail}`,
      data: newReservation,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in /api/reservations POST:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create table reservation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Reservation ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase().catch(() => null);

    if (db) {
      const updated = await ReservationModel.findByIdAndUpdate(
        id,
        { $set: { status: 'cancelled' } },
        { new: true }
      );
      if (updated) {
        return NextResponse.json({
          success: true,
          message: 'Reservation cancelled successfully',
          data: formatReservationDoc(updated),
        });
      }
    }

    const idx = memoryReservationsDb.findIndex(r => r.id === id);
    if (idx >= 0) {
      memoryReservationsDb[idx].status = 'cancelled';
      return NextResponse.json({
        success: true,
        message: 'Reservation cancelled successfully',
        data: memoryReservationsDb[idx],
      });
    }

    return NextResponse.json({ success: false, error: 'Reservation not found' }, { status: 404 });
  } catch (error: any) {
    console.error('Error in /api/reservations DELETE:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to cancel reservation' }, { status: 500 });
  }
}
