'use client';

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Sparkles, 
  X, 
  CheckCircle2, 
  LogOut, 
  Edit3, 
  Heart, 
  Award, 
  Globe, 
  ShieldCheck,
  Camera
} from 'lucide-react';
import { UserProfile } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'profile'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [badge, setBadge] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (currentUser) {
      setAuthMode('profile');
      setName(currentUser.name || '');
      setBio(currentUser.bio || '');
      setBadge(currentUser.badge || 'Epicurean Scout ★');
      setSelectedCuisines(currentUser.favoriteCuisines || []);
    } else {
      setAuthMode('login');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

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
        setStatusMsg({ type: 'success', text: `Welcome back, ${data.user.name}!` });
        setTimeout(() => onClose(), 800);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Login failed' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Social login error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authMode === 'register' ? 'register' : 'login',
          email,
          name: authMode === 'register' ? name : undefined,
          password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
        setStatusMsg({ type: 'success', text: `Signed in as ${data.user.name}` });
        setTimeout(() => onClose(), 800);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Authentication error' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Connection error' });
    } finally {
      setIsLoading(false);
    }
  };

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
            name,
            bio,
            badge,
            favoriteCuisines: selectedCuisines,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
        setStatusMsg({ type: 'success', text: 'Foodie profile updated successfully!' });
        setTimeout(() => setStatusMsg(null), 2500);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Update failed' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error updating profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const cuisineOptions = ['Sri Lankan', 'Seafood', 'Italian', 'Japanese & Sushi', 'Indian', 'Burgers', 'Cafe & Bakery', 'Healthy / Vegan'];

  const toggleCuisine = (c: string) => {
    if (selectedCuisines.includes(c)) {
      setSelectedCuisines(selectedCuisines.filter(x => x !== c));
    } else {
      setSelectedCuisines([...selectedCuisines, c]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
              <User size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                {currentUser ? 'Foodie Member Profile' : authMode === 'login' ? 'Welcome to FoodSpotter' : 'Join FoodSpotter Community'}
              </h3>
              <p className="text-xs text-zinc-400">
                {currentUser ? 'Manage your dining lists, badge & reviews' : 'Save spots, write reviews & explore tailored picks'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">

          {statusMsg && (
            <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950/60 text-rose-300 border border-rose-800'
            }`}>
              <CheckCircle2 size={16} />
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* If Logged In: Profile View & Edit */}
          {currentUser ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* User Avatar & Badge */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-500 shadow-sm"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-zinc-100">{currentUser.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold border border-rose-500/30">
                      {currentUser.badge || 'Epicurean Critic ★★★'}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-1">
                    <Mail size={12} className="text-zinc-500" />
                    <span>{currentUser.email}</span>
                  </div>
                </div>
              </div>

              {/* Edit Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Foodie Bio */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Foodie Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the community what cuisines and flavors you crave..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Foodie Badge Picker */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Epicurean Title / Badge</label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="Epicurean Critic ★★★">Epicurean Critic ★★★</option>
                  <option value="Master Food Hunter 🏆">Master Food Hunter 🏆</option>
                  <option value="Street Food Guru 🍲">Street Food Guru 🍲</option>
                  <option value="Artisan Coffee & Brunch Connoisseur ☕">Artisan Coffee & Brunch Connoisseur ☕</option>
                  <option value="Spice & Curry Legend 🌶️">Spice & Curry Legend 🌶️</option>
                </select>
              </div>

              {/* Favorite Cuisines */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">Favorite Cuisines</label>
                <div className="flex flex-wrap gap-1.5">
                  {cuisineOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCuisine(c)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        selectedCuisines.includes(c)
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-rose-900/50 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut size={14} /> Sign Out
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit3 size={14} /> Save Profile Changes
                </button>
              </div>
            </form>
          ) : (
            /* Logged Out: Social Login + Email Form */
            <div className="space-y-4">
              
              {/* Social Login Options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="p-3 rounded-2xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
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
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoading}
                  className="p-3 rounded-2xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
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
                  or with email
                </span>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                {authMode === 'register' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kasun Perera"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer mt-2"
                >
                  {isLoading ? 'Processing...' : authMode === 'login' ? 'Sign In to Account' : 'Create Free Account'}
                </button>
              </form>

              {/* Mode Toggle */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-xs text-rose-400 font-bold hover:underline cursor-pointer"
                >
                  {authMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
