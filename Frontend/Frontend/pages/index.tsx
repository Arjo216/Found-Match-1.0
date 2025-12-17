// pages/index.tsx
import React from "react";
import Layout from "../components/Layout";
import Hero from "../components/Hero";
import FeatureGrid from "../components/FeatureGrid";
import FoundersPreview from "../components/FoundersPreview";
import CTABar from "../components/CTABar";

export default function HomePage() {
  return (
    <Layout>
      <main className="min-h-screen flex flex-col">
        {/* Hero section */}
        <Hero />

        {/* Feature Highlight Grid */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <FeatureGrid />
          </div>
        </section>

        {/* Founder Cards Preview */}
        <section className="bg-gray-50 py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <FoundersPreview />
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h3 className="text-2xl font-semibold tracking-tight">
              Ready to find your match?
            </h3>

            <p className="text-slate-600 mt-3 max-w-xl mx-auto">
              Create a profile and discover curated introductions to investors or 
              founders perfectly aligned with your goals and vision.
            </p>

            <div className="mt-6">
              <a
                href="/signup"
                className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition"
              >
                Get Started
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Persistent CTA Bar */}
      <CTABar />
    </Layout>
  );
}
