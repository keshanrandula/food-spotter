import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/types';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';

export const dynamic = 'force-dynamic';

// In-memory fallback cache
const memoryUsersDb: Record<string, UserProfile> = {
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

function formatUserResponse(doc: any): UserProfile {
  return {
    id: doc._id?.toString() || doc.id || ('user_' + Date.now()),
    name: doc.name,
    email: doc.email,
    avatarUrl: doc.avatarUrl,
    bio: doc.bio || 'Passionate foodie exploring great spots.',
    badge: doc.badge || 'Taste Scout ★',
    favoriteCuisines: doc.favoriteCuisines || [],
    dietaryPreferences: doc.dietaryPreferences || [],
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, provider, email, name, profile } = body;
    const db = await connectToDatabase().catch(() => null);

    // 1. Social Provider Login (Google / GitHub)
    if (action === 'social_login') {
      const socialEmail = (email || (provider === 'google' ? 'keshan.google@foodspotter.io' : 'keshan.github@foodspotter.io')).toLowerCase().trim();
      const socialName = name || (provider === 'google' ? 'Keshan (Google)' : 'Keshan (GitHub)');
      const socialAvatar = provider === 'google'
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80';

      if (db) {
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
        return NextResponse.json({
          success: true,
          user: formatUserResponse(userDoc),
          token: 'token_' + Date.now(),
        });
      }

      // Memory Fallback
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

      return NextResponse.json({
        success: true,
        user: memoryUsersDb[socialEmail],
        token: 'token_' + Date.now(),
      });
    }

    // 2. Email Login
    if (action === 'login') {
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (db) {
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
        return NextResponse.json({
          success: true,
          user: formatUserResponse(userDoc),
          token: 'token_' + Date.now(),
        });
      }

      // Memory Fallback
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

      return NextResponse.json({
        success: true,
        user,
        token: 'token_' + Date.now(),
      });
    }

    // 3. Register
    if (action === 'register') {
      if (!email || !name) {
        return NextResponse.json({ success: false, error: 'Email and Name are required' }, { status: 400 });
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (db) {
        let userDoc = await UserModel.findOne({ email: normalizedEmail });
        if (userDoc) {
          return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 409 });
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

        return NextResponse.json({
          success: true,
          user: formatUserResponse(userDoc),
          token: 'token_' + Date.now(),
        }, { status: 201 });
      }

      // Memory Fallback
      const newUser: UserProfile = {
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

      return NextResponse.json({
        success: true,
        user: newUser,
        token: 'token_' + Date.now(),
      }, { status: 201 });
    }

    // 4. Update Profile
    if (action === 'update_profile') {
      if (!email || !profile) {
        return NextResponse.json({ success: false, error: 'User email and profile payload are required' }, { status: 400 });
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (db) {
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

        return NextResponse.json({
          success: true,
          user: formatUserResponse(updatedDoc),
        });
      }

      // Memory Fallback
      const existing = memoryUsersDb[normalizedEmail] || {
        id: 'user_' + Date.now(),
        email: normalizedEmail,
        name: profile.name || normalizedEmail.split('@')[0],
        createdAt: new Date().toISOString(),
      };

      const updated: UserProfile = {
        ...existing,
        ...profile,
      };

      memoryUsersDb[normalizedEmail] = updated;

      return NextResponse.json({
        success: true,
        user: updated,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid auth action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in /api/auth:', error);
    return NextResponse.json({ success: false, error: error.message || 'Authentication failed' }, { status: 500 });
  }
}
