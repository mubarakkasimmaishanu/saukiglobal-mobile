import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  Fingerprint
} from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  onBack: () => void;
  onSuccess: () => void;
}

export default function AuthPage({ initialMode = 'login', onBack, onSuccess }: AuthPageProps) {
  const { refreshUser, setUserContext } = useUser();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === 'signup' && (!name || !phone)) return;
    
    setIsLoading(true);
    setError(null);

    try {
      let loggedInUser;
      if (mode === 'login') {
        loggedInUser = await api.login(email, password);
      } else {
        loggedInUser = await api.register(name, email, phone, password);
      }
      
      // Immediately set the user in context to prevent loading screen freeze
      if (loggedInUser) {
        // Robust mapping for legacy data structures
        if (!loggedInUser.firstName && (loggedInUser as any).name) {
          const parts = (loggedInUser as any).name.split(' ');
          loggedInUser.firstName = parts[0] || 'User';
          loggedInUser.lastName = parts.slice(1).join(' ') || '';
        }
        loggedInUser.firstName = loggedInUser.firstName || 'User';
        loggedInUser.lastName = loggedInUser.lastName || '';
        
        if (setUserContext) {
          setUserContext(loggedInUser);
        }
      }
      
      await refreshUser();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient flex flex-col justify-center py-12 px-6 relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#66df75]/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#66df75]/5 rounded-full blur-[120px]"></div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-[#e1e3e4]/50 hover:text-[#66df75] font-bold transition-all group z-10"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs uppercase tracking-widest">Back</span>
      </button>

      {/* Brand Header */}
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
        <img src="/saukilogo.png" alt="SaukiGlobal Logo" className="w-24 h-24 object-contain mx-auto mb-6 drop-shadow-[0_0_25px_rgba(102,223,117,0.3)] transform hover:scale-105 transition-transform duration-500" />
        <h2 className="text-3xl font-black text-white tracking-tighter mb-2">SaukiGlobal</h2>
        <p className="text-xs font-bold text-[#66df75] uppercase tracking-[0.3em]">
          {mode === 'login' ? 'Secure Login Portal' : 'Create Account'}
        </p>
      </div>

      <div className="max-w-md mx-auto w-full animate-in zoom-in-95 duration-500 relative z-10">
        <div className="glass-panel p-8 shadow-2xl border border-white/5 relative">
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#66df75]/10 flex items-center justify-center">
              <Fingerprint size={20} className="text-[#66df75]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Identity Verification</h3>
              <p className="text-[10px] text-[#e1e3e4]/40 uppercase tracking-wider font-bold">Encrypted Session</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-[10px] font-black uppercase tracking-widest rounded-xl animate-in shake duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-[#e1e3e4]/30" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20 tracking-wide"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone size={18} className="text-[#e1e3e4]/30" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20 tracking-wide"
                      placeholder="08012345678"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[#e1e3e4]/30" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20 tracking-wide"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[#e1e3e4]/30" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20 tracking-widest"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#e1e3e4]/30 hover:text-[#66df75] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password || (mode === 'signup' && (!name || !phone))}
              className="w-full btn-primary py-4 flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="uppercase tracking-[0.1em] font-black">
                    {mode === 'login' ? 'Authorize Access' : 'Create Account'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-xs text-[#e1e3e4]/50">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="ml-2 text-[#66df75] font-bold hover:underline"
              >
                {mode === 'login' ? 'Register Now' : 'Login Here'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        {mode === 'login' && (
          <div className="mt-6 flex justify-center gap-8">
            <button className="text-[10px] font-black text-[#e1e3e4]/30 hover:text-[#66df75] uppercase tracking-widest transition-colors">
              Forgot Password?
            </button>
            <button className="text-[10px] font-black text-[#e1e3e4]/30 hover:text-[#66df75] uppercase tracking-widest transition-colors">
              Contact Support
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
