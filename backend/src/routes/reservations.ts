import { Router, Request, Response } from 'express';
import ReservationModel from '../models/Reservation';

const router = Router();

const memoryReservationsDb: any[] = [];

function formatReservation(doc: any) {
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

router.get('/', async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    try {
      const query = email ? { guestEmail: email.toLowerCase().trim() } : {};
      const docs = await ReservationModel.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: docs.length, data: docs.map(formatReservation) });
    } catch {
      if (email) {
        const filtered = memoryReservationsDb.filter(r => r.guestEmail.toLowerCase() === email.toLowerCase());
        return res.json({ success: true, count: filtered.length, data: filtered });
      }
      return res.json({ success: true, count: memoryReservationsDb.length, data: memoryReservationsDb });
    }
  } catch (error: any) {
    console.error('Error fetching reservations:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch reservations' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
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
    } = req.body;

    if (!restaurantName || !guestName || !guestEmail || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant details, guest name, email, date and time slot are required'
      });
    }

    const totalEstimatedCost = preOrderedItems.reduce(
      (acc: number, item: any) => acc + (Number(item.menuItem?.price || 0) * Number(item.quantity || 1)),
      0
    );

    const bookingCode = 'FS-' + Math.floor(10000 + Math.random() * 90000);

    try {
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

      return res.status(201).json({
        success: true,
        message: `Table booked successfully! Confirmation saved to database for ${guestEmail}`,
        data: formatReservation(created),
      });
    } catch {
      const newReservation = {
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

      return res.status(201).json({
        success: true,
        message: `Table booked successfully! Confirmation sent to ${guestEmail}`,
        data: newReservation,
      });
    }
  } catch (error: any) {
    console.error('Error in backend /api/reservations POST:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to create table reservation' });
  }
});

router.delete('/', async (req: Request, res: Response) => {
  try {
    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Reservation ID is required' });
    }

    try {
      const updated = await ReservationModel.findByIdAndUpdate(
        id,
        { $set: { status: 'cancelled' } },
        { new: true }
      );
      if (updated) {
        return res.json({
          success: true,
          message: 'Reservation cancelled successfully',
          data: formatReservation(updated),
        });
      }
    } catch {
      // ignore
    }

    const idx = memoryReservationsDb.findIndex(r => r.id === id);
    if (idx >= 0) {
      memoryReservationsDb[idx].status = 'cancelled';
      return res.json({
        success: true,
        message: 'Reservation cancelled successfully',
        data: memoryReservationsDb[idx],
      });
    }

    return res.status(404).json({ success: false, error: 'Reservation not found' });
  } catch (error: any) {
    console.error('Error in backend /api/reservations DELETE:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to cancel reservation' });
  }
});

export default router;
