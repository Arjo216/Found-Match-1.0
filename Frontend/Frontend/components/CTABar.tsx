// components/CTABar.tsx
import React from "react";
import Link from "next/link";

export default function CTABar() {
  return (
    <div className="fixed bottom-6 right-6 hidden md:block">
      <div className="bg-white p-3 rounded-full shadow-lg flex gap-2 items-center">
        <Link href="/signup" className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm">Get started</Link>
        <Link href="/login" className="text-sm text-slate-700">Login</Link>
      </div>
    </div>
  );
}
