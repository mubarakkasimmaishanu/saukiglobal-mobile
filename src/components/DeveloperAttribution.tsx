import React, { useState } from 'react';
import { Info, Globe, MessageSquare, X, ExternalLink } from 'lucide-react';

interface DeveloperAttributionProps {
  className?: string;
  showCardBelow?: boolean;
}

export default function DeveloperAttribution({ className = '', showCardBelow = false }: DeveloperAttributionProps) {
  const [showCard, setShowCard] = useState(false);

  return (
    <div className={`flex flex-col items-center justify-center gap-1.5 text-center relative z-30 ${className}`}>
      <p className="text-[11px] text-[#e1e3e4]/50 font-medium">
        &copy; {new Date().getFullYear()} <strong className="text-white font-bold">SaukiGlobal</strong>. All rights reserved.
      </p>

      <div className="flex items-center gap-1.5 text-xs text-[#e1e3e4]/50 font-medium">
        <span>Developed by</span>
        <button
          type="button"
          onClick={() => setShowCard(!showCard)}
          className="text-[#66df75] hover:text-[#52c860] font-bold inline-flex items-center gap-1 transition-colors group focus:outline-none cursor-pointer"
        >
          <span>Mubarakdev</span>
          <Info size={13} className="text-[#66df75] opacity-80 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Interactive Developer Card Popover / Modal */}
      {showCard && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99]"
            onClick={() => setShowCard(false)}
          ></div>
          <div className={`absolute ${showCardBelow ? 'top-full mt-3' : 'bottom-full mb-3'} left-1/2 -translate-x-1/2 w-64 bg-[#181c1e] border border-[#66df75]/40 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-[100] animate-in zoom-in-95 duration-200`}>
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#66df75]/20 text-[#66df75] flex items-center justify-center font-black text-xs border border-[#66df75]/30">
                  M
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">Mubarakdev</h4>
                  <p className="text-[9px] text-[#e1e3e4]/50 font-medium">Lead Developer & Designer</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCard(false)}
                className="text-[#e1e3e4]/40 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-1.5 text-left">
              <a 
                href="https://mubarakdev.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[11px] text-[#e1e3e4]/80 hover:text-[#66df75] p-2 rounded-xl hover:bg-white/5 transition-colors font-medium group"
              >
                <Globe size={14} className="text-[#66df75]" />
                <span>Visit Portfolio</span>
                <ExternalLink size={11} className="ml-auto text-[#e1e3e4]/30 group-hover:text-[#66df75]" />
              </a>

              <a 
                href="https://wa.me/2349068500544" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[11px] text-[#e1e3e4]/80 hover:text-[#66df75] p-2 rounded-xl hover:bg-white/5 transition-colors font-medium group"
              >
                <MessageSquare size={14} className="text-[#66df75]" />
                <span>Chat on WhatsApp</span>
                <ExternalLink size={11} className="ml-auto text-[#e1e3e4]/30 group-hover:text-[#66df75]" />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
