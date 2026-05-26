import React, { useState } from 'react';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

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
        setInfoMessage(res.message || 'OTP code sent to email.');
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
        setInfoMessage('OTP verified. Enter a new password.');
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
        alert('Password reset successful. Please log in.');
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
          setError('BVN is required.');
          return;
        }
        if (!/^\d{11}$/.test(bvn)) {
          setError('BVN must be exactly 11 digits.');
          return;
        }
      }
      if (kycType === 'nin' || kycType === 'both') {
        if (!nin) {
          setError('NIN is required.');
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
          '', // No referral code on simple form
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
    <div className="min-h-screen bg-[#080d09] text-[#e1e3e4] font-sans flex flex-col justify-center py-12 px-6 relative overflow-hidden">
      
      {/* Emerald core background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-[radial-gradient(circle,rgba(102,223,117,0.06)_0%,transparent_60%)] pointer-events-none z-0"></div>

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
        className="absolute top-8 left-8 flex items-center gap-2 text-[#e1e3e4]/40 hover:text-[#66df75] font-black transition-all group z-10"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs uppercase tracking-widest">Back</span>
      </button>

      {/* Clean Header */}
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
        <h2 className="text-3xl font-black text-white tracking-tighter">
          {mode === 'login' && 'Sign In'}
          {mode === 'signup' && 'Create Account'}
          {mode === 'forgot' && 'Reset Password'}
          {mode === 'verify_otp' && 'Verify OTP'}
          {mode === 'reset_password' && 'New Password'}
        </h2>
      </div>

      <div className="max-w-md mx-auto w-full animate-in zoom-in-95 duration-500 relative z-10">
        <div className="bg-[#0b120c]/60 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl relative">
          
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
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20 tracking-wider"
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
                  <span className="uppercase tracking-[0.1em] font-black">Sign In</span>
                )}
              </button>
            </form>
          )}

          {/* SIGNUP MODULE */}
          {mode === 'signup' && (
            <form onSubmit={handleSubmit} className="space-y-5 max-h-[62vh] overflow-y-auto pr-2 scrollbar-thin">
              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  maxLength={15}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                  placeholder="08012345678"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
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

              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
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

              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Transaction PIN</label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    required
                    maxLength={4}
                    value={transactionPin}
                    onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-4 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20 font-mono tracking-wider"
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

              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Confirm Transaction PIN</label>
                <div className="relative">
                  <input
                    type={showConfirmPin ? "text" : "password"}
                    required
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-4 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20 font-mono tracking-wider"
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

              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Virtual Account KYC Option</label>
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
                  className="w-full px-4 pr-10 py-4 bg-[#080d09] border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all cursor-pointer"
                >
                  <option value="none">None (Optional)</option>
                  <option value="nin">NIN Only</option>
                  <option value="bvn">BVN Only</option>
                  <option value="both">Both NIN & BVN</option>
                </select>
              </div>

              {(kycType === 'bvn' || kycType === 'both') && (
                <div className="animate-in slide-in-from-top duration-300">
                  <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Bank Verification Number (BVN)</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={bvn}
                    onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all font-mono font-bold tracking-wider"
                    placeholder="11-digit number"
                  />
                </div>
              )}

              {(kycType === 'nin' || kycType === 'both') && (
                <div className="animate-in slide-in-from-top duration-300">
                  <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">National Identification Number (NIN)</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={nin}
                    onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all font-mono font-bold tracking-wider"
                    placeholder="11-digit number"
                  />
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
                  <span className="uppercase tracking-[0.1em] font-black">Create Account</span>
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">Registered Email</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                  placeholder="jane@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !resetEmail}
                className="w-full btn-primary py-4 mt-6 flex justify-center items-center gap-3 disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="uppercase tracking-[0.1em] font-black">Request Reset Code</span>
                )}
              </button>
            </form>
          )}

          {/* VERIFY RESET CODE OTP */}
          {mode === 'verify_otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-2">4-Digit OTP Code</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-lg text-white font-mono font-bold text-center tracking-[1em] focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all"
                  placeholder="0000"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 4}
                className="w-full btn-primary py-4 mt-6 flex justify-center items-center gap-3 disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="uppercase tracking-[0.1em] font-black">Verify Code</span>
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
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/20 tracking-wider"
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
                  <span className="uppercase tracking-[0.1em] font-black">Update Password</span>
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
