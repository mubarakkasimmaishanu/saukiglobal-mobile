import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onPrivacy?: () => void;
  onTerms?: () => void;
}

export default function LandingPage({ onGetStarted, onSignIn, onPrivacy, onTerms }: LandingPageProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#080d09] text-[#e1e3e4] font-sans flex flex-col justify-between py-16 px-6 relative overflow-hidden">
      
      {/* 1. Emerald radial core background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-[radial-gradient(circle,rgba(102,223,117,0.08)_0%,transparent_60%)] pointer-events-none z-0"></div>

      {/* 2. Abstract Grid overlay in background */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(102, 223, 117, 0.08) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(102, 223, 117, 0.08) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '30px 30px',
          backgroundPosition: 'center center'
        }}
      ></div>

      {/* Top spacing */}
      <div className="h-4 z-10"></div>

      {/* 3. Center Branding & Logo */}
      <div className="flex flex-col items-center justify-center flex-grow z-10 gap-8">
        {/* SK Glowing Logo Container */}
        <div className="relative animate-in zoom-in duration-1000">
          <div className="absolute -inset-4 bg-[#66df75]/25 rounded-[2.2rem] blur-2xl opacity-60"></div>
          <div className="w-36 h-36 bg-gradient-to-br from-[#0c1b11] to-[#050a06] border-2 border-[#66df75]/60 rounded-[2rem] flex items-center justify-center relative shadow-[0_0_40px_rgba(102,223,117,0.35)]">
            
            {/* Inner green ring */}
            <div className="absolute inset-2 border border-[#66df75]/15 rounded-[1.6rem]"></div>
            
            {/* Official logo image */}
            <img src="/saukilogo.png" alt="SaukiGlobal Logo" className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(102,223,117,0.35)]" />
          </div>
        </div>

        {/* Text Area */}
        <div className="text-center space-y-4 max-w-sm px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            <span className="text-[#66df75]">Global</span> and <span className="text-[#66df75]">Local</span>
            <br />
            Connectivity
          </h1>
          <div className="flex items-center justify-center gap-2.5">
            <span className="w-6 h-[1.5px] bg-[#66df75]/30"></span>
            <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.25em]">Sauki in Every Transaction</p>
            <span className="w-6 h-[1.5px] bg-[#66df75]/30"></span>
          </div>
        </div>
      </div>

      {/* 4. Interactive Bottom Area: Spinner -> Action Buttons */}
      <div className="flex flex-col items-center justify-center min-h-[140px] z-10 relative">
        {loading ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
            {/* Spinning Green Loader */}
            <div className="w-9 h-9 border-[3.5px] border-[#66df75] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] text-[#e1e3e4]/40 font-black uppercase tracking-[0.2em] animate-pulse">Loading amazing services...</p>
          </div>
        ) : (
          <div className="w-full max-w-xs space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
            <button 
              onClick={onSignIn}
              className="w-full btn-primary py-4 font-black uppercase tracking-widest text-xs shadow-[0_4px_25px_rgba(102,223,117,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              Sign In
            </button>
            <button 
              onClick={onGetStarted}
              className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all"
            >
              Create Account
            </button>
          </div>
        )}

        {/* Legal Links */}
        {!loading && (
          <div className="flex items-center justify-center gap-3 mt-6 animate-in fade-in duration-700">
            <button
              onClick={onPrivacy}
              className="text-[9px] text-[#e1e3e4]/30 hover:text-[#66df75]/60 font-bold uppercase tracking-widest transition-colors"
            >
              Privacy Policy
            </button>
            <span className="w-1 h-1 rounded-full bg-[#e1e3e4]/15"></span>
            <button
              onClick={onTerms}
              className="text-[9px] text-[#e1e3e4]/30 hover:text-[#66df75]/60 font-bold uppercase tracking-widest transition-colors"
            >
              Terms of Service
            </button>
          </div>
        )}
      </div>

      {/* 5. Dynamic Curved Glowing Waves at very bottom */}
      <div className="absolute bottom-[-150px] left-1/2 -translate-x-1/2 w-[180%] h-[300px] border-t-[3px] border-[#66df75]/40 rounded-[50%] blur-[2px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-165px] left-1/2 -translate-x-1/2 w-[180%] h-[300px] border-t border-[#4ade80]/20 rounded-[50%] blur-[4px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-180px] left-1/2 -translate-x-1/2 w-[180%] h-[300px] border-t border-[#66df75]/10 rounded-[50%] blur-[6px] pointer-events-none z-0"></div>

    </div>
  );
}
