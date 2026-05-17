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
  XCircle,
  Lock,
  ArrowUpRight,
  Fingerprint
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState('MTN');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const livePricing: Record<string, { size: string, plan: string, price: number, validity: string }[]> = {
    MTN: [
      { size: '1GB', plan: 'SME', price: 255, validity: '30 Days' },
      { size: '2GB', plan: 'SME', price: 510, validity: '30 Days' },
      { size: '5GB', plan: 'SME', price: 1275, validity: '30 Days' },
    ],
    Airtel: [
      { size: '1GB', plan: 'CG', price: 265, validity: '30 Days' },
      { size: '2GB', plan: 'CG', price: 530, validity: '30 Days' },
    ]
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans selection:bg-[#66df75] selection:text-[#111415] overflow-x-hidden mesh-gradient">
      
      {/* Decorative Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#66df75]/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#66df75]/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#111415]/80 backdrop-blur-2xl border-b border-white/5 py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#66df75] to-[#4ade80] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(102,223,117,0.3)]">
              <ShieldCheck size={24} className="text-[#111415]" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">SaukiGlobal</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={onSignIn} className="text-sm font-bold text-[#e1e3e4]/60 hover:text-[#66df75] transition-colors uppercase tracking-widest">Sign In</button>
            <button onClick={onGetStarted} className="btn-primary px-8 py-3.5 text-sm uppercase tracking-widest font-black">Get Started</button>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-white">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 bg-[#111415] transition-all duration-500 md:hidden ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
          <button onClick={onSignIn} className="text-2xl font-black text-white tracking-tighter">Sign In</button>
          <button onClick={onGetStarted} className="w-full btn-primary py-5 text-lg uppercase tracking-widest font-black">Create Free Account</button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-48 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl glass-panel border-white/5 text-[#66df75] font-black text-[10px] uppercase tracking-[0.3em] mb-8 animate-in fade-in slide-in-from-bottom-4">
              <Zap size={14} className="animate-pulse" />
              Global Connectivity Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.95] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              One Platform. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#66df75] to-[#4ade80]">Infinite Possibilities.</span>
            </h1>

            <p className="text-lg md:text-xl text-[#e1e3e4]/60 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Access local utilities and international connectivity tools from a single, unified dashboard. Global top-up, eSIM, and international data powered by Alpha, Kirani, and Smile.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <button onClick={onGetStarted} className="w-full sm:w-auto btn-primary px-10 py-5 text-sm uppercase tracking-widest font-black flex items-center justify-center gap-3">
                Access Portal <ArrowRight size={20} />
              </button>
              <div className="flex items-center gap-3 px-6 py-4 glass-panel border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                <DownloadCloud size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">App Store</span>
              </div>
            </div>
          </div>

          {/* Feature Card / Graphic */}
          <div className="relative group animate-in zoom-in-95 duration-1000">
            <div className="absolute inset-0 bg-[#66df75]/20 rounded-[3rem] blur-3xl group-hover:bg-[#66df75]/30 transition-all duration-700"></div>
            <div className="glass-panel p-8 relative border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#66df75]/10 flex items-center justify-center text-[#66df75]">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Rates</h3>
                    <p className="text-[9px] text-[#e1e3e4]/40 font-bold uppercase tracking-widest">Refreshed Instantly</p>
                  </div>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl">
                  {['MTN', 'Airtel'].map(net => (
                    <button 
                      key={net} 
                      onClick={() => setActiveNetwork(net)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeNetwork === net ? 'bg-[#66df75] text-[#111415]' : 'text-[#e1e3e4]/40'}`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {livePricing[activeNetwork].map((p, i) => (
                  <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#111415] flex items-center justify-center text-xs font-black text-white border border-white/10">
                        {p.size}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{activeNetwork} {p.size}</p>
                        <p className="text-[9px] font-bold text-[#e1e3e4]/40 uppercase tracking-widest">{p.plan} • {p.validity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-[#66df75]">₦{p.price}</p>
                      <p className="text-[8px] font-bold text-[#66df75]/40 uppercase">Wholesale</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#111415] bg-white/10 flex items-center justify-center text-[10px] font-black text-[#66df75]">
                      U{i}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-[#111415] bg-[#66df75] flex items-center justify-center text-[10px] font-black text-[#111415]">
                    +10k
                  </div>
                </div>
                <p className="text-[10px] font-black text-[#e1e3e4]/40 uppercase tracking-widest">Trusted Nationwide</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <div className="py-12 border-y border-white/5 glass-panel relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <h4 className="text-2xl font-black text-white mb-1">99.9%</h4>
            <p className="text-[10px] font-black text-[#66df75] uppercase tracking-widest">Uptime Record</p>
          </div>
          <div className="text-center">
            <h4 className="text-2xl font-black text-white mb-1">Instant</h4>
            <p className="text-[10px] font-black text-[#66df75] uppercase tracking-widest">Auto-Delivery</p>
          </div>
          <div className="text-center">
            <h4 className="text-2xl font-black text-white mb-1">₦0.00</h4>
            <p className="text-[10px] font-black text-[#66df75] uppercase tracking-widest">Funding Fee</p>
          </div>
          <div className="text-center">
            <h4 className="text-2xl font-black text-white mb-1">24/7</h4>
            <p className="text-[10px] font-black text-[#66df75] uppercase tracking-widest">Expert Support</p>
          </div>
        </div>
      </div>

      {/* Services */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter underline decoration-[#66df75]/30 underline-offset-8">Core Ecosystem</h2>
            <p className="text-[#e1e3e4]/40 font-bold uppercase tracking-widest text-sm">Everything you need in one secure portal</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Smartphone, title: 'Airtime & Data', desc: 'Instant top-up and internet bundles for all local networks.' },
              { icon: Server, title: 'Global Connectivity', desc: 'International data powered by Alpha, Kirani, and Smile.' },
              { icon: Fingerprint, title: 'Identity & CAC', desc: 'Manage identity services (NIN, BVN, CAC) seamlessly.' },
              { icon: Lightbulb, title: 'Utility Bills', desc: 'Pay Nigerian electricity bills and renew cable TV subscriptions remotely.' },
              { icon: Smartphone, title: 'eSIM Technology', desc: 'Go borderless. Instant eSIM purchase & activation in 150+ countries.' },
              { icon: RefreshCcw, title: 'Airtime to Cash', desc: 'Convert your excess airtime back to wallet funds easily.' },
            ].map((s, i) => (
              <div key={i} className="glass-panel p-10 hover:bg-white/5 transition-all group border-white/5">
                <div className="w-16 h-16 rounded-2xl bg-[#66df75]/10 flex items-center justify-center text-[#66df75] mb-8 group-hover:scale-110 transition-transform">
                  <s.icon size={32} />
                </div>
                <h3 className="text-xl font-black text-white mb-4 tracking-tighter">{s.title}</h3>
                <p className="text-[#e1e3e4]/40 text-sm leading-relaxed font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#66df75] rounded-lg flex items-center justify-center text-[#111415]">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xl font-black text-white tracking-tighter">SaukiGlobal</span>
            </div>
            <p className="text-[10px] font-black text-[#e1e3e4]/20 uppercase tracking-[0.3em]">© {new Date().getFullYear()} Sauki Automation Systems</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {['Services', 'Pricing', 'Terms', 'Privacy', 'Support'].map(link => (
              <button key={link} className="text-[10px] font-black text-[#e1e3e4]/40 hover:text-[#66df75] uppercase tracking-widest transition-colors">{link}</button>
            ))}
          </div>

          <button onClick={onGetStarted} className="btn-primary px-8 py-4 text-[10px] uppercase tracking-widest font-black">Get Started</button>
        </div>
      </footer>

    </div>
  );
}

