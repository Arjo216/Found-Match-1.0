// pages/index.tsx
import React from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import Hero from "../components/Hero";
import FeatureGrid from "../components/FeatureGrid";
import FoundersPreview from "../components/FoundersPreview";
import CTABar from "../components/CTABar";

export default function HomePage() {
  return (
    <Layout>
      <main className="min-h-screen flex flex-col relative overflow-hidden bg-slate-950 text-slate-200 selection:bg-cyan-500/30">
        
        {/* Dynamic Background Mesh */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full filter blur-[128px] pointer-events-none z-0"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full filter blur-[128px] pointer-events-none z-0"></div>

        {/* Hero section */}
        <section className="relative z-10 w-full">
          <Hero />
        </section>

        {/* Feature Highlight Grid */}
        <section className="relative z-10 py-32 border-t border-white/5 bg-slate-900/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <FeatureGrid />
          </div>
        </section>

        {/* Founder Cards Preview */}
        <section className="relative z-10 py-32 border-t border-white/5 bg-slate-950/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <FoundersPreview />
          </div>
        </section>

        {/* High-Impact CTA Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative z-10 py-32"
        >
          <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
            
            <div className="glass rounded-[40px] p-16 md:p-24 shadow-[0_0_60px_rgba(6,182,212,0.1)] relative overflow-hidden border border-white/10 bg-slate-900/40">
              
              {/* Card top edge highlight */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

              <h3 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-8">
                Ready to find your{" "}
                <span className="relative inline-block">
                  {/* Glowing layer */}
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 blur-xl opacity-60 select-none pointer-events-none" aria-hidden="true">
                    Match?
                  </span>
                  {/* Sharp layer */}
                  <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                    Match?
                  </span>
                </span>
              </h3>

              <p className="text-xl text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed font-medium">
                Bridge the gap between early-stage founders and investors. Join the platform leveraging <span className="text-white font-bold">Graph Neural Networks</span> to automate discovery.
              </p>

              <div className="mt-12">
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center px-12 py-5 bg-white text-slate-950 font-black text-lg rounded-2xl transition-all hover:scale-105 hover:bg-cyan-50 shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                >
                  Apply for Access
                </a>
              </div>
            </div>

          </div>
        </motion.section>
      </main>

      {/* Persistent CTA Bar */}
      <CTABar />
    </Layout>
  );
}