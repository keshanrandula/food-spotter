import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { UserProfile } from '@/types';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';

export const dynamic = 'force-dynamic';

// --- Password Hashing Utilities ---
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, actualSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: actualSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!password || !hash || !salt) return false;
  const computedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return computedHash === hash;
}

// In-memory fallback cache with a pre-seeded demo foodie account
const initialDemoHash = hashPassword('demo123', 'fixed_demo_salt_9876');

interface MemoryUserRecord {
  profile: UserProfile;
  passwordHash?: string;
  salt?: string;
}

const memoryUsersDb: Record<string, MemoryUserRecord> = {
  'demo@foodspotter.com': {
    profile: {
      id: 'user_demo_keshan',
      name: 'Keshan Randula',
      email: 'demo@foodspotter.com',
      phone: '+94 77 123 4567',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: 'Avid Sri Lankan foodie & spice enthusiast. Searching for the best Jaffna Crab & artisan woodfired pizza.',
      badge: 'Epicurean Critic ★★★',
      role: 'pro_critic',
      favoriteCuisines: ['Sri Lankan', 'Italian', 'Japanese & Sushi', 'Seafood'],
      dietaryPreferences: ['Halal Friendly', 'Seafood Lover'],
      savedPlaceIds: ['colombo_ministry_of_crab', 'colombo_upalis'],
      stats: {
        savedCount: 6,
        reviewsCount: 14,
        bookingsCount: 3,
      },
      createdAt: new Date().toISOString(),
    },
    passwordHash: initialDemoHash.hash,
    salt: initialDemoHash.salt,
  },
};

function formatUserResponse(doc: any): UserProfile {
  return {
    id: doc._id?.toString() || doc.id || ('user_' + Date.now()),
    name: doc.name,
    email: doc.email,
    phone: doc.phone || '',
    avatarUrl: doc.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(doc.name || 'foodie')}`,
    bio: doc.bio || 'Passionate foodie exploring culinary spots.',
    badge: doc.badge || 'Gourmet Explorer ★',
    role: doc.role || 'member',
    favoriteCuisines: doc.favoriteCuisines || [],
    dietaryPreferences: doc.dietaryPreferences || [],
    savedPlaceIds: doc.savedPlaceIds || [],
    stats: {
      savedCount: doc.savedPlaceIds?.length || 0,
      reviewsCount: 4,
      bookingsCount: 2,
    },
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, provider, email, password, name, phone, currentPassword, newPassword, profile } = body;
    const db = await connectToDatabase().catch(() => null);

    // ==========================================
    // 1. Social Provider Login (Google / GitHub)
    // ==========================================
    if (action === 'social_login') {
      const socialEmail = (email || (provider === 'google' ? 'foodie.google@foodspotter.io' : 'foodie.github@foodspotter.io')).toLowerCase().trim();
      const socialName = name || (provider === 'google' ? 'Google Gourmet' : 'GitHub Epicurean');
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
            bio: `Food explorer joined via ${provider.toUpperCase()}`,
            badge: 'Taste Scout ★',
            favoriteCuisines: ['Sri Lankan', 'Italian', 'Seafood'],
            dietaryPreferences: ['Halal Friendly'],
            savedPlaceIds: [],
          });
        }
        return NextResponse.json({
          success: true,
          user: formatUserResponse(userDoc),
          token: 'token_social_' + Date.now(),
        });
      }

      // In-memory fallback
      if (!memoryUsersDb[socialEmail]) {
        memoryUsersDb[socialEmail] = {
          profile: {
            id: 'user_social_' + Date.now(),
            name: socialName,
            email: socialEmail,
            phone: '',
            avatarUrl: socialAvatar,
            bio: `Food explorer joined via ${provider.toUpperCase()}`,
            badge: 'Taste Scout ★',
            role: 'member',
            favoriteCuisines: ['Sri Lankan', 'Italian', 'Seafood'],
            dietaryPreferences: ['Halal Friendly'],
            savedPlaceIds: [],
            stats: { savedCount: 0, reviewsCount: 0, bookingsCount: 0 },
            createdAt: new Date().toISOString(),
          },
        };
      }

      return NextResponse.json({
        success: true,
        user: memoryUsersDb[socialEmail].profile,
        token: 'token_social_' + Date.now(),
      });
    }

    // ==========================================
    // 2. Email & Password Login
    // ==========================================
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Please provide both email and password.' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (db) {
        const userDoc = await UserModel.findOne({ email: normalizedEmail });
        if (!userDoc) {
          return NextResponse.json(
            { success: false, error: 'No account found with this email. Please register first.' },
            { status: 404 }
          );
        }

        // If user has a passwordHash, verify it
        if (userDoc.passwordHash && userDoc.salt) {
          const isValid = verifyPassword(password, userDoc.passwordHash, userDoc.salt);
          if (!isValid) {
            return NextResponse.json(
              { success: false, error: 'Incorrect password. Please try again.' },
              { status: 401 }
            );
          }
        }

        return NextResponse.json({
          success: true,
          user: formatUserResponse(userDoc),
          token: 'token_' + Date.now(),
        });
      }

      // In-memory fallback
      const record = memoryUsersDb[normalizedEmail];
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'No account found with this email. Please sign up.' },
          { status: 404 }
        );
      }

      if (record.passwordHash && record.salt) {
        const isValid = verifyPassword(password, record.passwordHash, record.salt);
        if (!isValid) {
          return NextResponse.json(
            { success: false, error: 'Incorrect password. Please check your credentials.' },
            { status: 401 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        user: record.profile,
        token: 'token_' + Date.now(),
      });
    }

    // ==========================================
    // 3. User Registration
    // ==========================================
    if (action === 'register') {
      if (!email || !name || !password) {
        return NextResponse.json(
          { success: false, error: 'Full Name, Email and Password are required.' },
          { status: 400 }
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid email address.' },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();
      const { hash, salt } = hashPassword(password);
      const defaultAvatar = body.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name.trim())}`;

      if (db) {
        const existing = await UserModel.findOne({ email: normalizedEmail });
        if (existing) {
          return NextResponse.json(
            { success: false, error: 'An account with this email address already exists. Please sign in.' },
            { status: 409 }
          );
        }

        const userDoc = await UserModel.create({
          name: name.trim(),
          email: normalizedEmail,
          passwordHash: hash,
          salt: salt,
          phone: phone?.trim() || '',
          avatarUrl: defaultAvatar,
          bio: 'Passionate foodie excited to discover authentic flavors & hidden gems.',
          badge: 'New Epicurean ★',
          role: 'member',
          favoriteCuisines: body.favoriteCuisines || ['Sri Lankan'],
          dietaryPreferences: body.dietaryPreferences || [],
          savedPlaceIds: [],
        });

        return NextResponse.json({
          success: true,
          user: formatUserResponse(userDoc),
          token: 'token_' + Date.now(),
        }, { status: 201 });
      }

      // Memory Fallback
      if (memoryUsersDb[normalizedEmail]) {
        return NextResponse.json(
          { success: false, error: 'An account with this email address already exists. Please sign in.' },
          { status: 409 }
        );
      }

      const newUser: UserProfile = {
        id: 'user_' + Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || '',
        avatarUrl: defaultAvatar,
        bio: 'Passionate foodie excited to discover authentic flavors & hidden gems.',
        badge: 'New Epicurean ★',
        role: 'member',
        favoriteCuisines: body.favoriteCuisines || ['Sri Lankan'],
        dietaryPreferences: body.dietaryPreferences || [],
        savedPlaceIds: [],
        stats: { savedCount: 0, reviewsCount: 0, bookingsCount: 0 },
        createdAt: new Date().toISOString(),
      };

      memoryUsersDb[normalizedEmail] = {
        profile: newUser,
        passwordHash: hash,
        salt: salt,
      };

      return NextResponse.json({
        success: true,
        user: newUser,
        token: 'token_' + Date.now(),
      }, { status: 201 });
    }

    // ==========================================
    // 4. Update Profile
    // ==========================================
    if (action === 'update_profile') {
      if (!email || !profile) {
        return NextResponse.json(
          { success: false, error: 'User email and profile payload are required.' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (db) {
        const updateData: any = {};
        if (profile.name) updateData.name = profile.name.trim();
        if (profile.bio !== undefined) updateData.bio = profile.bio;
        if (profile.phone !== undefined) updateData.phone = profile.phone;
        if (profile.avatarUrl) updateData.avatarUrl = profile.avatarUrl;
        if (profile.badge) updateData.badge = profile.badge;
        if (profile.favoriteCuisines) updateData.favoriteCuisines = profile.favoriteCuisines;
        if (profile.dietaryPreferences) updateData.dietaryPreferences = profile.dietaryPreferences;

        const updatedDoc = await UserModel.findOneAndUpdate(
          { email: normalizedEmail },
          { $set: updateData },
          { new: true, upsert: true }
        );

        return NextResponse.json({
          success: true,
          user: formatUserResponse(updatedDoc),
        });
      }

      // Memory Fallback
      const record = memoryUsersDb[normalizedEmail] || {
        profile: {
          id: 'user_' + Date.now(),
          email: normalizedEmail,
          name: profile.name || normalizedEmail.split('@')[0],
          favoriteCuisines: [],
          dietaryPreferences: [],
          createdAt: new Date().toISOString(),
        }
      };

      const updatedProfile: UserProfile = {
        ...record.profile,
        ...profile,
        email: normalizedEmail,
      };

      record.profile = updatedProfile;
      memoryUsersDb[normalizedEmail] = record;

      return NextResponse.json({
        success: true,
        user: updatedProfile,
      });
    }

    // ==========================================
    // 5. Change Password
    // ==========================================
    if (action === 'change_password') {
      if (!email || !currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password and new password are required.' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 6 characters.' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (db) {
        const userDoc = await UserModel.findOne({ email: normalizedEmail });
        if (!userDoc) {
          return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
        }

        if (userDoc.passwordHash && userDoc.salt) {
          const isValid = verifyPassword(currentPassword, userDoc.passwordHash, userDoc.salt);
          if (!isValid) {
            return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 401 });
          }
        }

        const { hash, salt } = hashPassword(newPassword);
        userDoc.passwordHash = hash;
        userDoc.salt = salt;
        await userDoc.save();

        return NextResponse.json({ success: true, message: 'Password updated successfully.' });
      }

      // Memory fallback
      const record = memoryUsersDb[normalizedEmail];
      if (!record) {
        return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
      }

      if (record.passwordHash && record.salt) {
        const isValid = verifyPassword(currentPassword, record.passwordHash, record.salt);
        if (!isValid) {
          return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 401 });
        }
      }

      const { hash, salt } = hashPassword(newPassword);
      record.passwordHash = hash;
      record.salt = salt;

      return NextResponse.json({ success: true, message: 'Password updated successfully.' });
    }

    // ==========================================
    // 6. Forgot Password Simulation
    // ==========================================
    if (action === 'forgot_password') {
      if (!email) {
        return NextResponse.json({ success: false, error: 'Please enter your email.' }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: `Password reset instructions have been dispatched to ${email}. Check your inbox!`,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid auth action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in /api/auth:', error);
    return NextResponse.json({ success: false, error: error.message || 'Authentication service error.' }, { status: 500 });
  }
}
