import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { spatialAudio } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  Bookmark, 
  Download, 
  Eye, 
  EyeOff,
  Zap
} from 'lucide-react';

const AVATAR_SEEDS = [
  { id: 'Cyber-Neon', label: 'Neon', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberNeon' },
  { id: 'Valkyrie', label: 'Valkyrie', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Valkyrie' },
  { id: 'Zenith', label: 'Zenith', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zenith' },
  { id: 'Shadow-Rogue', label: 'Shadow', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ShadowRogue' },
  { id: 'Quantum', label: 'Quantum', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Quantum' },
  { id: 'Aura', label: 'Aura', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aura' }
];

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal, loginUser } = useApp();

  const [mode, setMode] = useState(authModalMode || 'login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_SEEDS[0].url);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync mode when opened
  React.useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
      setError('');
      setSuccess('');
    }
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    spatialAudio.playClick();
    triggerHaptic('medium');

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please provide a valid Gmail / Email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your confirm password.');
        return;
      }
    } else {
      if (!email.trim() || !password) {
        setError('Please enter your email and password.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await api.signup({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
          avatar: selectedAvatar
        });
        if (res.token && res.user) {
          spatialAudio.playOpen();
          loginUser(res.token, res.user);
        } else {
          setSuccess('Account created! Please sign in with your credentials.');
          setMode('login');
        }
      } else {
        const res = await api.login(email.trim(), password);
        if (res.token && res.user) {
          spatialAudio.playOpen();
          loginUser(res.token, res.user);
        } else {
          setError(res.error || 'Failed to authenticate. Please check your credentials.');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    spatialAudio.playClick();
    triggerHaptic('light');
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Header with Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[var(--color-accent)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {mode === 'signup' ? 'Create XEN Account' : 'Welcome to XENMOVIES'}
              </h2>
              <p className="text-[11px] text-neutral-400">
                {mode === 'signup' 
                  ? 'Unlock Watchlist & 4K direct downloads'
                  : 'Access your private library and multi-device sync'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              spatialAudio.playClick();
              closeAuthModal();
            }}
            data-modal-close="true"
            data-tv-focus="true"
            tabIndex={0}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 mb-4 rounded-xl bg-neutral-950 border border-neutral-800 gap-1">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer text-center whitespace-nowrap ${
              mode === 'login'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer text-center whitespace-nowrap ${
              mode === 'signup'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create Free Account
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-3 p-2.5 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <X className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Parth Xen"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-neutral-950 bg-white hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create My Account' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-4 pt-3 border-t border-neutral-800 text-center text-xs text-neutral-400">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-white hover:underline font-semibold ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="text-white hover:underline font-semibold ml-1 cursor-pointer"
              >
                Create Free Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
