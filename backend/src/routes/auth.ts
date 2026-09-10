import { Router, Request, Response } from 'express';
import UserModel from '../models/User';

const router = Router();

const memoryUsersDb: Record<string, any> = {
  'demo@foodspotter.com': {
    id: 'user_demo_1',
    name: 'Keshan Randula',
    email: 'demo@foodspotter.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: 'Avid Sri Lankan foodie & spice enthusiast. Searching for the best Jaffna Crab & artisan woodfired pizza.',
    badge: 'Epicurean Critic ★★★',
    favoriteCuisines: ['Sri Lankan', 'Italian', 'Japanese'],
    dietaryPreferences: ['Halal Friendly', 'Seafood Lover'],
    createdAt: new Date().toISOString(),
  }
};

function formatUser(doc: any) {
  return {
    id: doc._id?.toString() || doc.id || ('user_' + Date.now()),
    name: doc.name,
    email: doc.email,
    avatarUrl: doc.avatarUrl,
    bio: doc.bio || 'Food explorer',
    badge: doc.badge || 'Taste Scout ★',
    favoriteCuisines: doc.favoriteCuisines || [],
    dietaryPreferences: doc.dietaryPreferences || [],
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { action, provider, email, name, profile } = req.body;

    // 1. Social Login
    if (action === 'social_login') {
      const socialEmail = (email || (provider === 'google' ? 'keshan.google@foodspotter.io' : 'keshan.github@foodspotter.io')).toLowerCase().trim();
      const socialName = name || (provider === 'google' ? 'Keshan (Google)' : 'Keshan (GitHub)');
      const socialAvatar = provider === 'google'
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80';

      try {
        let userDoc = await UserModel.findOne({ email: socialEmail });
        if (!userDoc) {
          userDoc = await UserModel.create({
            name: socialName,
            email: socialEmail,
            avatarUrl: socialAvatar,
            bio: `Foodie exploring great eateries via ${provider.toUpperCase()}`,
            badge: 'Taste Scout ★',
            favoriteCuisines: ['Sri Lankan', 'Fusion'],
            dietaryPreferences: [],
          });
        }
        return res.json({
          success: true,
          user: formatUser(userDoc),
          token: 'token_' + Date.now(),
        });
      } catch {
        if (!memoryUsersDb[socialEmail]) {
          memoryUsersDb[socialEmail] = {
            id: 'user_' + Date.now(),
            name: socialName,
            email: socialEmail,
            avatarUrl: socialAvatar,
            bio: `Foodie exploring great eateries via ${provider.toUpperCase()}`,
            badge: 'Taste Scout ★',
            favoriteCuisines: ['Sri Lankan', 'Fusion'],
            dietaryPreferences: [],
            createdAt: new Date().toISOString(),
          };
        }
        return res.json({
          success: true,
          user: memoryUsersDb[socialEmail],
          token: 'token_' + Date.now(),
        });
      }
    }

    // 2. Email Login
    if (action === 'login') {
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      try {
        let userDoc = await UserModel.findOne({ email: normalizedEmail });
        if (!userDoc) {
          userDoc = await UserModel.create({
            name: normalizedEmail.split('@')[0],
            email: normalizedEmail,
            avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${normalizedEmail}`,
            bio: 'Food explorer on FoodSpotter',
            badge: 'Gourmet Explorer ★',
            favoriteCuisines: ['Sri Lankan'],
            dietaryPreferences: [],
          });
        }
        return res.json({
          success: true,
          user: formatUser(userDoc),
          token: 'token_' + Date.now(),
        });
      } catch {
        let user = memoryUsersDb[normalizedEmail];
        if (!user) {
          user = {
            id: 'user_' + Date.now(),
            name: normalizedEmail.split('@')[0],
            email: normalizedEmail,
            avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${normalizedEmail}`,
            bio: 'Food explorer on FoodSpotter',
            badge: 'Gourmet Explorer ★',
            favoriteCuisines: ['Sri Lankan'],
            dietaryPreferences: [],
            createdAt: new Date().toISOString(),
          };
          memoryUsersDb[normalizedEmail] = user;
        }
        return res.json({
          success: true,
          user,
          token: 'token_' + Date.now(),
        });
      }
    }

    // 3. Register
    if (action === 'register') {
      if (!email || !name) {
        return res.status(400).json({ success: false, error: 'Email and Name are required' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      try {
        let userDoc = await UserModel.findOne({ email: normalizedEmail });
        if (userDoc) {
          return res.status(409).json({ success: false, error: 'User already exists' });
        }

        userDoc = await UserModel.create({
          name: name.trim(),
          email: normalizedEmail,
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
          bio: 'Passionate about authentic flavors and dining adventures.',
          badge: 'New Epicurean ★',
          favoriteCuisines: [],
          dietaryPreferences: [],
        });

        return res.status(201).json({
          success: true,
          user: formatUser(userDoc),
          token: 'token_' + Date.now(),
        });
      } catch {
        const newUser = {
          id: 'user_' + Date.now(),
          name: name.trim(),
          email: normalizedEmail,
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
          bio: 'Passionate about authentic flavors and dining adventures.',
          badge: 'New Epicurean ★',
          favoriteCuisines: [],
          dietaryPreferences: [],
          createdAt: new Date().toISOString(),
        };
        memoryUsersDb[normalizedEmail] = newUser;
        return res.status(201).json({
          success: true,
          user: newUser,
          token: 'token_' + Date.now(),
        });
      }
    }

    // 4. Update Profile
    if (action === 'update_profile') {
      if (!email || !profile) {
        return res.status(400).json({ success: false, error: 'User email and profile payload are required' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      try {
        const updatedDoc = await UserModel.findOneAndUpdate(
          { email: normalizedEmail },
          {
            $set: {
              name: profile.name,
              bio: profile.bio,
              avatarUrl: profile.avatarUrl,
              badge: profile.badge,
              favoriteCuisines: profile.favoriteCuisines,
              dietaryPreferences: profile.dietaryPreferences,
            }
          },
          { new: true, upsert: true }
        );

        return res.json({
          success: true,
          user: formatUser(updatedDoc),
        });
      } catch {
        const existing = memoryUsersDb[normalizedEmail] || {
          id: 'user_' + Date.now(),
          email: normalizedEmail,
          name: profile.name || normalizedEmail.split('@')[0],
          createdAt: new Date().toISOString(),
        };

        const updated = {
          ...existing,
          ...profile,
        };

        memoryUsersDb[normalizedEmail] = updated;

        return res.json({
          success: true,
          user: updated,
        });
      }
    }

    return res.status(400).json({ success: false, error: 'Invalid auth action' });
  } catch (error: any) {
    console.error('Error in backend /api/auth:', error);
    return res.status(500).json({ success: false, error: error.message || 'Authentication failed' });
  }
});

export default router;
