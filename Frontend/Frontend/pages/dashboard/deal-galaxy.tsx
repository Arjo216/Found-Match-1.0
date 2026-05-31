// pages/dashboard/deal-galaxy.tsx
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const DealGalaxyLoader = ({ matches }: { matches: any[] }) => {
  const [GalaxyComponent, setGalaxyComponent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import("../../components/DealGalaxy")
      .then((module) => {
        setGalaxyComponent(() => module.default);
      })
      .catch((err) => {
        console.error("GALAXY IMPORT CRASH:", err);
        setError(err.message || "Failed to load 3D module");
      });
  }, []);

  if (error) return <div style={{ color: "red", padding: "20px", textAlign: "center" }}>CRITICAL 3D ERROR: {error}</div>;
  if (!GalaxyComponent) return <div style={{ color: "#06b6d4", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>INITIALIZING ORBITAL RADAR...</div>;

  return <GalaxyComponent matches={matches} />;
};

export default function DealGalaxyDashboard() {
  const router = useRouter();
  const [thesis, setThesis] = useState("");
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasAutoRun, setHasAutoRun] = useState(false);

  // --- THE BRIDGE INTERCEPTOR ---
  // Listens for the 'autoQuery' from the Due Diligence Swarm
  useEffect(() => {
    if (router.isReady && router.query.autoQuery && !hasAutoRun) {
      const incomingQuery = router.query.autoQuery as string;
      setThesis(incomingQuery); // Populate the input box
      setHasAutoRun(true);      // Prevent infinite loops
      executeSearch(incomingQuery); // Fire the engine automatically
    }
  }, [router.isReady, router.query, hasAutoRun]);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    
    try {
      const response = await fetch("http://localhost:8000/api/v1/vectors/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitch_summary: searchQuery,
          target_type: "founder",
          threshold: -1.0, 
          limit: 15
        }),
      });

      if (!response.ok) throw new Error("FastAPI connection failed");
      const data = await response.json();
      
      console.log("MATCHES FROM DATABASE:", data.matches);
      
      if (data.status === "success") {
        setLiveMatches(data.matches);
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
      alert("Failed to connect to the Vector Engine.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(thesis);
  };

  return (
    <>
      <Head>
        <title>Deal Galaxy | FoundMatch Engine</title>
      </Head>
      
      <main style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#020617", position: "relative" }}>
        
        {/* Navigation / Exit Button */}
        <div style={{ position: "absolute", top: "24px", right: "24px", zIndex: 50 }}>
          <Link 
            href="/"
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", fontSize: "12px", fontFamily: "monospace", fontWeight: "bold", letterSpacing: "2px", textDecoration: "none" }}
          >
            <span style={{ color: "#f87171" }}>ESC</span> SYSTEM
          </Link>
        </div>

        {/* The Command Line Search UI */}
        <div style={{ position: "absolute", bottom: "48px", left: "50%", transform: "translateX(-50%)", zIndex: 50, width: "100%", maxWidth: "600px", padding: "0 24px", boxSizing: "border-box" }}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", backgroundColor: "#020617", padding: "10px", borderRadius: "16px", border: "1px solid rgba(56, 189, 248, 0.3)", boxShadow: "0 0 30px rgba(6, 182, 212, 0.15)" }}>
            <input 
              type="text" 
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="Enter thesis (e.g., 'Cybersecurity and AI')"
              disabled={isSearching}
              style={{ flex: 1, backgroundColor: "transparent", border: "none", color: "white", outline: "none", fontSize: "14px", padding: "12px", fontFamily: "monospace" }}
            />
            <button 
              type="submit"
              disabled={isSearching || !thesis.trim()}
              style={{ padding: "12px 24px", backgroundColor: isSearching ? "#64748b" : "white", color: "black", fontWeight: "900", textTransform: "uppercase", letterSpacing: "2px", fontSize: "12px", borderRadius: "10px", border: "none", cursor: isSearching ? "not-allowed" : "pointer", transition: "all 0.2s" }}
            >
              {isSearching ? "Executing..." : "Execute"}
            </button>
          </form>
        </div>

        {/* The 3D Engine */}
        {liveMatches.length > 0 ? (
          <DealGalaxyLoader matches={liveMatches} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#475569", fontFamily: "monospace", fontSize: "14px" }}>
            
            {/* Show a loading state if we are actively searching via the Swarm Handoff */}
            {isSearching ? (
               <div className="flex flex-col items-center gap-4">
                 <div className="w-12 h-12 border-4 border-[#38bdf8] border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-[#38bdf8] animate-pulse">Calculating pgvector distances...</p>
               </div>
            ) : (
               <>
                 <p style={{ color: "#10b981", marginBottom: "8px", fontWeight: "bold" }}>AWAITING THESIS INPUT</p>
                 <p>Enter parameters below to map vector space.</p>
               </>
            )}
          </div>
        )}
        
      </main>
    </>
  );
}