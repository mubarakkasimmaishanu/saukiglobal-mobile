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
  CheckCircle,
  XCircle
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
    { icon: GraduationCap, title: 'Education Pins', desc: 'Generate JAMB E-Pins and WAEC/NECO Result Checkers automatically.', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { icon: Lightbulb, title: 'Utility Bills', desc: 'Pay KEDCO, AEDC, and renew DSTV/GOTV with zero hidden charges.', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { icon: ShieldCheck, title: 'Identity Printing', desc: 'Print premium NIN slips and BVN documents securely in minutes.', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">

      {/* Navigation Bar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-200/50' : 'bg-transparent pt-2'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 text-left">
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
          <div className="px-4 pt-4 pb-8 space-y-2 text-left">
            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl">Pricing</a>
            <a href="#services" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl">Services</a>
            <a href="#reseller" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl">Become an Agent</a>
            <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col gap-3">
              <button onClick={onSignIn} className="w-full text-center text-base font-bold text-slate-700 bg-slate-100 px-4 py-4 rounded-xl hover:bg-slate-200">Log In</button>
              <button onClick={onGetStarted} className="w-full text-center text-base font-bold bg-emerald-600 text-white px-4 py-4 rounded-xl shadow-lg shadow-emerald-200">Create Free Account</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden text-left">
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
                The Cheapest <br className="hidden md:block" />
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
                  <div
                    onClick={() => alert('BuyDigital app coming soon to Google Play! Create an account on our website for now.')}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors relative"
                  >
                    <DownloadCloud size={24} />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-wider text-slate-300">Coming Soon</p>
                      <p className="font-bold text-sm leading-tight">Google Play</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Graphic (Live Pricing Widget) */}
            <div className="flex-1 w-full max-w-md lg:ml-auto">
              <div className="bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 relative text-left">
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg transform rotate-3">
                  Hot Deals 🔥
                </div>

                <h3 className="font-black text-xl text-slate-900 mb-4">Live Data Prices</h3>

                <div className="flex gap-2 mb-6 bg-slate-50 p-1 rounded-xl">
                  {['MTN', 'Airtel'].map(net => (
                    <button
                      key={net}
                      onClick={() => setActiveNetwork(net)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeNetwork === net ? 'bg-white shadow-sm text-slate-900' : 'text-slate-50'}`}
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

                <button
                  onClick={onGetStarted}
                  className="w-full mt-6 bg-slate-50 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  View All Networks <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Ribbon */}
      <div className="bg-white border-y border-slate-200 py-6 text-center">
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
          <div className="text-center max-w-2xl mx-auto mb-16 underline-offset-auto">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">One Wallet. Everything You Need.</h2>
            <p className="text-lg text-slate-600">Why download 5 different apps when BuyDigital does it all at wholesale prices?</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
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

      {/* Pricing Tiers Section */}
      <section id="pricing" className="py-24 bg-white text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-widest mb-4">
              Pricing Plans
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Choose Your Tier.</h2>
            <p className="text-lg text-slate-600">Whether you buy for yourself or sell to others, we have the perfect plan.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">

            {/* Basic Tier Card */}
            <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-200 relative group hover:border-slate-300 transition-all shadow-sm">
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">For Personal Use</p>
                <h3 className="text-3xl font-black text-slate-900 mb-1">Basic</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-black text-slate-900">Free</span>
                </div>
                <p className="text-sm text-slate-500">All essential services at standard retail prices. No commitment required.</p>
              </div>

              <button
                onClick={onGetStarted}
                className="w-full bg-slate-100 text-slate-800 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors mb-8 border border-slate-200"
              >
                Get Started — Free
              </button>

              <div className="space-y-3">
                {[
                  'Buy Data & Airtime',
                  'Pay Electricity & Cable Bills',
                  'JAMB & Exam Pins',
                  'NIN Slip Printing',
                  'Fund Wallet & Transfer',
                  'Standard Retail Prices',
                  '₦100 Referral Bonus',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-slate-600 font-medium">{f}</span>
                  </div>
                ))}

                {[
                  'Wholesale Prices',
                  'Commission Dashboard',
                  'Profit Tracking',
                  'Priority Support',
                  'API Access',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 opacity-40">
                    <XCircle size={16} className="text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-400 font-medium line-through">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reseller Tier Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white relative group shadow-2xl shadow-slate-400/20 border-2 border-emerald-500/30">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                <Star size={12} fill="white" /> Best Value
              </div>

              <div className="mb-6 pt-2">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">For Vendors & Agents</p>
                <h3 className="text-3xl font-black text-white mb-1">Reseller Pro</h3>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-black text-white">₦2,000</span>
                  <span className="text-slate-400 text-sm font-bold mb-1">one-time</span>
                </div>
                <p className="text-sm text-slate-400">Wholesale prices, commission tracking, and the lowest rates in Nigeria. Forever.</p>
              </div>

              <button
                onClick={onGetStarted}
                className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 mb-8"
              >
                Upgrade to Reseller
              </button>

              <div className="space-y-3">
                {[
                  'Everything in Basic',
                  'Cheapest Wholesale Prices',
                  'Airtime at 4% Discount',
                  'Commission Dashboard',
                  'Per-Transaction Profit Tracking',
                  '₦500 Referral Bonus',
                  'Priority WhatsApp Support',
                  'API Access (Coming Soon)',
                  'Custom Pricing Tiers',
                  'Bulk Transaction Export',
                  'Lifetime Access — No Monthly Fee',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-slate-200 font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Price Table */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-center text-sm font-black text-slate-500 uppercase tracking-widest mb-6">See the Price Difference</h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Table Header */}
              <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span>Service</span>
                <span className="text-center">Basic</span>
                <span className="text-center text-emerald-600">Reseller</span>
                <span className="text-center text-amber-600">You Save</span>
              </div>
              {[
                { s: 'MTN 1GB Data', b: '₦300', r: '₦255', v: '₦45' },
                { s: 'MTN 2GB Data', b: '₦600', r: '₦510', v: '₦90' },
                { s: 'MTN 5GB Data', b: '₦1,500', r: '₦1,275', v: '₦225' },
                { s: 'Airtel 1GB Data', b: '₦300', r: '₦265', v: '₦35' },
                { s: '₦1,000 Airtime', b: '₦1,000', r: '₦960', v: '₦40' },
                { s: 'WAEC Checker', b: '₦3,800', r: '₦3,500', v: '₦300' },
                { s: 'JAMB E-PIN', b: '₦7,500', r: '₦7,200', v: '₦300' },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-4 p-4 text-sm items-center ${i < 6 ? 'border-b border-slate-100' : ''} hover:bg-slate-50 transition-colors`}>
                  <span className="font-bold text-slate-800">{row.s}</span>
                  <span className="text-center text-slate-400 line-through">{row.b}</span>
                  <span className="text-center font-black text-emerald-600">{row.r}</span>
                  <span className="text-center font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-lg text-xs mx-auto">{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CEO Message Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-slate-100">
            <div className="md:w-1/3 flex flex-col items-center">
              <div className="w-48 h-48 bg-emerald-100 rounded-full flex items-center justify-center mb-6 overflow-hidden border-4 border-white shadow-lg">
                <img
                  src="/images/mubarak.jpg"
                  alt="Mubarak Kasim Maishanu - CEO & Founder of BuyDigital"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-black text-slate-900">Mubarak Kasim Maishanu</h4>
                <p className="text-emerald-600 font-bold text-sm tracking-widest uppercase mt-1">CEO & Founder</p>
              </div>
            </div>

            <div className="md:w-2/3 relative">
              <div className="absolute -top-10 -left-6 text-slate-100 select-none">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L14.017 2C14.017 0.895431 14.9124 0 16.017 0H21.017C22.1216 0 23.017 0.895431 23.017 2V15C23.017 18.3137 20.3307 21 17.017 21H14.017ZM0.0170044 21L0.0170044 18C0.0170044 16.8954 0.912435 16 2.017 16H5.017C5.56929 16 6.017 15.5523 6.017 15V9C6.017 8.44772 5.56929 8 5.017 8H2.017C0.912435 8 0.0170044 7.10457 0.0170044 6V3L0.0170044 2C0.0170044 0.895431 0.912435 0 2.017 0H7.017C8.12157 0 9.017 0.895431 9.017 2V15C9.017 18.3137 6.33071 21 3.017 21H0.0170044Z"></path></svg>
              </div>
              <p className="text-xl md:text-2xl text-slate-700 italic leading-relaxed relative z-10 mb-8 font-medium">
                "Our mission at BuyDigital is simple: to make digital utilities accessible and affordable for every Nigerian. We started this journey because we saw the need for a truly automated, reliable, and honest platform. Today, we're proud to serve thousands of agents who build their businesses on our technology. We don't just sell data; we empower entrepreneurs."
              </p>
              <div className="flex gap-4">
                <div className="h-1 w-20 bg-emerald-600 rounded-full"></div>
                <div className="h-1 w-10 bg-slate-200 rounded-full"></div>
                <div className="h-1 w-5 bg-slate-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <span className="font-black text-xl text-slate-900">BuyDigital.ng</span>
          </div>

          <div className="flex gap-6 text-sm font-bold text-slate-600">
            <button onClick={onSignIn} className="hover:text-emerald-600 transition-colors">Login</button>
            <button onClick={onGetStarted} className="hover:text-emerald-600 transition-colors">Register</button>
            <a href="https://wa.me/2349068500544" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors">WhatsApp Support</a>
          </div>

          <p className="text-sm font-medium text-slate-400">&copy; {new Date().getFullYear()} BuyDigital. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
