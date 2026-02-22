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
  ChevronLeft
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col justify-center py-10 px-5 md:py-12 sm:px-6 lg:px-8 relative">
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-green-600 font-bold transition-colors"
      >
        <ChevronLeft size={20} />
        Back to Home
      </button>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200 transform rotate-3">
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
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                isLogin ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                !isLogin ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
                      className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
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
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
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
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                  placeholder="you@example.com" 
                />
              </div>
            </div>

            {/* Password Field (Used in both) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-gray-700">Password</label>
                {isLogin && (
                  <a href="#" className="text-xs font-bold text-green-600 hover:text-green-500">
                    Forgot password?
                  </a>
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
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
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
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all uppercase placeholder:normal-case"
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
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" 
                  />
                </div>
                <div className="ml-2 text-xs">
                  <label htmlFor="terms" className="text-gray-500 font-medium">
                    I agree to the <a href="#" className="text-green-600 font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-green-600 font-bold hover:underline">Privacy Policy</a>.
                  </label>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all disabled:opacity-70"
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
