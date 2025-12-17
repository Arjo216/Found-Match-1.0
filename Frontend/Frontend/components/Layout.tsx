// components/Layout.tsx  (temporary fallback)
import Link from "next/link";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>
      <header style={{ background: "#ffffff", borderBottom: "1px solid #e6e9ee" }}>
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/" legacyBehavior><a style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", textDecoration: "none" }}>Found Match</a></Link>
            <nav style={{ display: "none" /* hidden by default, shown on larger screens with Tailwind */ }} />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link href="/login" legacyBehavior><a style={{ fontSize: 14, color: "#0f172a", textDecoration: "none" }}>Login</a></Link>
            <Link href="/signup" legacyBehavior>
              <a style={{
                display: "inline-block",
                padding: "8px 12px",
                background: "#2563eb",
                color: "#fff",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14
              }}>Get Started</a>
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1150, margin: "0 auto", padding: 20 }}>
        {children}
      </main>

      <footer style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
        © {new Date().getFullYear()} Found Match
      </footer>
    </div>
  );
}

