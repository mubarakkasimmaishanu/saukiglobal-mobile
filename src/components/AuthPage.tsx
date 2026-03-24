import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Phone,
  ShieldCheck,
  Gift,
  ArrowRight,
  ChevronLeft,
  KeyRound,
  CheckCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  onBack: () => void;
  onSuccess: () => void;
}

export default function AuthPage({ initialMode = 'login', onBack, onSuccess }: AuthPageProps) {
  const { refreshUser } = useUser();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password states
  const [forgotStep, setForgotStep] = useState<'none' | 'email' | 'otp' | 'newpass' | 'done'>('none');
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form States
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    referralCode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await api.login(formData.email, formData.password);
      } else {
        await api.signup(formData);
      }
      await refreshUser();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password handlers
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 1500)); // Mock API
      setForgotStep('otp');
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return;
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 1000)); // Mock API
      // Mock: accept any 6-digit code
      setForgotStep('newpass');
    } catch {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 1500)); // Mock API
      setForgotStep('done');
    } catch {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  // ---------- FORGOT PASSWORD UI ----------
  if (forgotStep !== 'none') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col justify-center py-10 px-5 md:py-12 sm:px-6 lg:px-8 relative">
        <button
          onClick={() => {
            if (forgotStep === 'email') { setForgotStep('none'); setError(null); }
            else if (forgotStep === 'otp') { setForgotStep('email'); setError(null); }
            else if (forgotStep === 'newpass') { setForgotStep('otp'); setError(null); }
            else { setForgotStep('none'); setError(null); }
          }}
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-emerald-600 font-bold transition-colors"
        >
          <ChevronLeft size={20} />
          {forgotStep === 'done' ? 'Back to Login' : 'Go Back'}
        </button>

        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-3 ${forgotStep === 'done' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-amber-500 shadow-amber-200'
            }`}>
            {forgotStep === 'done'
              ? <CheckCircle size={36} className="text-white transform -rotate-3" />
              : <KeyRound size={36} className="text-white transform -rotate-3" />
            }
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {forgotStep === 'email' && 'Reset Password'}
            {forgotStep === 'otp' && 'Verify OTP'}
            {forgotStep === 'newpass' && 'New Password'}
            {forgotStep === 'done' && 'Password Reset!'}
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {forgotStep === 'email' && 'Enter your email to receive a verification code.'}
            {forgotStep === 'otp' && `We sent a 6-digit code to ${resetEmail}`}
            {forgotStep === 'newpass' && 'Create a new secure password.'}
            {forgotStep === 'done' && 'Your password has been updated successfully.'}
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in zoom-in-95 duration-300">
          <div className="bg-white py-8 px-5 shadow-xl shadow-gray-200/50 rounded-3xl sm:px-10 border border-gray-100">

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl">
                {error}
              </div>
            )}

            {/* Step 1: Email */}
            {forgotStep === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      placeholder="Enter your registered email"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isLoading ? 'Sending...' : <><>Send OTP</> <ArrowRight size={18} /></>}
                </button>
              </form>
            )}

            {/* Step 2: OTP */}
            {forgotStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-3 text-center">Enter 6-digit code</label>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !digit && i > 0) {
                            document.getElementById(`otp-${i - 1}`)?.focus();
                          }
                        }}
                        className="w-12 h-14 text-center text-xl font-black bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isLoading ? 'Verifying...' : <><>Verify Code</> <ArrowRight size={18} /></>}
                </button>
                <button
                  type="button"
                  onClick={() => { setOtp(['', '', '', '', '', '']); handleSendOtp(new Event('submit') as any); }}
                  className="w-full text-sm font-bold text-gray-500 hover:text-emerald-600 py-2"
                >
                  Didn't receive code? Resend
                </button>
              </form>
            )}

            {/* Step 3: New Password */}
            {forgotStep === 'newpass' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      placeholder="Create new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isLoading ? 'Resetting...' : <><>Reset Password</> <ArrowRight size={18} /></>}
                </button>
              </form>
            )}

            {/* Step 4: Done */}
            {forgotStep === 'done' && (
              <div className="text-center space-y-5">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={40} className="text-emerald-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Your password has been successfully reset. You can now sign in with your new password.</p>
                <button
                  onClick={() => { setForgotStep('none'); setError(null); }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                >
                  Back to Sign In <ArrowRight size={18} />
                </button>
              </div>
            )}

            <div className="mt-6 border-t border-gray-100 pt-4">
              <div className="flex justify-center items-center gap-2 opacity-60">
                <ShieldCheck size={16} className="text-gray-500" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Secured 256-Bit Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col justify-center py-10 px-5 md:py-12 sm:px-6 lg:px-8 relative">

      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-emerald-600 font-bold transition-colors"
      >
        <ChevronLeft size={20} />
        Back to Home
      </button>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200 transform rotate-3">
          <ShieldCheck size={36} className="text-white transform -rotate-3" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">BuyDigital.ng</h2>
        <p className="text-sm text-gray-500 mt-2 font-medium">Your automated digital utility hub.</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in zoom-in-95 duration-300">
        <div className="bg-white py-8 px-5 shadow-xl shadow-gray-200/50 rounded-3xl sm:px-10 border border-gray-100">

          {/* Toggle Switches */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-in shake duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Registration Only Fields */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <UserIcon size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      required={!isLogin}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      placeholder="Musa"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required={!isLogin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    placeholder="Ibrahim"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="animate-in fade-in duration-300">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required={!isLogin}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    placeholder="0801 234 5678"
                  />
                </div>
              </div>
            )}

            {/* Email Field (Used in both) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field (Used in both) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-gray-700">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => { setForgotStep('email'); setError(null); }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-500"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Referral Code (Optional - Registration Only) */}
            {!isLogin && (
              <div className="animate-in fade-in duration-300">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Referral Code (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Gift size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="referralCode"
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all uppercase placeholder:normal-case"
                    placeholder="Enter code if invited"
                  />
                </div>
              </div>
            )}

            {/* Terms Checkbox (Registration Only) */}
            {!isLogin && (
              <div className="flex items-start mt-2 animate-in fade-in duration-300">
                <div className="flex h-5 items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
                <div className="ml-2 text-xs">
                  <label htmlFor="terms" className="text-gray-500 font-medium">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => alert('Terms of Service\n\nBy using BuyDigital, you agree to:\n\n1. Use the platform for lawful purposes only.\n2. Provide accurate personal information.\n3. Not engage in fraudulent transactions.\n4. Accept that service prices may change without notice.\n5. Accept that completed transactions are non-reversible.\n\nFor full terms, contact support@buydigital.ng')}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Terms of Service
                    </button>{' '}and{' '}
                    <button
                      type="button"
                      onClick={() => alert('Privacy Policy\n\nBuyDigital respects your privacy:\n\n1. We collect only necessary personal data (name, email, phone).\n2. Your data is encrypted and stored securely.\n3. We never sell your information to third parties.\n4. Transaction data is kept for regulatory compliance.\n5. You can request data deletion by contacting support.\n\nFor full policy, contact support@buydigital.ng')}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Privacy Policy
                    </button>.
                  </label>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all disabled:opacity-70"
              >
                {isLoading ? (
                  <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</>
                ) : (
                  <>
                    {isLogin ? 'Secure Sign In' : 'Create Free Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Social Proof / Security Footer */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex justify-center items-center gap-2 opacity-60">
              <ShieldCheck size={16} className="text-gray-500" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Secured 256-Bit Encryption</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
