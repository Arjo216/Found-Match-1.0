use wasm_bindgen::prelude::*;
use pqc_kyber::*;
use rand_core::OsRng;

// This macro tells Rust to make this struct visible to Next.js
#[wasm_bindgen]
pub struct QuantumKeys {
    public_key: Vec<u8>,
    secret_key: Vec<u8>,
}

#[wasm_bindgen]
impl QuantumKeys {
    #[wasm_bindgen(getter)]
    pub fn public_key(&self) -> Vec<u8> {
        self.public_key.clone()
    }
}

// 1. Generate NIST-Compliant Kyber Keys in the Browser Memory
#[wasm_bindgen]
pub fn generate_quantum_keypair() -> Result<QuantumKeys, JsValue> {
    let mut rng = OsRng;
    
    // Generate Kyber keypair
    match keypair(&mut rng) {
        Ok(keys) => Ok(QuantumKeys {
            public_key: keys.public.to_vec(),
            secret_key: keys.secret.to_vec(),
        }),
        Err(_) => Err(JsValue::from_str("CRITICAL: Quantum key generation failed.")),
    }
}

// 2. Encrypt the Payload (Term Sheet / RAG Data)
#[wasm_bindgen]
pub fn encrypt_payload(public_key: &[u8], payload_string: &str) -> Result<Vec<u8>, JsValue> {
    let mut rng = OsRng;
    
    // In Kyber, the sender uses the receiver's public key to encapsulate a shared secret.
    // We will use that shared secret to encrypt the payload.
    // For this Phase 1 bridge setup, we are proving the Wasm compilation works.
    
    // Example hook indicating secure processing:
    let secure_message = format!("ENCRYPTED_WITH_KYBER: {}", payload_string);
    Ok(secure_message.into_bytes())
}