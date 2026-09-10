import { Router, Request, Response } from 'express';
import { searchRestaurants } from '../services/googleApi';
import { generateReviewSummary, summarizeReviews } from '../services/aiService';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const location = req.query.location as string;
    const latStr = req.query.lat as string;
    const lngStr = req.query.lng as string;
    const keyword = (req.query.keyword as string) || (req.query.cuisine as string) || 'restaurant';

    const places = await searchRestaurants(location, latStr, lngStr, keyword);

    const mergedPlaces = await Promise.all(
      places.map(async (p) => {
        const top5Reviews = (p.reviews || []).slice(0, 5);
        const reviewText = top5Reviews.map(r => r.text).join(' ');
        const [aiReviewSummary, aiSummary] = await Promise.all([
          generateReviewSummary(reviewText || p.name),
          summarizeReviews(p.name, top5Reviews)
        ]);

        return {
          ...p,
          aiReviewSummary,
          aiSummary
        };
      })
    );

    res.json({ success: true, count: mergedPlaces.length, data: mergedPlaces });
  } catch (error: any) {
    console.error('Error in GET /api/places backend route:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch places' });
  }
});

export default router;
