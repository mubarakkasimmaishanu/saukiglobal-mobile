import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  GraduationCap, 
  Lightbulb, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  Menu,
  X,
  Star,
  ArrowRight,
  TrendingUp,
  DownloadCloud,
  Server,
  RefreshCcw,
  CheckCircle
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState('MTN');

  // Handle scroll for nav shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mock Live Pricing Data
  const livePricing: Record<string, { size: string, plan: string, price: number, validity: string }[]> = {
    MTN: [
      { size: '1GB', plan: 'Corporate Gifting', price: 255, validity: '30 Days' },
      { size: '2GB', plan: 'Corporate Gifting', price: 510, validity: '30 Days' },
      { size: '5GB', plan: 'Corporate Gifting', price: 1275, validity: '30 Days' },
      { size: '10GB', plan: 'Corporate Gifting', price: 2550, validity: '30 Days' },
    ],
    Airtel: [
      { size: '1GB', plan: 'Corporate Gifting', price: 265, validity: '30 Days' },
      { size: '2GB', plan: 'Corporate Gifting', price: 530, validity: '30 Days' },
      { size: '5GB', plan: 'Corporate Gifting', price: 1325, validity: '30 Days' },
    ]
  };

  const services = [
    { icon: Smartphone, title: 'Data & Airtime', desc: 'Instant VTU top-ups with up to 4% discount on airtime and the cheapest data rates.', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { icon: GraduationCap, title: 'Education Pins', desc: 'Generate JAMB E-Pins and WAEC/NECO Result Checkers automatically.', color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: Lightbulb, title: 'Utility Bills', desc: 'Pay KEDCO, AEDC, and renew DSTV/GOTV with zero hidden charges.', color: 'text-orange-600', bg: 'bg-orange-100' },
    { icon: ShieldCheck, title: 'Identity Printing', desc: 'Print premium NIN slips and BVN documents securely in minutes.', color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
      
      {/* Navigation Bar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-200/50' : 'bg-transparent pt-2'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Zap size={22} className="text-white fill-white" />
              </div>
              <span className="font-black text-2xl tracking-tight text-slate-900">
                BuyDigital
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#pricing" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">Pricing</a>
              <a href="#services" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">Services</a>
              <a href="#reseller" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">Agents</a>
              <div className="flex items-center gap-3 ml-2">
                <button 
                  onClick={onSignIn}
                  className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors px-4 py-2"
                >
                  Sign In
                </button>
                <button 
                  onClick={onGetStarted}
                  className="text-sm font-bold bg-emerald-600 text-white px-6 py-3 rounded-full hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-900 p-2 focus:outline-none transition-colors"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div className={`md:hidden absolute w-full bg-white border-t border-slate-100 shadow-2xl transition-all duration-300 origin-top ${isMobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`}>
          <div className="px-4 pt-4 pb-8 space-y-2">
            <a href="#pricing" className="block px-4 py-3 text-base font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl">Pricing</a>
            <a href="#services" className="block px-4 py-3 text-base font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl">Services</a>
            <a href="#reseller" className="block px-4 py-3 text-base font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl">Become an Agent</a>
            <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col gap-3">
              <button onClick={onSignIn} className="w-full text-center text-base font-bold text-slate-700 bg-slate-100 px-4 py-4 rounded-xl hover:bg-slate-200">Log In</button>
              <button onClick={onGetStarted} className="w-full text-center text-base font-bold bg-emerald-600 text-white px-4 py-4 rounded-xl shadow-lg shadow-emerald-200">Create Free Account</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-widest mb-6">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                Automated & Instant Delivery
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                The Cheapest <br className="hidden md:block"/>
                <span className="text-emerald-600">Data & VTU</span> Platform in Nigeria.
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Stop overpaying for data. Buy MTN 1GB for as low as ₦255. Pay bills, buy JAMB pins, and earn massive commissions as an agent.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <button 
                  onClick={onGetStarted}
                  className="w-full sm:w-auto bg-emerald-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:bg-emerald-700 transition-all transform hover:-translate-y-1 flex justify-center items-center gap-2"
                >
                  Get Started Free <ArrowRight size={20} />
                </button>
                <div className="flex items-center gap-4">
                  {/* Fake App Store Buttons */}
                  <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors">
                    <DownloadCloud size={24} />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-wider text-slate-300">Get it on</p>
                      <p className="font-bold text-sm leading-tight">Google Play</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Graphic (Live Pricing Widget) */}
            <div className="flex-1 w-full max-w-md lg:ml-auto">
              <div className="bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 relative">
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg transform rotate-3">
                  Hot Deals 🔥
                </div>
                
                <h3 className="font-black text-xl text-slate-900 mb-4">Live Data Prices</h3>
                
                <div className="flex gap-2 mb-6 bg-slate-50 p-1 rounded-xl">
                  {['MTN', 'Airtel'].map(net => (
                    <button 
                      key={net}
                      onClick={() => setActiveNetwork(net)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeNetwork === net ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                    >
                      {net}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {livePricing[activeNetwork].map((plan, i) => (
                    <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${activeNetwork === 'MTN' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {plan.size}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{activeNetwork} {plan.size}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plan.plan} • {plan.validity}</p>
                        </div>
                      </div>
                      <p className="font-black text-lg text-emerald-600">₦{plan.price}</p>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-6 bg-slate-50 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors text-sm flex items-center justify-center gap-2">
                  View All Networks <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Ribbon */}
      <div className="bg-white border-y border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x divide-slate-100">
            <div className="flex flex-col items-center justify-center">
              <Server className="text-emerald-500 mb-2" size={24} />
              <p className="text-sm font-bold text-slate-800">99.9% Uptime</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Automated Servers</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <ShieldCheck className="text-emerald-500 mb-2" size={24} />
              <p className="text-sm font-bold text-slate-800">CAC Registered</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Verified Business</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <RefreshCcw className="text-emerald-500 mb-2" size={24} />
              <p className="text-sm font-bold text-slate-800">Instant Funding</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Zero Delays</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Star className="text-yellow-400 mb-2" size={24} fill="currentColor" />
              <p className="text-sm font-bold text-slate-800">10k+ Agents</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Trusted Nationwide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid Section */}
      <section id="services" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">One Wallet. Everything You Need.</h2>
            <p className="text-lg text-slate-600">Why download 5 different apps when BuyDigital does it all at wholesale prices?</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-[2rem] p-8 border border-slate-100 hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${service.bg} ${service.color} transform group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon size={28} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{service.title}</h3>
                <p className="text-slate-500 leading-relaxed mb-6 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reseller Feature Section */}
      <section id="reseller" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden shadow-2xl">
            
            {/* Background Texture */}
            <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="lg:w-1/2 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-8">
                For Cyber Cafes & Vendors
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                Upgrade to Reseller & <span className="text-emerald-400">Maximize Profit.</span>
              </h2>
              <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                Don't just buy data—sell it. Upgrade your account to Reseller Status and unlock the absolute lowest wholesale prices in Nigeria. Keep 100% of the retail margin.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {[
                  'MTN 1GB @ ₦255', 
                  'Airtime @ 4% Discount', 
                  'JAMB Pins @ ₦7,200', 
                  'Wallet to Wallet Transfers'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                      <CheckCircle size={14} strokeWidth={3} />
                    </div>
                    <span className="font-bold text-slate-200 text-sm leading-tight">{item}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={onGetStarted}
                className="bg-emerald-500 text-white font-bold px-8 py-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all duration-300 w-full sm:w-auto"
              >
                Join Reseller Program Today
              </button>
            </div>
            
            <div className="lg:w-1/2 w-full relative z-10">
              {/* Earnings Mockup */}
              <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Today's Commission</p>
                    <h4 className="text-4xl font-black text-white">₦ 8,450.00</h4>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp size={24} className="text-emerald-400" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { title: 'Referral Bonus', desc: 'From Musa Ali', price: '+₦500', icon: '👤' },
                    { title: 'Data Sales Margin', desc: '10 Transactions', price: '+₦450', icon: '📶' },
                    { title: 'JAMB Pin Margin', desc: '1 Pin Sold', price: '+₦300', icon: '🎓' }
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-800/50 p-4 rounded-2xl flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{item.icon}</div>
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                        </div>
                      </div>
                      <p className="font-black text-emerald-400">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <span className="font-black text-xl text-slate-900">BuyDigital.ng</span>
          </div>
          
          <div className="flex gap-6 text-sm font-bold text-slate-600">
            <button onClick={onSignIn} className="hover:text-emerald-600">Login</button>
            <button onClick={onGetStarted} className="hover:text-emerald-600">Register</button>
            <a href="#" className="hover:text-emerald-600">WhatsApp Support</a>
          </div>
          
          <p className="text-sm font-medium text-slate-400">&copy; {new Date().getFullYear()} BuyDigital. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
