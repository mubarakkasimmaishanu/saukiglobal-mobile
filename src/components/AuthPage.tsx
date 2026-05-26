import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Fingerprint,
  Sparkles,
  KeyRound,
  FileCheck2,
  Gift
} from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import PinInput from './PinInput';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  onBack: () => void;
  onSuccess: () => void;
}

export default function AuthPage({ initialMode = 'login', onBack, onSuccess }: AuthPageProps) {
  const { refreshUser, setUserContext } = useUser();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify_otp' | 'reset_password'>(initialMode);
  
  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Compliance / Security Fields
  const [transactionPin, setTransactionPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [kycType, setKycType] = useState('none');
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');

  // Password Reset Fields
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.forgotPassword(resetEmail);
      if (res.success) {
        setInfoMessage(res.message || 'Reset code sent to your email.');
        setMode('verify_otp');
      } else {
        setError(res.message || 'Failed to send reset code.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !otpCode) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.verifyResetCode(resetEmail, otpCode);
      if (res.success) {
        setInfoMessage('Verification successful. Please enter your new password.');
        setMode('reset_password');
      } else {
        setError(res.message || 'Invalid or expired OTP code.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !otpCode || !newPassword) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.resetPassword(resetEmail, otpCode, newPassword);
      if (res.success) {
        alert('Password reset successful! Please log in.');
        setMode('login');
      } else {
        setError(res.message || 'Reset password failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      if (!email || !password) return;
    } else {
      // Registration Form Client Validations (Mirrors main web app)
      if (!name) {
        setError('Full name is required.');
        return;
      }
      if (!email) {
        setError('Email address is required.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Invalid email address format.');
        return;
      }
      if (!phone) {
        setError('Phone number is required.');
        return;
      }
      if (!/^\d{10,15}$/.test(phone)) {
        setError('Phone number must be between 10 and 15 digits.');
        return;
      }
      if (!password) {
        setError('Password is required.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!transactionPin) {
        setError('Transaction PIN is required.');
        return;
      }
      if (!/^\d{4}$/.test(transactionPin)) {
        setError('Transaction PIN must be exactly 4 digits.');
        return;
      }
      if (transactionPin !== confirmPin) {
        setError('Transaction PINs do not match.');
        return;
      }
      if (kycType === 'bvn' || kycType === 'both') {
        if (!bvn) {
          setError('Bank Verification Number (BVN) is required.');
          return;
        }
        if (!/^\d{11}$/.test(bvn)) {
          setError('BVN must be exactly 11 digits.');
          return;
        }
      }
      if (kycType === 'nin' || kycType === 'both') {
        if (!nin) {
          setError('National Identification Number (NIN) is required.');
          return;
        }
        if (!/^\d{11}$/.test(nin)) {
          setError('NIN must be exactly 11 digits.');
          return;
        }
      }
    }
    
    setIsLoading(true);
    setError(null);

    try {
      let loggedInUser;
      if (mode === 'login') {
        loggedInUser = await api.login(email, password);
      } else {
        loggedInUser = await api.register(
          name,
          email,
          phone,
          password,
          transactionPin,
          '', // No referral code on main backend registration form
          kycType,
          bvn,
          nin
        );
      }
      
      if (loggedInUser) {
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
      setError(err.message || 'Authentication failed. Please verify your entries.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient flex flex-col justify-center py-12 px-6 relative overflow-hidden">
      
      {/* Decorative Blur Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#66df75]/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#66df75]/5 rounded-full blur-[120px]"></div>

      {/* Back Navigation */}
      <button
        onClick={() => {
          if (mode === 'forgot' || mode === 'verify_otp' || mode === 'reset_password') {
            setMode('login');
            setError(null);
            setInfoMessage(null);
          } else {
            onBack();
          }
        }}
        className="absolute top-8 left-8 flex items-center gap-2 text-[#e1e3e4]/50 hover:text-[#66df75] font-bold transition-all group z-10"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs uppercase tracking-widest">Back</span>
      </button>

      {/* Corporate Logo & Headline */}
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
        <img src="/saukilogo.png" alt="SaukiGlobal Logo" className="w-20 h-20 object-contain mx-auto mb-5 drop-shadow-[0_0_25px_rgba(102,223,117,0.3)] transform hover:scale-105 transition-transform duration-500" />
        <h2 className="text-3xl font-black text-white tracking-tighter mb-1.5">SaukiGlobal</h2>
        <p className="text-xs font-black text-[#66df75] uppercase tracking-[0.25em]">
          {mode === 'login' && 'Secure Portal Access'}
          {mode === 'signup' && 'Create Account'}
          {mode === 'forgot' && 'Password Recovery'}
          {mode === 'verify_otp' && 'Verify OTP Code'}
          {mode === 'reset_password' && 'Choose New Password'}
        </p>
      </div>

      <div className="max-w-md mx-auto w-full animate-in zoom-in-95 duration-500 relative z-10">
        <div className="glass-panel p-8 shadow-2xl border border-white/5 relative">
          
          {/* Compliance Shield Badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#66df75]/10 flex items-center justify-center text-[#66df75]">
              <Fingerprint size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {mode === 'signup' ? 'Compliance KYC' : 'Encrypted Authentication'}
              </h3>
              <p className="text-[9px] text-[#e1e3e4]/40 uppercase tracking-widest font-black">Military Grade Security</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl animate-in shake duration-300">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="mb-6 p-4 bg-blue-950/20 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-xl">
              {infoMessage}
            </div>
          )}

          {/* LOGIN MODULE */}
          {mode === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
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
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20 tracking-wider"
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
                disabled={isLoading || !email || !password}
                className="w-full btn-primary py-4 mt-6 flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="uppercase tracking-[0.1em] font-black">Authorize Session</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGNUP MODULE (COMPLETE MIRROR OF WEB FRONTEND UI) */}
          {mode === 'signup' && (
            <form onSubmit={handleSubmit} className="space-y-5 max-h-[62vh] overflow-y-auto pr-2 scrollbar-thin">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-[#e1e3e4]/30" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Address */}
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
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone size={18} className="text-[#e1e3e4]/30" />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={15}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                    placeholder="08012345678"
                  />
                </div>
                <p className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider ${phone.length >= 10 ? 'text-[#66df75]' : phone.length > 0 ? 'text-red-400' : 'text-[#e1e3e4]/40'}`}>
                  {phone.length === 0 ? 'Enter 10-15 digits only' : phone.length >= 10 ? `${phone.length} digits ✓` : `${phone.length} digits — need at least 10`}
                </p>
              </div>

              {/* Password */}
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
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                    placeholder="Min. 6 characters"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-[#e1e3e4]/30" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                    placeholder="Repeat password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#e1e3e4]/30 hover:text-[#66df75] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Transaction PIN */}
              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                  <KeyRound size={12} /> Transaction PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound size={18} className="text-[#e1e3e4]/30" />
                  </div>
                  <input
                    type={showPin ? "text" : "password"}
                    required
                    maxLength={4}
                    value={transactionPin}
                    onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20 font-mono tracking-wider"
                    placeholder="4 digits"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#e1e3e4]/30 hover:text-[#66df75] transition-colors"
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Transaction PIN */}
              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                  <KeyRound size={12} /> Confirm Transaction PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound size={18} className="text-[#e1e3e4]/30" />
                  </div>
                  <input
                    type={showConfirmPin ? "text" : "password"}
                    required
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20 font-mono tracking-wider"
                    placeholder="Repeat PIN"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#e1e3e4]/30 hover:text-[#66df75] transition-colors"
                  >
                    {showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Virtual Account KYC Option */}
              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                  <FileCheck2 size={12} /> Virtual Account KYC Option
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Fingerprint size={18} className="text-[#e1e3e4]/30" />
                  </div>
                  <select
                    value={kycType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setKycType(val);
                      if (val === 'bvn') {
                        setNin('');
                      } else if (val === 'nin') {
                        setBvn('');
                      } else if (val === 'none') {
                        setBvn('');
                        setNin('');
                      }
                    }}
                    className="w-full pl-12 pr-10 py-4 bg-[#1e2324] border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="none">Get virtual account with your NIN or BVN (optional)</option>
                    <option value="nin">NIN Only</option>
                    <option value="bvn">BVN Only</option>
                    <option value="both">Both NIN & BVN</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-white/30 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Bank Verification Number (BVN) */}
              {(kycType === 'bvn' || kycType === 'both') && (
                <div className="animate-in slide-in-from-top duration-300">
                  <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Bank Verification Number (BVN)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 text-xs font-black">
                      BVN
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={11}
                      value={bvn}
                      onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all font-mono font-bold tracking-wider"
                      placeholder="11-digit number"
                    />
                  </div>
                </div>
              )}

              {/* National Identification Number (NIN) */}
              {(kycType === 'nin' || kycType === 'both') && (
                <div className="animate-in slide-in-from-top duration-300">
                  <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">National Identification Number (NIN)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 text-xs font-black">
                      NIN
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={11}
                      value={nin}
                      onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all font-mono font-bold tracking-wider"
                      placeholder="11-digit number"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-4 mt-8 flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="uppercase tracking-[0.1em] font-black">Create Account</span>
                    <ShieldCheck size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD: REQUEST RESET CODE */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-xs text-[#e1e3e4]/60">Enter your registered email address. We will verify your account and email you a 4-digit password reset OTP code.</p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Registered Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-[#e1e3e4]/30" />
                  </div>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !resetEmail}
                className="w-full btn-primary py-4 mt-6 flex justify-center items-center gap-3 disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="uppercase tracking-[0.1em] font-black">Request Reset Code</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* VERIFY RESET CODE OTP */}
          {mode === 'verify_otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-xs text-[#e1e3e4]/60">Enter the verification OTP code sent to your email <strong className="text-white">{resetEmail}</strong>.</p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">4-Digit OTP Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-[#e1e3e4]/30" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-lg text-white font-mono font-bold text-center tracking-[1em] focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all"
                    placeholder="0000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 4}
                className="w-full btn-primary py-4 mt-6 flex justify-center items-center gap-3 disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="uppercase tracking-[0.1em] font-black">Verify Code</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* CONFIRM NEW PASSWORD */}
          {mode === 'reset_password' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-[#e1e3e4]/30" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20 tracking-wider"
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
                disabled={isLoading || !newPassword}
                className="w-full btn-primary py-4 mt-6 flex justify-center items-center gap-3 disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="uppercase tracking-[0.1em] font-black">Update Password</span>
                    <ShieldCheck size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-xs text-[#e1e3e4]/50">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="ml-2 text-[#66df75] font-bold hover:underline"
              >
                {mode === 'login' ? 'Register Now' : 'Login Here'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer Options */}
        {mode === 'login' && (
          <div className="mt-6 flex justify-center gap-8">
            <button
              onClick={() => setMode('forgot')}
              className="text-[10px] font-black text-[#e1e3e4]/30 hover:text-[#66df75] uppercase tracking-widest transition-colors"
            >
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
