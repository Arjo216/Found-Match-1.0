"use client";

import React, { useState, useEffect } from "react";
import init, { generate_quantum_keypair, encrypt_payload } from "quantum_vault";

export default function QuantumVaultTest() {
  const [isWasmLoaded, setIsWasmLoaded] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [testEncryption, setTestEncryption] = useState<string | null>(null);

  useEffect(() => {
    async function loadWasm() {
      try {
        await init(); 
        setIsWasmLoaded(true);
      } catch (err) {
        console.error("Failed to load Quantum WebAssembly:", err);
      }
    }
    loadWasm();
  }, []);

  const handleGenerateKeys = () => {
    try {
      const keys = generate_quantum_keypair();
      
      const pubKeyArray = keys.public_key;
      const hexKey = Array.from(pubKeyArray)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
        
      setPublicKey(hexKey.substring(0, 64) + "... (Truncated)");

      const encryptedBytes = encrypt_payload(pubKeyArray, "TOP_SECRET_TERM_SHEET_DATA");
      const hexEncrypted = Array.from(encryptedBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      
      setTestEncryption(hexEncrypted);

    } catch (err) {
      console.error("Quantum Math Error:", err);
    }
  };

  if (!isWasmLoaded) {
    return (
      <div style={{ padding: "16px", color: "#22d3ee", fontFamily: "monospace", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
        Initializing Post-Quantum Engine...
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", backgroundColor: "#020617", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px", fontFamily: "monospace", fontSize: "14px", boxShadow: "0 0 20px rgba(16, 185, 129, 0.1)" }}>
      <h2 style={{ color: "#34d399", fontWeight: "900", fontSize: "18px", marginBottom: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
        NIST Kyber Vault Online
      </h2>
      
      <button 
        onClick={handleGenerateKeys}
        style={{ padding: "10px 20px", backgroundColor: "#10b981", color: "black", fontWeight: "bold", borderRadius: "6px", border: "none", cursor: "pointer", marginBottom: "24px", transition: "background-color 0.2s" }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#34d399"}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#10b981"}
      >
        Generate Post-Quantum Keypair
      </button>

      {publicKey && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Generated Public Key (Kyber):</p>
            <p style={{ color: "#6ee7b7", backgroundColor: "black", padding: "12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", wordBreak: "break-all" }}>
              {publicKey}
            </p>
          </div>
          
          <div>
            <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Test Payload Encryption Output:</p>
            <p style={{ color: "#67e8f9", backgroundColor: "black", padding: "12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", wordBreak: "break-all" }}>
              {testEncryption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}