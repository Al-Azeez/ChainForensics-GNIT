import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Shield, Lock, Mail, User as UserIcon, AlertCircle, Play } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, demoLogin } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register({ name, email, password });
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setIsLoading(true);
    try {
      await demoLogin();
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Demo session failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col justify-center py-12 sm:px-6 lg:px-8 cyber-grid">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h2 className="text-xl font-extrabold text-[#F8FAFC]">
          Create Investigator Account
        </h2>
        <p className="text-xs text-[#94A3B8]">
          Register a secure analyst workspace for blockchain transaction forensics.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="p-8 rounded-2xl bg-[#0B1730] border border-[#06D9FF]/20 shadow-card space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 flex items-center gap-2 text-xs text-[#EF4444]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#06D9FF]" />
                <span>Analyst Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Alex Vance"
                className="w-full px-3.5 py-2 rounded-xl bg-[#06132D] border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#06D9FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#06D9FF]" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="investigator@agency.io"
                className="w-full px-3.5 py-2 rounded-xl bg-[#06132D] border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#06D9FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#06D9FF]" />
                <span>Password (min 6 characters)</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-[#06132D] border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#06D9FF]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#06D9FF] text-white text-xs font-bold shadow-glow-blue hover:brightness-110 transition-all"
            >
              {isLoading ? 'Registering...' : 'Create Account'}
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#0B1730] px-3 text-[10px] font-mono text-[#94A3B8] uppercase">
              Or Try Demo
            </span>
          </div>

          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#06132D] hover:bg-[#102246] border border-white/10 text-xs font-medium text-[#F8FAFC] transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-[#06D9FF] fill-current" />
            <span>Instant Guest Demo</span>
          </button>

          <div className="text-center text-xs text-[#94A3B8]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#06D9FF] hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
