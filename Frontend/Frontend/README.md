

# 🚀 FoundMatch - Frontend

**FoundMatch** is the premier AI-driven matchmaking platform for startup founders and investors. This repository contains the **Frontend** application, built with modern web technologies to provide a sleek, "Tinder-like" discovery experience and a professional dashboard for managing fundraising/deal flow.

![FoundMatch Banner](https://via.placeholder.com/1200x400?text=FoundMatch+Dashboard+Preview)

## 📖 Table of Contents

- [✨ Features](#-features)
- [🏗️ Tech Stack](#️-tech-stack)
- [⚡ Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [🎨 Design System](#-design-system)
- [🔧 Configuration](#-configuration)
- [Scripts](#scripts)

## ✨ Features

- **AI Match Feed:** Curated list of investors/startups ranked by our Hybrid AI engine (LightGCN + SBERT).
- **Smart Filters:** Real-time filtering by Domain (e.g., AI, FinTech), Stage (Seed, Series A), and Role.
- **Match Score Badges:** Visual "Confidence Score" (e.g., 94% Match) displayed on every card.
- **Swipe Interface:** Interactive card-based discovery for quick shortlisting.
- **Secure Authentication:** Role-based login (Founder vs. Investor) via JWT.
- **Modern UI/UX:** Responsive design with smooth animations and glass-morphism effects.

## 🏗️ Built With

This project uses the **"Pro Stack"** for high-performance React applications:

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Component Library:** [Shadcn/UI](https://ui.shadcn.com/) (Radix Primitives)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Hooks & Context
- **Package Manager:** [pnpm](https://pnpm.io/)

## ⚡ Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (>= 18.x)
- **pnpm** (Recommended package manager)
  ```bash
  npm install -g pnpm