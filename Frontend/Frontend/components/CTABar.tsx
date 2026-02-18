// components/CTABar.tsx
import React from "react";
import Link from "next/link";

export default function CTABar() {
  return (
    <div className="fixed bottom-8 right-8 hidden md:block z-50 fade-in">
      <div className="glass p-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 flex gap-2 items-center backdrop-blur-xl bg-slate-900/90">
        
        {/* Login Link: Forced slate color and no underline */}
        <Link 
          href="/login" 
          className="px-6 py-2.5 text-sm font-bold !text-slate-300 hover:!text-white transition-colors no-underline"
        >
          Login
        </Link>
        
        {/* CTA Button: Forced white text and vibrant cyan */}
        <Link 
          href="/signup" 
          className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-500 !text-white rounded-full text-sm font-black shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all hover:scale-105 no-underline border border-cyan-400/30"
        >
          Get Started Free
        </Link>
        
      </div>
    </div>
  );
}