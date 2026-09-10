import { Router, Request, Response } from 'express';
import { summarizeReviews } from '../services/aiService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { restaurantName, reviews } = req.body;
    const reviewList = Array.isArray(reviews) ? reviews : [];
    const aiSummary = await summarizeReviews(restaurantName || 'Restaurant', reviewList);

    res.json({
      success: true,
      data: aiSummary
    });
  } catch (error: any) {
    console.error('Error in POST /api/reviews backend route:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate review summary' });
  }
});

export default router;
