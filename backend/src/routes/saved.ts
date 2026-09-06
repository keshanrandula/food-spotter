import { Router, Request, Response } from 'express';
import RestaurantModel from '../models/Restaurant';

const router = Router();
let memorySaved: any[] = [];

router.get('/', async (req: Request, res: Response) => {
  try {
    const saved = await RestaurantModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: saved.length, data: saved });
  } catch (error) {
    res.json({ success: true, count: memorySaved.length, data: memorySaved });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { placeId, name, cuisine, rating, priceLevel, address, photoUrl, notes, tags } = req.body;
    if (!placeId || !name) {
      return res.status(400).json({ success: false, error: 'placeId and name are required' });
    }

    try {
      const existing = await RestaurantModel.findOne({ placeId });
      if (existing) {
        return res.json({ success: true, data: existing });
      }

      const newSaved = await RestaurantModel.create({
        placeId,
        name,
        location: address || 'Manhattan, NY',
        cuisine: cuisine || 'General',
        rating: rating || 0,
        priceLevel: priceLevel || 2,
        address: address || '',
        photoUrl: photoUrl || '',
        notes: notes || '',
        tags: tags || [],
      });

      return res.status(201).json({ success: true, data: newSaved });
    } catch (dbErr) {
      if (!memorySaved.some(i => i.placeId === placeId)) {
        const newItem = {
          _id: 'mem_' + Date.now(),
          placeId,
          name,
          location: address || 'Manhattan, NY',
          cuisine: cuisine || 'General',
          rating: rating || 0,
          priceLevel: priceLevel || 2,
          address: address || '',
          photoUrl: photoUrl || '',
          notes: notes || '',
          tags: tags || [],
          createdAt: new Date().toISOString()
        };
        memorySaved.unshift(newItem);
        return res.status(201).json({ success: true, data: newItem });
      }
      return res.json({ success: true, data: memorySaved.find(i => i.placeId === placeId) });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to save restaurant' });
  }
});

router.delete('/', async (req: Request, res: Response) => {
  try {
    const placeId = req.query.placeId as string;
    if (!placeId) {
      return res.status(400).json({ success: false, error: 'placeId is required' });
    }

    try {
      await RestaurantModel.deleteOne({ placeId });
    } catch (e) {}

    memorySaved = memorySaved.filter(i => i.placeId !== placeId);
    res.json({ success: true, message: 'Restaurant removed from saved list' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to delete saved restaurant' });
  }
});

export default router;
