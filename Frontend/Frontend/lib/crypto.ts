// lib/crypto.ts

/**
 * Military-Grade Web Crypto Engine (Hybrid RSA-OAEP + AES-GCM)
 */

// --- HELPER FUNCTIONS ---
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// --- RSA KEY GENERATION & STORAGE ---
export async function generateRSAKeyPair() {
  return await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048, 
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true, 
    ["encrypt", "decrypt"]
  );
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("spki", key);
  return bufferToBase64(exported);
}

export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("pkcs8", key);
  return bufferToBase64(exported);
}

export async function importPublicKey(pem: string): Promise<CryptoKey> {
  return await window.crypto.subtle.importKey(
    "spki",
    base64ToBuffer(pem),
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );
}

export async function importPrivateKey(pem: string): Promise<CryptoKey> {
  return await window.crypto.subtle.importKey(
    "pkcs8",
    base64ToBuffer(pem),
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  );
}

// --- HYBRID ENCRYPTION (AES-256 for Payload + RSA for Key) ---
export async function encryptMessage(publicKey: CryptoKey, message: string): Promise<string> {
  // 1. Generate a one-time AES-GCM key for this specific message
  const aesKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // 2. Encrypt the large message using the fast AES key
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedMessage = new TextEncoder().encode(message);
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    aesKey,
    encodedMessage
  );

  // 3. Encrypt the AES key itself using the receiver's RSA Public Key
  const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
  const encryptedAesKeyBuffer = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawAesKey
  );

  // 4. Package everything into a secure JSON envelope and Base64 encode it
  const payload = {
    k: bufferToBase64(encryptedAesKeyBuffer), // Encrypted AES Key
    i: bufferToBase64(iv.buffer),             // Initialization Vector
    c: bufferToBase64(ciphertextBuffer)       // Encrypted Message Payload
  };

  return window.btoa(JSON.stringify(payload));
}

export async function decryptMessage(privateKey: CryptoKey, encryptedBase64: string): Promise<string> {
  try {
    // 1. Unpack the envelope securely
    let payload;
    try {
      // If it's old plain text, atob or JSON.parse will fail immediately
      const payloadStr = window.atob(encryptedBase64);
      payload = JSON.parse(payloadStr);
    } catch (parseErr) {
      // FIX: Return the fallback string directly instead of throwing an error.
      // This completely stops the Next.js Red Screen from appearing!
      return "🔒 [Legacy Unencrypted Message]";
    }

    const encryptedAesKeyBytes = base64ToBuffer(payload.k);
    const iv = base64ToBuffer(payload.i);
    const ciphertextBytes = base64ToBuffer(payload.c);

    // 2. Unlock the AES key using our RSA Private Key
    const rawAesKey = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedAesKeyBytes
    );

    // 3. Rebuild the AES key
    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      rawAesKey,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    // 4. Decrypt the actual message
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      aesKey,
      ciphertextBytes
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (e) {
    console.error("Hybrid Decryption failed", e);
    return "🔒 [Decryption Failed]";
  }
}

// --- FILE VAULT ENCRYPTION (Binary AES-GCM + RSA) ---

export async function encryptFile(publicKey: CryptoKey, fileBuffer: ArrayBuffer) {
  // 1. Generate a massive one-time AES key for the document
  const aesKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // 2. Encrypt the raw file binary
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    aesKey,
    fileBuffer
  );

  // 3. Lock the AES key with the receiver's RSA public lock
  const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
  const encryptedAesKeyBuffer = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawAesKey
  );

  return {
    encryptedBlob: new Blob([ciphertextBuffer]),
    k: bufferToBase64(encryptedAesKeyBuffer), // The locked key
    i: bufferToBase64(iv.buffer)              // The vector
  };
}

export async function decryptFile(privateKey: CryptoKey, encryptedBuffer: ArrayBuffer, k: string, i: string): Promise<Blob> {
  // 1. Unpack the locks
  const encryptedAesKeyBytes = base64ToBuffer(k);
  const iv = base64ToBuffer(i);

  // 2. Use our Private RSA Key to unlock the AES Key
  const rawAesKey = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedAesKeyBytes
  );

  const aesKey = await window.crypto.subtle.importKey(
    "raw",
    rawAesKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  // 3. Decrypt the massive file binary
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    aesKey,
    encryptedBuffer
  );

  return new Blob([decryptedBuffer]);
}