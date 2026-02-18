// components/Layout.tsx
import Link from "next/link";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 flex flex-col">
      
      {/* Premium Glass Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            FoundMatch
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">Login</Link>
            <Link href="/signup" className="text-sm font-medium px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-[0_0_15px_rgba(8,145,178,0.4)] transition">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow">
        {children}
      </div>

      {/* Modern Footer */}
      <footer className="py-8 text-center text-sm text-slate-500 border-t border-white/5 bg-slate-950">
        © {new Date().getFullYear()} Found Match. AI-Powered Capital Allocation.
      </footer>
    </div>
  );
}