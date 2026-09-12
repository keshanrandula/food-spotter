'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Edit3, 
  Heart, 
  Award, 
  ShieldCheck, 
  KeyRound, 
  Phone, 
  Flame, 
  Bookmark, 
  CalendarCheck, 
  Compass, 
  Check, 
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
  onOpenSavedSpots?: () => void;
  onOpenBookings?: () => void;
}

// Preset Avatars for Foodies
const AVATAR_PRESETS = [
  {
    id: 'foodie_1',
    label: 'Gourmet Critic',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'chef_2',
    label: 'Master Chef',
    url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'traveler_3',
    label: 'Spice Hunter',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'connoisseur_4',
    label: 'Dessert Lover',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'coffee_5',
    label: 'Coffee Artisan',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'sushi_6',
    label: 'Sushi Specialist',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  },
];

const CUISINE_OPTIONS = [
  'Sri Lankan',
  'Seafood Specialist',
  'Italian & Woodfired Pizza',
  'Japanese & Sushi',
  'Indian & Biryani',
  'Burgers & BBQ',
  'Artisan Cafe & Brunch',
  'Chinese & Dim Sum',
  'Thai Street Food',
  'Fine Dining',
  'Healthy & Vegan',
];

const DIETARY_OPTIONS = [
  'Halal Friendly',
  '100% Vegetarian',
  'Strictly Vegan',
  'Gluten-Free',
  'Seafood Lover',
  'Spice Fiend 🌶️',
  'Organic & Fresh',
];

const BADGE_OPTIONS = [
  'Epicurean Critic ★★★',
  'Master Food Hunter 🏆',
  'Street Food Guru 🍲',
  'Artisan Coffee Connoisseur ☕',
  'Spice & Curry Legend 🌶️',
  'Gourmet Explorer ★',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  onOpenSavedSpots,
  onOpenBookings,
}) => {
  // Modal Navigation & Modes
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'profile'>('login');
  const [profileTab, setProfileTab] = useState<'details' | 'taste' | 'stats' | 'security'>('details');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [badge, setBadge] = useState('Epicurean Critic ★★★');
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PRESETS[0].url);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(['Sri Lankan', 'Seafood Specialist']);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(['Halal Friendly']);

  // Security Form Fields (Change Password)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state when current user changes or modal opens
  useEffect(() => {
    if (currentUser) {
      setAuthMode('profile');
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setBio(currentUser.bio || '');
      setBadge(currentUser.badge || 'Epicurean Critic ★★★');
      setAvatarUrl(currentUser.avatarUrl || AVATAR_PRESETS[0].url);
      setSelectedCuisines(currentUser.favoriteCuisines || ['Sri Lankan']);
      setSelectedDietary(currentUser.dietaryPreferences || []);
    } else {
      setAuthMode('login');
    }
    setStatusMsg(null);
  }, [currentUser, isOpen]);

  // Calculate live password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-zinc-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Good', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong & Secure', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  if (!isOpen) return null;

  // 1. One-click Quick Demo Account Login
  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: 'demo@foodspotter.com',
          password: 'demo123',
        }),
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
        setStatusMsg({ type: 'success', text: `Welcome back, ${data.user.name}!` });
        setTimeout(() => onClose(), 800);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Demo sign-in failed' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Demo sign-in failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Social Login Handler
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'social_login',
          provider,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
        setStatusMsg({ type: 'success', text: `Signed in successfully with ${provider === 'google' ? 'Google' : 'GitHub'}!` });
        setTimeout(() => onClose(), 800);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Social sign-in failed' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Social sign-in failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Email & Password Authentication (Login / Register)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (authMode === 'register') {
      if (password !== confirmPassword) {
        setStatusMsg({ type: 'error', text: 'Passwords do not match. Please check again.' });
        return;
      }
      if (password.length < 6) {
        setStatusMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload: any = {
        action: authMode === 'register' ? 'register' : 'login',
        email: email.trim(),
        password,
      };

      if (authMode === 'register') {
        payload.name = name.trim();
        payload.phone = phone.trim();
        payload.avatarUrl = avatarUrl;
        payload.favoriteCuisines = selectedCuisines;
        payload.dietaryPreferences = selectedDietary;
      }

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
        setStatusMsg({ 
          type: 'success', 
          text: authMode === 'register' ? `Account created! Welcome, ${data.user.name}!` : `Welcome back, ${data.user.name}!` 
        });
        setTimeout(() => onClose(), 900);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Authentication failed' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Network connection failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Forgot Password Flow
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMsg({ type: 'error', text: 'Please enter your account email.' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forgot_password', email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: data.message });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Password reset request failed' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Reset request failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Update Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          email: currentUser.email,
          profile: {
            name: name.trim(),
            phone: phone.trim(),
            bio: bio.trim(),
            badge,
            avatarUrl,
            favoriteCuisines: selectedCuisines,
            dietaryPreferences: selectedDietary,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
        setStatusMsg({ type: 'success', text: 'Foodie profile updated successfully! 🎉' });
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error updating profile' });
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (newPassword !== confirmNewPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          email: currentUser.email,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Password successfully changed!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error changing password' });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Cuisine Tag
  const toggleCuisine = (c: string) => {
    setSelectedCuisines(prev => 
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  // Toggle Dietary Tag
  const toggleDietary = (d: string) => {
    setSelectedDietary(prev => 
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-xl bg-zinc-900/95 dark:bg-zinc-900 border border-zinc-700/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Top Header Banner */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-savor-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
              {currentUser ? <Award size={22} /> : <User size={22} />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-serif">
                {currentUser ? currentUser.name : authMode === 'login' ? 'Welcome to FoodSpotter' : authMode === 'register' ? 'Create Foodie Account' : 'Reset Password'}
                {currentUser && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold border border-rose-500/30">
                    {currentUser.badge || 'Foodie Member'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-400">
                {currentUser 
                  ? 'Manage your taste profile, badges, and VIP dining preferences' 
                  : authMode === 'login' 
                  ? 'Sign in to unlock personalized spots & instant table bookings' 
                  : 'Join 10,000+ passionate food explorers across Sri Lanka'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Status Alerts */}
        <AnimatePresence>
          {statusMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pt-4"
            >
              <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-sm ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/70 text-emerald-200 border border-emerald-700/60'
                  : 'bg-rose-950/70 text-rose-200 border border-rose-700/60'
              }`}>
                {statusMsg.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" /> : <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />}
                <span>{statusMsg.text}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* ========================================================= */}
          {/* LOGGED IN USER PROFILE MANAGEMENT VIEW                    */}
          {/* ========================================================= */}
          {currentUser ? (
            <div className="space-y-5">
              
              {/* Profile Sub-navigation Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-800 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => { setProfileTab('details'); setStatusMsg(null); }}
                  className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    profileTab === 'details'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Edit3 size={13} /> Details
                </button>
                <button
                  type="button"
                  onClick={() => { setProfileTab('taste'); setStatusMsg(null); }}
                  className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    profileTab === 'taste'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Flame size={13} /> Taste & Diet
                </button>
                <button
                  type="button"
                  onClick={() => { setProfileTab('stats'); setStatusMsg(null); }}
                  className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    profileTab === 'stats'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Award size={13} /> Stats
                </button>
                <button
                  type="button"
                  onClick={() => { setProfileTab('security'); setStatusMsg(null); }}
                  className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    profileTab === 'security'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <ShieldCheck size={13} /> Security
                </button>
              </div>

              {/* Tab 1: Profile Details & Bio */}
              {profileTab === 'details' && (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {/* Current Avatar & Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300">Choose Foodie Avatar</label>
                    <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-2xl border border-zinc-800 overflow-x-auto">
                      {AVATAR_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setAvatarUrl(p.url)}
                          className={`relative w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                            avatarUrl === p.url ? 'border-rose-500 scale-105 shadow-md shadow-rose-500/30' : 'border-zinc-800 opacity-60 hover:opacity-100'
                          }`}
                          title={p.label}
                        >
                          <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                          {avatarUrl === p.url && (
                            <div className="absolute inset-0 bg-rose-600/30 flex items-center justify-center text-white">
                              <Check size={14} className="stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-300">Display Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-300">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+94 77 123 4567"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  {/* Foodie Badge */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Culinary Badge / Title</label>
                    <select
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                    >
                      {BADGE_OPTIONS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Foodie Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={2}
                      placeholder="Share your favorite food memories and culinary cravings..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="px-4 py-2.5 rounded-xl border border-rose-900/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Edit3 size={14} />}
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: Taste & Dietary Preferences */}
              {profileTab === 'taste' && (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Flame size={14} className="text-rose-400" /> Favorite Cuisines
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CUISINE_OPTIONS.map((c) => {
                        const selected = selectedCuisines.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleCuisine(c)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                              selected
                                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                                : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                            }`}
                          >
                            {selected && <Check size={12} />}
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" /> Dietary & Lifestyle Preferences
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {DIETARY_OPTIONS.map((d) => {
                        const selected = selectedDietary.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => toggleDietary(d)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                              selected
                                ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                                : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                            }`}
                          >
                            {selected && <Check size={12} />}
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                      Save Preferences
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 3: Culinary Stats & Activities */}
              {profileTab === 'stats' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
                      <div className="w-8 h-8 mx-auto rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center">
                        <Bookmark size={16} />
                      </div>
                      <div className="text-lg font-extrabold text-white">
                        {currentUser.stats?.savedCount || currentUser.savedPlaceIds?.length || 4}
                      </div>
                      <div className="text-[11px] font-medium text-zinc-400">Saved Places</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
                      <div className="w-8 h-8 mx-auto rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                        <CalendarCheck size={16} />
                      </div>
                      <div className="text-lg font-extrabold text-white">
                        {currentUser.stats?.bookingsCount || 2}
                      </div>
                      <div className="text-[11px] font-medium text-zinc-400">VIP Bookings</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
                      <div className="w-8 h-8 mx-auto rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                        <Award size={16} />
                      </div>
                      <div className="text-lg font-extrabold text-white">
                        {currentUser.stats?.reviewsCount || 8}
                      </div>
                      <div className="text-[11px] font-medium text-zinc-400">Food Reviews</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Compass size={14} className="text-rose-400" /> Quick Navigation Shortcuts
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {onOpenSavedSpots && (
                        <button
                          type="button"
                          onClick={() => { onClose(); onOpenSavedSpots(); }}
                          className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold flex items-center justify-between border border-zinc-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5"><Bookmark size={13} className="text-rose-400" /> Saved Spots</span>
                          <ArrowRight size={12} className="text-zinc-500" />
                        </button>
                      )}
                      {onOpenBookings && (
                        <button
                          type="button"
                          onClick={() => { onClose(); onOpenBookings(); }}
                          className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold flex items-center justify-between border border-zinc-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5"><CalendarCheck size={13} className="text-amber-400" /> Bookings</span>
                          <ArrowRight size={12} className="text-zinc-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Security & Change Password */}
              {profileTab === 'security' && (
                <form onSubmit={handleChangePassword} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">New Password (min 6 characters)</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <KeyRound size={14} />}
                      Update Password
                    </button>
                  </div>
                </form>
              )}

            </div>
          ) : (
            /* ========================================================= */
            /* LOGGED OUT: SIGN IN / SIGN UP / FORGOT PASSWORD           */
            /* ========================================================= */
            <div className="space-y-4">
              
              {/* Top Navigation Switcher */}
              <div className="flex items-center p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setStatusMsg(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setStatusMsg(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* 1-Click Quick Demo Sign In Box */}
              {authMode === 'login' && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-zinc-950 to-zinc-950 border border-rose-900/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/40">
                      <Zap size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Instant Foodie Demo</div>
                      <div className="text-[11px] text-zinc-400">One-click sign in as Keshan (Critic)</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    disabled={isLoading}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    ⚡ Demo Login
                  </button>
                </div>
              )}

              {/* Social Login Buttons (Google / GitHub) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="p-3 rounded-2xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/80 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoading}
                  className="p-3 rounded-2xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/80 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
                >
                  <svg className="w-4 h-4 fill-zinc-200" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-zinc-800 w-full" />
                <span className="bg-zinc-900 px-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  or with email credentials
                </span>
              </div>

              {/* Form: Forgot Password */}
              {authMode === 'forgot' ? (
                <form onSubmit={handleForgotPassword} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Registered Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-3 text-zinc-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer mt-2 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Mail size={14} />}
                    Send Password Reset Link
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-xs text-rose-400 font-bold hover:underline cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                /* Form: Login / Register */
                <form onSubmit={handleEmailAuth} className="space-y-3.5">
                  
                  {/* Registration specific fields */}
                  {authMode === 'register' && (
                    <>
                      {/* Avatar Selector in Registration */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-300">Choose Avatar</label>
                        <div className="flex items-center gap-2.5 p-2 bg-zinc-950 rounded-2xl border border-zinc-800 overflow-x-auto">
                          {AVATAR_PRESETS.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setAvatarUrl(p.url)}
                              className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                                avatarUrl === p.url ? 'border-rose-500 scale-105 shadow-sm' : 'border-zinc-800 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                              {avatarUrl === p.url && (
                                <div className="absolute inset-0 bg-rose-600/30 flex items-center justify-center text-white">
                                  <Check size={12} className="stroke-[3]" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Full Name */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-300">Full Name *</label>
                        <div className="relative">
                          <User size={15} className="absolute left-3.5 top-3 text-zinc-500" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Kasun Perera"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                            required
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-300">Phone Number (Optional)</label>
                        <div className="relative">
                          <Phone size={15} className="absolute left-3.5 top-3 text-zinc-500" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+94 77 123 4567"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Email Address *</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-3 text-zinc-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-300">Password *</label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setAuthMode('forgot')}
                          className="text-[11px] font-semibold text-rose-400 hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-3 text-zinc-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Meter for Registration */}
                  {authMode === 'register' && password && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">Strength</span>
                        <span className="font-bold text-zinc-300">{strength.label}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 h-1.5">
                        <div className={`rounded-full transition-all ${strength.score >= 1 ? strength.color : 'bg-zinc-800'}`} />
                        <div className={`rounded-full transition-all ${strength.score >= 2 ? strength.color : 'bg-zinc-800'}`} />
                        <div className={`rounded-full transition-all ${strength.score >= 3 ? strength.color : 'bg-zinc-800'}`} />
                      </div>
                    </div>
                  )}

                  {/* Confirm Password in Registration */}
                  {authMode === 'register' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-300">Confirm Password *</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-3 text-zinc-500" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer mt-2 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : authMode === 'login' ? (
                      <>
                        <ShieldCheck size={14} /> Sign In to FoodSpotter
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> Create Free Account
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Mode Toggle Footer */}
              {authMode !== 'forgot' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login');
                      setStatusMsg(null);
                    }}
                    className="text-xs text-rose-400 font-bold hover:underline cursor-pointer"
                  >
                    {authMode === 'login' ? "Don't have an account yet? Create One" : 'Already have an account? Sign In'}
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </motion.div>
    </div>
  );
};

