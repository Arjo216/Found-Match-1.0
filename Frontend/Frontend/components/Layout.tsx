// components/Layout.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import AICoPilot from "./AICoPilot"; 
import NotificationBell from "./NotificationBell";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard/founder" }, 
    { name: "Portfolio", href: "/projects" },
    { name: "Deal Flow", href: "/match" },
    { name: "Network", href: "/network" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 flex flex-col relative overflow-x-hidden">
      
      <header className={`fixed top-0 w-full z-[99999] transition-all duration-300 ${
        isScrolled || mobileMenuOpen 
          ? "bg-slate-950 border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)]" 
          : "bg-transparent border-b border-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <Link href="/" className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 hover:opacity-80 transition-opacity">
            FoundMatch.
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = router.pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isActive 
                        ? "bg-white/10 text-white shadow-inner border border-white/5" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="w-[1px] h-8 bg-white/10"></div>

            <div className="flex gap-4 items-center">
              {/* THE NOTIFICATION BELL */}
              <NotificationBell />

              <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/profile/setup" className="text-sm font-bold px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all hover:scale-105">
                Build Profile
              </Link>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className="md:hidden text-slate-200 hover:text-white p-2 bg-slate-800 rounded-lg border border-slate-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden absolute top-20 left-0 w-full flex flex-col px-6 py-6 gap-4 border-b border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.9)]"
            style={{ backgroundColor: "rgba(0, 0, 0, 1)", zIndex: 99999 }}
          >
            <div className="flex justify-end mb-2">
              {/* Mobile Bell */}
              <NotificationBell />
            </div>

            {navLinks.map((link) => {
              const isActive = router.pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-4 rounded-xl text-center text-lg font-black transition-all ${
                    isActive ? "bg-cyan-600 text-white" : "bg-white text-black shadow-lg active:scale-95"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            <div className="h-[1px] w-full bg-slate-800 my-2"></div>
            
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 rounded-xl text-center text-lg font-black bg-slate-800 text-white border border-slate-700 active:scale-95 transition-all">
              Sign In
            </Link>
            <Link href="/profile/setup" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 rounded-xl text-center text-lg font-black bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.5)] active:scale-95 transition-all">
              Build Profile
            </Link>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Modern Footer */}
      <footer className="py-8 text-center text-sm font-medium text-slate-600 border-t border-white/5 bg-slate-950 mt-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>ML Engine Status: Online</span>
        </div>
        © {new Date().getFullYear()} FoundMatch. Institutional Capital Allocation.
      </footer>

      {/* THE GLOBAL AI CO-PILOT WIDGET */}
      <AICoPilot profileId={7} /> 
    </div>
  );
}