/// components/Hero.tsx
import React from "react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-slate-900">
              Find the perfect match between founders & investors
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl">
              Found Match helps entrepreneurs discover investors aligned with their
              vision — and helps investors find promising founders to back. Fast,
              private, and designed for real outcomes.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">
                Get started (it's free)
              </Link>

              <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50">
                Login
              </Link>
            </div>

            <div className="mt-6 text-sm text-slate-500">
              Trusted by early-stage startups and angels — built for privacy & speed.
            </div>
          </div>

          <div className="order-first lg:order-last">
            {/* Illustration / hero card cluster */}
            <div className="rounded-2xl bg-gradient-to-tr from-white to-indigo-50 p-6 shadow-soft">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-white rounded-xl p-4">
                  <div className="text-xs text-gray-400">Founder</div>
                  <div className="mt-2 font-semibold">Anaya Patel</div>
                  <div className="mt-1 text-xs text-gray-500">SaaS • Pre-seed</div>
                  <div className="mt-3 text-sm text-gray-600">Built traction 1k MRR · looking for seed</div>
                </div>

                <div className="bg-white rounded-xl p-4">
                  <div className="text-xs text-gray-400">Investor</div>
                  <div className="mt-2 font-semibold">Rohit Sharma VC</div>
                  <div className="mt-1 text-xs text-gray-500">Focus: fintech, SaaS</div>
                  <div className="mt-3 text-sm text-gray-600">Pre-seed & seed checks — active portfolio</div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">Example matches — connect in minutes</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
