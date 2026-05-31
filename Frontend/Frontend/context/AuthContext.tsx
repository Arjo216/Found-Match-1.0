// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, setAuthToken, clearAuthToken, api } from "../lib/api";
import { useRouter } from "next/router";
import { generateRSAKeyPair, exportPublicKey, exportPrivateKey } from "../lib/crypto";
import Cookies from "js-cookie"; // <-- NEW IMPORT

type User = {
  id: number | string;
  email: string;
  role?: string;
  user_id?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // --- THE CRYPTOGRAPHIC INITIALIZER ---
  const ensureCryptoKeys = async (userId: string | number) => {
    const storageKey = `fm_priv_key_${userId}`;
    
    // If they don't have a key on this device, generate one!
    if (typeof window !== "undefined" && !localStorage.getItem(storageKey)) {
      try {
        console.log("🛡️ Generating Zero-Trust E2EE Keys...");
        const keyPair = await generateRSAKeyPair();
        const pubKeyStr = await exportPublicKey(keyPair.publicKey);
        const privKeyStr = await exportPrivateKey(keyPair.privateKey);

        // 1. Lock the Private Key locally
        localStorage.setItem(storageKey, privKeyStr);

        // 2. Send the Public Key to the Vault
        await api.post("/profile/keys/upload", {
          user_id: String(userId),
          public_key: pubKeyStr
        });
        console.log("🛡️ Public Key secured in Database Vault.");
      } catch (error) {
        console.error("Cryptographic generation failed:", error);
      }
    }
  };

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("fm_token");
      if (token) {
        try {
          const res = await auth.me();
          setUser(res.data);
          
          // FIX: Safely extract the ID and verify it exists before generating keys
          const currentId = res.data.id || res.data.user_id;
          if (currentId) {
            await ensureCryptoKeys(currentId);
          }
          
        } catch (error) {
          console.error("Invalid token on load, logging out");
          clearAuthToken();
          setUser(null);
          Cookies.remove("token"); // Clean up cookie if local storage token is invalid
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (token: string, userData: User) => {
    setAuthToken(token);
    setUser(userData);
    
    // --- NEW: Set the cookie so the Next.js middleware can see it ---
    Cookies.set("token", token, { expires: 1, secure: true });
    
    // FIX: Safely extract the ID and verify it exists before generating keys
    const currentId = userData.id || userData.user_id;
    if (currentId) {
      await ensureCryptoKeys(currentId);
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    
    // --- NEW: Clear the cookie on logout so the Middleware locks the routes ---
    Cookies.remove("token");
    
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);