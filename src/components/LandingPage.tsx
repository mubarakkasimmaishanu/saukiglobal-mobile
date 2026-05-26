import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
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
            
            {/* Custom SVG logo mimicking "SK" Connection brand in reference */}
            <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-[0_0_12px_rgba(102,223,117,0.5)]">
              {/* Green orbital swoosh at the bottom */}
              <path 
                d="M18,65 C25,75 55,82 82,62 C68,75 40,78 26,71 Z" 
                fill="#66df75" 
                opacity="0.9" 
              />
              <path 
                d="M15,62 C35,76 72,72 85,55 C65,70 32,68 18,59 Z" 
                fill="#4ade80" 
                opacity="0.7" 
              />

              {/* Stylized White "S" */}
              <path 
                d="M24,42 C24,35 32,32 38,32 C48,32 50,38 43,45 L32,54 C24,62 34,70 44,70 C52,70 54,65 54,61 L46,61 C46,63 44,65 41,65 C34,65 32,61 38,55 L48,46 C56,38 52,27 38,27 C28,27 16,33 16,42 Z" 
                fill="#ffffff" 
              />

              {/* Stylized Emerald "K" */}
              <path 
                d="M58,26 L58,72 L65,72 L65,51 L77,72 L86,72 L72,47 L84,26 L75,26 L65,43 L65,26 Z" 
                fill="#66df75" 
              />
            </svg>
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
      </div>

      {/* 5. Dynamic Curved Glowing Waves at very bottom */}
      <div className="absolute bottom-[-150px] left-1/2 -translate-x-1/2 w-[180%] h-[300px] border-t-[3px] border-[#66df75]/40 rounded-[50%] blur-[2px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-165px] left-1/2 -translate-x-1/2 w-[180%] h-[300px] border-t border-[#4ade80]/20 rounded-[50%] blur-[4px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-180px] left-1/2 -translate-x-1/2 w-[180%] h-[300px] border-t border-[#66df75]/10 rounded-[50%] blur-[6px] pointer-events-none z-0"></div>

    </div>
  );
}
