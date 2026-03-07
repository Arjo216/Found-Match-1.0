// components/KYCModal.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, X, Loader2, FileText, Lock } from "lucide-react";
import { api } from "../lib/api";

type KYCModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function KYCModal({ isOpen, onClose, onSuccess }: KYCModalProps) {
  const [docType, setDocType] = useState("PAN");
  const [docId, setDocId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.post("/kyc/verify", {
        document_type: docType,
        document_id: docId,
      });

      if (res.data.status === "success") {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500); // Wait 1.5s to show the success animation before closing
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Identity verification failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          {/* Blurred Background Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} 
            onClick={onClose} 
          />

          {/* Glassmorphism Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{ position: "relative", width: "100%", maxWidth: "480px", backgroundColor: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(147, 51, 234, 0.4)", borderRadius: "24px", padding: "32px", boxShadow: "0 30px 80px rgba(0,0,0,0.9)" }}
          >
            <button onClick={onClose} style={{ position: "absolute", top: "20px", right: "20px", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }} className="hover:text-rose-400 transition-colors">
              <X size={24} />
            </button>

            {success ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "2px solid rgba(16, 185, 129, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <ShieldCheck size={40} color="#34d399" />
                </div>
                <h3 style={{ color: "white", fontSize: "24px", fontWeight: "bold", marginBottom: "12px" }}>Identity Verified</h3>
                <p style={{ color: "#94a3b8", fontSize: "15px" }}>Your institutional access has been granted. Opening Secure Vault...</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "rgba(147, 51, 234, 0.1)", border: "1px solid rgba(168, 85, 247, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShieldAlert size={28} color="#c084fc" />
                  </div>
                  <div>
                    <h3 style={{ color: "white", fontSize: "20px", fontWeight: "bold", margin: 0 }}>Regulatory Soft Gate</h3>
                    <p style={{ color: "#94a3b8", fontSize: "14px", margin: "4px 0 0 0" }}>KYC Verification required for Deal Rooms.</p>
                  </div>
                </div>

                <div style={{ backgroundColor: "rgba(2, 6, 23, 0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "16px", marginBottom: "24px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <Lock size={18} color="#fbbf24" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <p style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
                    To comply with institutional anti-money laundering (AML) protocols, you must verify your identity before initiating direct contact or accessing encrypted assets.
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", fontWeight: "bold", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Document Type</label>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button type="button" onClick={() => setDocType("PAN")} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: `2px solid ${docType === "PAN" ? "#c084fc" : "#334155"}`, backgroundColor: docType === "PAN" ? "rgba(147, 51, 234, 0.1)" : "transparent", color: docType === "PAN" ? "white" : "#94a3b8", fontWeight: "bold", transition: "all 0.2s", cursor: "pointer" }}>PAN Card</button>
                      <button type="button" onClick={() => setDocType("AADHAAR")} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: `2px solid ${docType === "AADHAAR" ? "#c084fc" : "#334155"}`, backgroundColor: docType === "AADHAAR" ? "rgba(147, 51, 234, 0.1)" : "transparent", color: docType === "AADHAAR" ? "white" : "#94a3b8", fontWeight: "bold", transition: "all 0.2s", cursor: "pointer" }}>Aadhaar</button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", fontWeight: "bold", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Document Number</label>
                    <div style={{ position: "relative" }}>
                      <FileText size={18} color="#64748b" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                      <input 
                        type="text" 
                        value={docId}
                        onChange={(e) => setDocId(e.target.value)}
                        placeholder={docType === "PAN" ? "e.g., ABCDE1234F" : "e.g., 000011112222"}
                        style={{ width: "100%", backgroundColor: "#020617", border: "1px solid #475569", borderRadius: "12px", padding: "14px 16px 14px 44px", fontSize: "16px", color: "white", outline: "none", transition: "border-color 0.2s" }}
                        className="focus:border-purple-500"
                        required
                      />
                    </div>
                    <p style={{ color: "#64748b", fontSize: "12px", marginTop: "8px", fontStyle: "italic" }}>
                      Developer Sandbox: Use Magic Number <span style={{ color: "#34d399", fontWeight: "bold" }}>ABCDE1234F</span> to auto-verify.
                    </p>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ color: "#f43f5e", backgroundColor: "rgba(244, 63, 94, 0.1)", padding: "12px", borderRadius: "8px", fontSize: "13px", fontWeight: "bold", border: "1px solid rgba(244, 63, 94, 0.3)" }}>
                      {error}
                    </motion.div>
                  )}

                  <button type="submit" disabled={isLoading || !docId} style={{ width: "100%", padding: "16px", borderRadius: "12px", backgroundColor: "#7c3aed", color: "white", fontWeight: "black", fontSize: "16px", border: "none", cursor: isLoading || !docId ? "not-allowed" : "pointer", opacity: isLoading || !docId ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "8px" }} className="hover:bg-purple-600 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                    {isLoading ? "Verifying via Database..." : "Verify Identity"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}