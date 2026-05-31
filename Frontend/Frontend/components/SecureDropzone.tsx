"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import init, { generate_quantum_keypair, encrypt_payload } from "quantum_vault";
import { useRouter } from 'next/router';

// --- TYPESCRIPT INTERFACES ---
interface FinancialAnalysis {
  tam: string;
  cac: string;
  ltv: string;
  burn_rate: string;
  financial_health: string;
}

interface RiskAnalysis {
  competitors: string[];
  market_risks: string[];
  business_model_holes: string[];
}

interface MatchCriteria {
  target_investor_thesis: string;
  recommended_fund_types: string[];
  pgvector_query: string;
}

interface DDReport {
  startup_name: string;
  financial_analysis: FinancialAnalysis;
  risk_analysis: RiskAnalysis;
  match_criteria: MatchCriteria;
  final_verdict: string;
}

type AppState = 'IDLE' | 'PROCESSING_WASM' | 'ENCRYPTED_WAITING' | 'SWARM_PROCESSING' | 'COMPLETE' | 'ERROR';

export default function SecureDropzone() {
  const router = useRouter();
  const [isWasmReady, setIsWasmReady] = useState(false);
  const [appState, setAppState] = useState<AppState>('IDLE');
  
  // Vault States
  const [fileName, setFileName] = useState<string | null>(null);
  const [cipherText, setCipherText] = useState<string | null>(null);
  const [ephemeralPublicKey, setEphemeralPublicKey] = useState<string | null>(null);
  
  // Store the extracted raw text for the AI Swarm
  const [extractedPitchText, setExtractedPitchText] = useState<string>(""); 
  
  // Swarm States
  const [reportData, setReportData] = useState<DDReport | null>(null);

  useEffect(() => {
    async function bootWasm() {
      try {
        await init();
        setIsWasmReady(true);
      } catch (error) {
        console.error("WASM Boot Failure:", error);
      }
    }
    bootWasm();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !isWasmReady) return;

    // --- NEW SAFEGUARD: Block binary files from being read as text ---
    if (!file.name.toLowerCase().endsWith('.txt')) {
      alert("⚠️ ARCHITECTURE LOCK: For this testing phase, please upload a plain .TXT file. Binary files (PDF/PPTX) require the backend Python extraction engine, which we are building next.");
      return;
    }

    setAppState('PROCESSING_WASM');
    setFileName(file.name);

    // 1. Read file as Text for the LangGraph Swarm
    const textReader = new FileReader();
    textReader.onload = (e) => {
      if (e.target?.result) {
        // Cap the text length to protect the LLM context window just in case
        const rawText = e.target.result as string;
        setExtractedPitchText(rawText.substring(0, 15000)); 
      }
    };
    textReader.readAsText(file);

    // 2. Read file as Base64 for the Zero-Knowledge Vault Encryption
    const cryptoReader = new FileReader();
    cryptoReader.onload = async () => {
      try {
        const base64Data = cryptoReader.result as string;

        const keys = generate_quantum_keypair();
        const pubKeyArray = keys.public_key;
        
        const hexPubKey = Array.from(pubKeyArray)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        setEphemeralPublicKey(hexPubKey.substring(0, 64) + "...");

        const encryptedBytes = encrypt_payload(pubKeyArray, base64Data);
        
        const hexCiphertext = Array.from(encryptedBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        
        setCipherText(hexCiphertext);
        setAppState('ENCRYPTED_WAITING'); 

      } catch (err) {
        console.error("Encryption pipeline failed:", err);
        setAppState('IDLE');
      }
    };
    
    cryptoReader.readAsDataURL(file);
  }, [isWasmReady]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxFiles: 1 
  });

  const handleTransmit = async () => {
    setAppState('SWARM_PROCESSING');
    
    try {
      // Step A: Send Encrypted payload to Vault
      await fetch("http://localhost:8000/api/vault/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_name: fileName,
          ephemeral_public_key: ephemeralPublicKey,
          ciphertext: cipherText
        })
      });

      // Step B: Trigger LangGraph Swarm with DYNAMIC text
      const cleanStartupName = fileName ? fileName.replace(/\.[^/.]+$/, "") : "Unknown Startup";
      
      const response = await fetch("http://localhost:8000/swarm/diligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startup_name: cleanStartupName,
          pitch_text: extractedPitchText 
        })
      });

      if (!response.ok) throw new Error("Swarm API failed");

      const data = await response.json();
      setReportData(data);
      setAppState('COMPLETE');

    } catch (error) {
      console.error("Transmission failed:", error);
      setAppState('ERROR');
    }
  };

  if (!isWasmReady) {
    return (
      <div className="p-6 text-[#34d399] font-mono text-center animate-pulse">
        Initializing Zero-Knowledge Engine...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 p-6 bg-[#020617] border border-gray-800 rounded-lg text-gray-200 font-mono shadow-[0_0_20px_rgba(16,185,129,0.1)]">
      
      {/* --- IDLE & WASM PROCESSING STATE --- */}
      {(appState === 'IDLE' || appState === 'PROCESSING_WASM') && (
        <div 
          {...getRootProps()} 
          className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-200 ${
            isDragActive ? "border-[#34d399] bg-[#10b981]/10" : "border-[#475569] bg-[#0f172a]/50"
          }`}
        >
          <input {...getInputProps()} />
          <p className={`font-bold text-lg mb-2 ${isDragActive ? "text-[#34d399]" : "text-[#cbd5e1]"}`}>
            {appState === 'PROCESSING_WASM' ? "Chunking & Encrypting..." : isDragActive ? "Drop to Initiate Encryption" : "Secure File Dropzone"}
          </p>
          <p className="text-[#64748b] text-sm">Drag & drop pitch decks or models (TXT REQUIRED for current test phase)</p>
        </div>
      )}

      {/* --- ENCRYPTED WAITING STATE (Showing the Keys) --- */}
      {appState === 'ENCRYPTED_WAITING' && (
        <div className="flex flex-col gap-4 border-t border-white/10 pt-5 mt-5">
          <div className="flex justify-between text-[#94a3b8]">
            <span>Target File:</span>
            <span className="text-[#f8fafc]">{fileName}</span>
          </div>
          
          <div className="flex justify-between text-[#94a3b8]">
            <span>Status:</span>
            <span className="text-[#34d399] font-bold">Mathematically Sealed</span>
          </div>

          <div>
            <p className="text-[#94a3b8] mb-1 text-sm">Ephemeral Public Key (Kyber):</p>
            <div className="bg-black p-3 rounded-md border border-white/10 text-[#6ee7b7] break-all text-xs">
              {ephemeralPublicKey}
            </div>
          </div>
          
          <div className="flex flex-col flex-grow">
            <p className="text-[#94a3b8] mb-1 text-sm">Encrypted Ciphertext (Ready for Server):</p>
            <div className="bg-black p-3 rounded-md border border-white/10 text-[#67e8f9] break-all text-xs max-h-[150px] overflow-y-auto">
              {cipherText}
            </div>
          </div>
          
          <button 
            onClick={handleTransmit}
            className="mt-4 p-3 bg-[#10b981] hover:bg-[#059669] text-black font-black uppercase tracking-widest rounded-md transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          >
            Transmit to Vault & Deploy Swarm
          </button>
        </div>
      )}

      {/* --- SWARM PROCESSING STATE (Mission Control) --- */}
      {appState === 'SWARM_PROCESSING' && (
        <div className="flex flex-col py-12 px-8 bg-black border border-gray-800 rounded">
          <h3 className="text-[#3b82f6] text-xl font-bold mb-6 border-b border-gray-800 pb-2 uppercase tracking-widest">
            Mission Control: Swarm Active
          </h3>
          <div className="space-y-4 text-sm font-mono">
            <p className="text-gray-400">System <span className="text-green-500">[ONLINE]</span> - Vault Ingestion Confirmed.</p>
            <p className="text-gray-400 animate-pulse text-yellow-500">🕵️‍♂️ Analyst Agent extracting financials from {fileName}...</p>
            <p className="text-gray-400 animate-pulse text-red-400" style={{ animationDelay: '1s' }}>⚖️ Interrogator Agent red-teaming competitors and risks...</p>
            <p className="text-gray-400 animate-pulse text-purple-400" style={{ animationDelay: '2s' }}>🎯 Matchmaker Agent translating metrics into pgvector space...</p>
          </div>
        </div>
      )}

      {/* --- COMPLETE STATE (DD DASHBOARD) --- */}
      {appState === 'COMPLETE' && reportData && (
        <div className="animate-fade-in-up mt-4">
          <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
            <h2 className="text-2xl font-black text-white tracking-wider uppercase">
              Due Diligence: <span className="text-[#10b981]">{reportData.startup_name}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#0f172a] p-5 rounded border border-gray-800">
              <h4 className="text-sm text-gray-500 uppercase tracking-widest mb-4">Core Financials</h4>
              <ul className="space-y-3 text-sm">
                <li><span className="text-gray-400">TAM:</span> <span className="text-white">{reportData.financial_analysis?.tam || "N/A"}</span></li>
                <li><span className="text-gray-400">CAC:</span> <span className="text-white">{reportData.financial_analysis?.cac || "N/A"}</span></li>
                <li><span className="text-gray-400">LTV:</span> <span className="text-white">{reportData.financial_analysis?.ltv || "N/A"}</span></li>
                <li><span className="text-gray-400">Burn Rate:</span> <span className="text-white">{reportData.financial_analysis?.burn_rate || "N/A"}</span></li>
              </ul>
            </div>

            <div className="bg-[#0f172a] p-5 rounded border border-gray-800">
              <h4 className="text-sm text-gray-500 uppercase tracking-widest mb-4">Risk Profile</h4>
              <ul className="space-y-2 text-sm text-red-400 list-disc list-inside">
                {reportData.risk_analysis?.competitors?.map((comp, i) => <li key={i}>{comp}</li>)}
                {reportData.risk_analysis?.market_risks?.map((risk, i) => <li key={i}>{risk}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded border border-gray-700 mb-8">
             <h4 className="text-lg text-white font-bold mb-3">Lead Partner Verdict</h4>
             <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{reportData.final_verdict}</p>
          </div>

          <div className="flex justify-center mt-10">
            <button 
  className="px-10 py-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-black uppercase tracking-widest rounded transition-all duration-300 shadow-[0_0_25px_rgba(59,130,246,0.5)]"
  onClick={() => {
    // Phase 2 Bridge: Push to Deal Galaxy and pass the query in the URL
    router.push({
      pathname: '/dashboard/deal-galaxy',
      query: { autoQuery: reportData.match_criteria?.pgvector_query }
    });
  }}
>
  Deploy to Deal Galaxy
</button>
          </div>
        </div>
      )}

      {/* --- ERROR STATE --- */}
      {appState === 'ERROR' && (
        <div className="text-center py-10">
          <h3 className="text-red-500 text-xl font-bold mb-4">Transmission Failed</h3>
          <p className="text-gray-400 mb-6">The Swarm encountered an anomaly. Check your backend logs.</p>
          <button onClick={() => setAppState('IDLE')} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">Retry</button>
        </div>
      )}

    </div>
  );
}