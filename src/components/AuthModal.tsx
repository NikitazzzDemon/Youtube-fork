import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PillButton } from './PillButton';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, authError, setAuthError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (e) {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = () => {
    setEmail('admin@glasstube.vps');
    setPassword('admin123');
    setName('VPS Owner');
    setIsRegister(false);
    setAuthError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-5 sm:p-7 border border-zinc-500/20 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Close button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full glass-panel hover:bg-zinc-500/20 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center shadow-lg border border-zinc-500/30">
            <Shield className="w-5 h-5 fill-current" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold">
            {isRegister ? 'Register VPS Access' : 'Private VPS Authorization'}
          </h2>
          <p className="text-xs opacity-70 max-w-xs">
            Authenticate to access your private YouTube proxy client and saved subscriptions.
          </p>
        </div>

        {/* Error alert */}
        {authError && (
          <div className="mb-4 p-2.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-500 text-xs text-center font-semibold">
            {authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {isRegister && (
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3 w-4 h-4 opacity-50" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                placeholder="Your Name / Alias"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs sm:text-sm focus:outline-none"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 opacity-50" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs sm:text-sm focus:outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 opacity-50" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password or Passcode"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs sm:text-sm focus:outline-none"
            />
          </div>

          <PillButton
            type="submit"
            activeGlow
            active
            disabled={loading}
            className="w-full py-2.5 mt-1 font-bold text-sm"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Unlock VPS Proxy'}
          </PillButton>
        </form>

        {/* Quick Demo Pre-fill button */}
        <div className="mt-4 pt-4 border-t border-zinc-500/20 flex flex-col gap-2.5">
          <button
            onClick={fillQuickDemo}
            type="button"
            className="w-full py-2 px-3 rounded-full glass-panel hover:bg-zinc-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Use Demo Credentials (admin@glasstube.vps / admin123)</span>
          </button>

          <div className="text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setAuthError(null);
              }}
              className="text-xs opacity-70 hover:opacity-100 transition underline cursor-pointer"
            >
              {isRegister ? 'Already have an account? Sign in' : 'New user? Register access'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
