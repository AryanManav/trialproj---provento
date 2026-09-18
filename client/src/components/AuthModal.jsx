import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isLoginTab) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = async () => {
    setEmail('demo@codemaster.dev');
    setPassword('password123');
    setError('');
    setSubmitting(true);
    try {
      await login('demo@codemaster.dev', 'password123');
      onClose();
    } catch (err) {
      setError('Demo account not seeded yet. You can sign up or run `npm run seed`.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#252526] border border-[#3e3e42] rounded-lg shadow-2xl w-full max-w-md overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#333333]">
          <h2 className="text-base font-semibold text-white">
            {isLoginTab ? 'Sign in to Code Master' : 'Create an Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#333333] bg-[#1e1e1e]">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setError('');
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
              isLoginTab
                ? 'border-blue-500 text-white bg-[#252526]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setError('');
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
              !isLoginTab
                ? 'border-blue-500 text-white bg-[#252526]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-950/60 border border-red-800 text-red-300 rounded text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {!isLoginTab && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="Aryan Developer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded pl-9 pr-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-2.5 text-gray-500" />
              <input
                type="email"
                required
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded pl-9 pr-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-2.5 text-gray-500" />
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded pl-9 pr-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center justify-center space-x-2 transition disabled:opacity-60 shadow"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{isLoginTab ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>

          {/* Quick Demo Login Option */}
          <div className="pt-2 border-t border-[#333333] flex flex-col items-center">
            <button
              type="button"
              onClick={handleFillDemo}
              disabled={submitting}
              className="w-full py-2 bg-[#333333] hover:bg-[#3d3d40] text-gray-200 rounded text-xs font-medium flex items-center justify-center space-x-1.5 transition border border-[#444]"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>One-Click Demo Account (demo@codemaster.dev)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
