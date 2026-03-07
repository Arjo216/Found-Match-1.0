

### 2. The Frontend (`frontend/README.md`)
*This focuses on your stunning glassmorphism UI, client-side encryption logic, and responsive design.*
<div align="center">

  
# 🎨 FoundMatch - Frontend Application

**Next.js 14 • Tailwind CSS • Framer Motion • Web Crypto API**

*The user-facing command center for FoundMatch. Engineered for absolute privacy, real-time communication, and a frictionless, high-fidelity user experience.*

</div>

## ✨ Key Features

- **Institutional Glassmorphism UI:** A premium, dark-mode design system utilizing `backdrop-blur`, complex gradient meshes, and responsive CSS grids.
- **Zero-Knowledge Client (E2EE):** Integrates the native browser Web Crypto API. Generates and stores RSA public/private key pairs locally to encrypt chat streams and binary file buffers before they ever touch the network.
- **Real-Time Deal Rooms:** Seamless WebSocket integration for instant, encrypted founder-investor communications.
- **Interactive Kanban CRM:** Native HTML5 Drag-and-Drop deal flow management (Sourced ➡️ Term Sheet ➡️ Closed).
- **Executive AI Co-Pilot:** A stunning, centralized modal interface for interacting with the platform's AI, complete with context-aware smart suggestions and file staging.

### 3. The Frontend `Frontend/Frontend/README.md`
*Update frontend README to highlight the complex WebCrypto logic and stunning Glassmorphism UI components.*

# FoundMatch Frontend: Next.js & Client-Side Crypto

A high-performance, institutional-grade user interface built with React, Next.js, and TailwindCSS. It acts as a "Zero-Knowledge Client," handling all data decryption and AI formatting locally.

## 🛡️ Security & Cryptography (`/lib/crypto.ts`)
* **Key Generation:** Generates RSA-OAEP public/private key pairs locally in the browser upon registration.
* **Message Encryption:** Uses the recipient's Public Key to encrypt message text before it ever touches the network.
* **File Encryption:** Converts PDFs and documents into ArrayBuffers, encrypts them with a dynamic AES-GCM key, and encrypts *that* key with the recipient's RSA Public Key (Hybrid Encryption).
* **Fallback Safety:** Built-in `try...catch` protocols to gracefully display "Legacy Unencrypted Messages" without crashing the React application.

## 🎨 Advanced UI/UX Components
* **`KYCModal.tsx`:** A Glassmorphism soft-gate that intercepts users before they enter a Deal Room, forcing simulated identity verification.
* **`AICoPilot.tsx`:** A persistent, floating AI widget with document-upload capabilities, utilizing `<AnimatePresence>` for smooth, state-driven transitions.
* **`ChatWindow.tsx`:** A secure messaging interface featuring dynamic AI suggestions (The Ghostwriter), file-attachment indicators, and offline PDF dossier exporting.
* **`network.tsx`:** An interactive, drag-and-drop Kanban board for visual Deal Flow management, integrated directly with the Deal Room chat.

## 🛠️ Run Locally
```bash
npm run dev
# Note: Ensure the FastAPI backend is running on port 8000, 
# and the Groq API key is valid on the server-side.
```

## 🏗️ The "Pro" Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (React)
- **Language:** [TypeScript](https://www.typescriptlang.org/) for strict type safety.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
- **Animations:** [Framer Motion](https://www.framer.com/motion/) for fluid layout transitions and modal orchestration.
- **Data Visualization:** [Recharts](https://recharts.org/) for dynamic metric rendering.
- **Icons:** [Lucide React](https://lucide.dev/)

## ⚡ Getting Started (Local Development)

### 1. Prerequisites
Ensure you have **Node.js (>= 18.x)** and **pnpm** installed.
```bash
npm install -g pnpm
```
### 2. Installation & Execution
```Bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```
***Navigate to http://localhost:3000 to view the application.***

### 3. 🧹 Cache Management
If you make significant UI architectural changes, clear the Next.js cache to force a Tailwind recompilation:

```Bash
rm -rf .next
pnpm run dev

---