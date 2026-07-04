import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { User } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (user: User, isNew: boolean) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Verification step helper
  const [verificationSentUser, setVerificationSentUser] = useState<User | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
          onAuthSuccess(data.user, false);
        } else {
          setError(data.error || 'Authentication failed');
        }
      } else if (mode === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        });
        const data = await res.json();
        if (res.ok) {
          setVerificationSentUser(data.user);
          setMode('verify');
          setMessage(data.message || 'Signup successful. Please verify your email.');
        } else {
          setError(data.error || 'Signup failed');
        }
      } else if (mode === 'forgot') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          setMessage(data.message || 'Password reset link sent!');
        } else {
          setError(data.error || 'Could not reset password');
        }
      }
    } catch (e) {
      setError('Connection error. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-email', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        onAuthSuccess(data.user, true); // Flag user as NEW so the chatbot robot greets them!
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (e) {
      setError('Could not verify email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECECEC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative background grid and blurs */}
      <div className="absolute inset-0 bg-[radial-gradient(#D8D8D8_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.08)] rounded-3xl p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 bg-blue-50 text-blue-600 rounded-2xl mb-4 shadow-sm border border-blue-100">
            <svg viewBox="0 0 100 100" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="20" y="35" width="60" height="48" rx="12" />
              <circle cx="50" cy="15" r="7" className="fill-blue-500 stroke-none" />
              <line x1="50" y1="22" x2="50" y2="35" strokeWidth="4" />
              <circle cx="40" cy="54" r="3" className="fill-blue-500 stroke-none" />
              <circle cx="60" cy="54" r="3" className="fill-blue-500 stroke-none" />
              <path d="M46,68 Q50,71 54,68" strokeWidth="4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">HackMate AI</h1>
          <p className="text-sm text-gray-500 mt-1.5">Your team's persistent hackathon memory inside Slack.</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 p-3.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl text-xs font-medium">
            {message}
          </div>
        )}

        {mode === 'verify' ? (
          <div className="text-center">
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-6 text-left">
              <div className="flex items-center gap-2.5 text-blue-700 font-semibold text-sm mb-2">
                <ShieldCheck className="w-5 h-5" />
                Email Verification Sent
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                We've sent an onboarding authorization link to <span className="font-semibold text-gray-700">{email}</span>. Click the link to secure your account.
              </p>
            </div>
            
            <p className="text-xs text-gray-400 mb-6">
              (For demo purposes, you can simulate clicking the email link below to activate your account)
            </p>

            <button
              onClick={handleVerifyConfirm}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-[#0066FF] hover:bg-blue-600 text-white font-medium rounded-2xl shadow-lg shadow-blue-500/10 transition-all duration-300 active:scale-[0.98]"
            >
              {loading ? 'Authorizing...' : 'Simulate Link Verification'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : mode === 'forgot' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 font-mono">Workspace Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-blue-500 shadow-sm transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3.5 bg-[#0066FF] hover:bg-blue-600 text-white font-medium rounded-2xl shadow-lg shadow-blue-500/10 transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Recovery Instructions'}
            </button>

            <div className="text-center mt-5">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 font-mono"
              >
                Return to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 font-mono">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-blue-500 shadow-sm transition-all placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 font-mono">Workspace Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hackmate.ai"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-blue-500 shadow-sm transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-mono">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-gray-400 hover:text-gray-600 font-mono"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-blue-500 shadow-sm transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-3.5 bg-[#0066FF] hover:bg-blue-600 text-white font-medium rounded-2xl shadow-lg shadow-blue-500/10 transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Access Workspace' : 'Create Team Account'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center mt-6 pt-5 border-t border-gray-100/60">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError(null);
                  setMessage(null);
                }}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 font-mono"
              >
                {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
