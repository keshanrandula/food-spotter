import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { UserProfile } from '@/types';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';

export const dynamic = 'force-dynamic';

// Pre-seeded in-memory user dataset for Admin simulation & fallback
let memoryAdminUsers: UserProfile[] = [
  {
    id: 'user_admin_01',
    name: 'Keshan Randula',
    email: 'demo@foodspotter.com',
    phone: '+94 77 123 4567',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: 'Lead Culinary Curator & System Admin at FoodSpotter Sri Lanka.',
    badge: 'Epicurean Critic ★★★',
    role: 'admin',
    status: 'active',
    favoriteCuisines: ['Sri Lankan', 'Italian', 'Japanese & Sushi', 'Seafood Specialist'],
    dietaryPreferences: ['Halal Friendly', 'Seafood Lover'],
    savedPlaceIds: ['colombo_01', 'kandy_01'],
    stats: {
      savedCount: 8,
      reviewsCount: 16,
      bookingsCount: 4,
    },
    createdAt: '2026-08-15T08:30:00.000Z',
  },
  {
    id: 'user_critic_02',
    name: 'Dilini Senanayake',
    email: 'dilini.foodcritic@gmail.com',
    phone: '+94 71 890 1234',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    bio: 'Senior Colombo food journalist & dessert connoisseur. 100+ fine dining reviews.',
    badge: 'Master Food Hunter 🏆',
    role: 'pro_critic',
    status: 'active',
    favoriteCuisines: ['Artisan Cafe & Brunch', 'Fine Dining', 'Healthy & Vegan'],
    dietaryPreferences: ['100% Vegetarian', 'Organic & Fresh'],
    savedPlaceIds: ['galle_01', 'colombo_02'],
    stats: {
      savedCount: 14,
      reviewsCount: 29,
      bookingsCount: 7,
    },
    createdAt: '2026-08-20T10:15:00.000Z',
  },
  {
    id: 'user_member_03',
    name: 'Chamara Wickramasinghe',
    email: 'chamara.w@outlook.com',
    phone: '+94 76 555 9876',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    bio: 'Street food enthusiast traveling across Kandy, Galle, and Jaffna.',
    badge: 'Spice & Curry Legend 🌶️',
    role: 'member',
    status: 'active',
    favoriteCuisines: ['Sri Lankan', 'Indian & Biryani', 'Thai Street Food'],
    dietaryPreferences: ['Spice Fiend 🌶️'],
    savedPlaceIds: ['colombo_02'],
    stats: {
      savedCount: 5,
      reviewsCount: 3,
      bookingsCount: 1,
    },
    createdAt: '2026-09-01T14:45:00.000Z',
  },
  {
    id: 'user_member_04',
    name: 'Anuki Perera',
    email: 'anuki.perera@gmail.com',
    phone: '+94 77 444 3322',
    avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&auto=format&fit=crop&q=80',
    bio: 'Home baker & brunch lover exploring hidden cozy cafes in Colombo 07.',
    badge: 'Artisan Coffee Connoisseur ☕',
    role: 'member',
    status: 'active',
    favoriteCuisines: ['Artisan Cafe & Brunch', 'Burgers & BBQ'],
    dietaryPreferences: ['Gluten-Free'],
    savedPlaceIds: [],
    stats: {
      savedCount: 2,
      reviewsCount: 1,
      bookingsCount: 2,
    },
    createdAt: '2026-09-05T12:00:00.000Z',
  },
  {
    id: 'user_spam_05',
    name: 'Spam Bot 99',
    email: 'crypto_promo99@tempmail.xyz',
    phone: '+1 555 0199',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=spambot',
    bio: 'Automated marketing account.',
    badge: 'Taste Scout ★',
    role: 'member',
    status: 'suspended',
    favoriteCuisines: [],
    dietaryPreferences: [],
    savedPlaceIds: [],
    stats: {
      savedCount: 0,
      reviewsCount: 0,
      bookingsCount: 0,
    },
    createdAt: '2026-09-10T19:00:00.000Z',
  }
];

function formatUserDoc(doc: any): UserProfile {
  return {
    id: doc._id?.toString() || doc.id || ('user_' + Date.now()),
    name: doc.name,
    email: doc.email,
    phone: doc.phone || '',
    avatarUrl: doc.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(doc.name || 'foodie')}`,
    bio: doc.bio || 'Passionate foodie exploring culinary spots.',
    badge: doc.badge || 'Gourmet Explorer ★',
    role: doc.role || 'member',
    status: doc.status || 'active',
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

// 1. GET ALL USERS
export async function GET() {
  try {
    const db = await connectToDatabase().catch(() => null);
    if (db) {
      const docs = await UserModel.find({}).sort({ createdAt: -1 });
      if (docs && docs.length > 0) {
        return NextResponse.json({
          success: true,
          data: docs.map(formatUserDoc),
          total: docs.length,
        });
      }
    }

    // Return in-memory list
    return NextResponse.json({
      success: true,
      data: memoryAdminUsers,
      total: memoryAdminUsers.length,
    });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load users' },
      { status: 500 }
    );
  }
}

// 2. PUT - UPDATE USER ROLE / STATUS / BADGE
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, role, status, badge, name, bio, phone } = body;

    if (!id && !email) {
      return NextResponse.json(
        { success: false, error: 'User ID or Email is required for update.' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase().catch(() => null);
    if (db) {
      const updatePayload: any = {};
      if (role) updatePayload.role = role;
      if (status) updatePayload.status = status;
      if (badge) updatePayload.badge = badge;
      if (name) updatePayload.name = name;
      if (bio !== undefined) updatePayload.bio = bio;
      if (phone !== undefined) updatePayload.phone = phone;

      const query = id ? { _id: id } : { email: email.toLowerCase().trim() };
      const updated = await UserModel.findOneAndUpdate(query, { $set: updatePayload }, { new: true });
      if (updated) {
        return NextResponse.json({
          success: true,
          user: formatUserDoc(updated),
          message: `User ${updated.name} updated successfully.`,
        });
      }
    }

    // In-Memory update
    const index = memoryAdminUsers.findIndex(u => u.id === id || u.email.toLowerCase() === email?.toLowerCase());
    if (index !== -1) {
      const current = memoryAdminUsers[index];
      const updatedUser: UserProfile = {
        ...current,
        role: role || current.role,
        status: status || current.status,
        badge: badge || current.badge,
        name: name || current.name,
        bio: bio !== undefined ? bio : current.bio,
        phone: phone !== undefined ? phone : current.phone,
      };
      memoryAdminUsers[index] = updatedUser;

      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: `User ${updatedUser.name} updated successfully.`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// 3. DELETE USER
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id && !email) {
      return NextResponse.json(
        { success: false, error: 'User ID or Email is required for deletion.' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase().catch(() => null);
    if (db) {
      const query = id ? { _id: id } : { email: email?.toLowerCase().trim() };
      await UserModel.deleteOne(query);
      return NextResponse.json({
        success: true,
        message: 'User deleted successfully from database.',
      });
    }

    // In-memory delete
    memoryAdminUsers = memoryAdminUsers.filter(u => u.id !== id && u.email.toLowerCase() !== email?.toLowerCase());

    return NextResponse.json({
      success: true,
      message: 'User account removed successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// 4. POST - CREATE USER FROM ADMIN
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, phone, badge, status } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Full Name and Email are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = await connectToDatabase().catch(() => null);

    if (db) {
      const existing = await UserModel.findOne({ email: normalizedEmail });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'A user with this email already exists.' },
          { status: 409 }
        );
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync('TempPass123!', salt, 1000, 64, 'sha512').toString('hex');

      const doc = await UserModel.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hash,
        salt: salt,
        phone: phone?.trim() || '',
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name.trim())}`,
        bio: 'Foodie member created via Admin Control Panel.',
        badge: badge || 'Gourmet Explorer ★',
        role: role || 'member',
        status: status || 'active',
        favoriteCuisines: ['Sri Lankan'],
        dietaryPreferences: [],
        savedPlaceIds: [],
      });

      return NextResponse.json({
        success: true,
        user: formatUserDoc(doc),
        message: `User ${doc.name} created successfully.`,
      }, { status: 201 });
    }

    // In-memory creation
    if (memoryAdminUsers.some(u => u.email.toLowerCase() === normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'A user with this email already exists.' },
        { status: 409 }
      );
    }

    const newUser: UserProfile = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || '',
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name.trim())}`,
      bio: 'Foodie member created via Admin Control Panel.',
      badge: badge || 'Gourmet Explorer ★',
      role: role || 'member',
      status: status || 'active',
      favoriteCuisines: ['Sri Lankan'],
      dietaryPreferences: [],
      savedPlaceIds: [],
      stats: { savedCount: 0, reviewsCount: 0, bookingsCount: 0 },
      createdAt: new Date().toISOString(),
    };

    memoryAdminUsers = [newUser, ...memoryAdminUsers];

    return NextResponse.json({
      success: true,
      user: newUser,
      message: `User ${newUser.name} created successfully.`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user in admin:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
