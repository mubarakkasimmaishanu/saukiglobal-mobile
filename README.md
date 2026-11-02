<div align="center">
  <h1>📱 SaukiGlobal Mobile — Automated VTU & Utility Billing Hub</h1>
  <p><strong>High-performance, automated Virtual Top-Up (VTU) and multi-provider utility billing web & mobile application engineered for the Nigerian market.</strong></p>

  <p align="center">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
    <img src="https://img.shields.io/badge/Release-v1.0.0-blue?style=for-the-badge" />
  </p>
</div>

---

## ⚡ Overview

**SaukiGlobal Mobile** is a responsive, fintech-grade mobile web client engineered to deliver instant digital services with zero latency. It interfaces with modern telecommunications and billing endpoints to provide automated airtime top-ups, discounted SME/Corporate data plans, cable TV subscriptions, educational verification tokens, and electricity utilities across Nigeria.

---

## 🚀 Key Features

* **⚡ Zero-Refresh Live Wallet:** Real-time wallet balance reconciliation and instant funding reflection without manual page reloads.
* **📡 Auto-Carrier Detection:** Smart phone number prefix parser automatically identifies Nigerian telco carriers (MTN, Airtel, Glo, 9mobile) to prevent misrouted transactions.
* **📊 Dynamic Plan Catalog:** Fetches live pricing tiers for SME, Gifting, and Corporate data packages with instant plan ID mapping.
* **📺 Smart TV & Utility Validation:** Pre-payment validation engine for DSTV, GOTV, and Startimes smartcards, as well as prepaid electricity meter checks (KEDCO, AEDC, etc.).
* **🎓 Educational Exam Pins:** Automated instant generation and token delivery for WAEC, NECO, and JAMB registration/result checker pins.
* **📢 In-App Banner & Release Sync:** Remote configuration parsing for real-time announcements, maintenance notices, and critical version updates.
* **🔄 Dual Mode API Client:** Toggle seamlessly between an offline mock data simulation engine and live production API services.

---

## 🛠️ Tech Stack & Tooling

* **Framework:** React 18, Vite
* **Language:** TypeScript
* **Styling:** Tailwind CSS, Lucide React Icons
* **State & Networking:** Client-side modular storage, Fetch API abstraction with bearer authentication and response typing

---

## 📂 Project Architecture

```
saukiglobal-mobile/
├── src/
│   ├── components/      # UI Views (AuthPage, Dashboard, Services, Modals)
│   │   ├── profile/     # Security, Password, Transaction PIN management
│   │   └── InAppBannerModal.tsx # Version-based remote notice engine
│   ├── services/
│   │   └── api.ts       # Unified API client handling Auth, Services & VTU calls
│   ├── types.ts         # Comprehensive TypeScript interfaces & domain models
│   ├── App.tsx          # Centralized router, push notification & state hub
│   └── main.tsx         # Application entry point
├── .env.example         # Template for environment configuration
└── LICENSE              # Open-source MIT License
```

---

## ⚡ Quickstart & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/mubarakkasimmaishanu/saukiglobal-mobile.git
cd saukiglobal-mobile
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

```env
# Production API endpoint or local backend
VITE_API_BASE_URL="https://api.saukiglobal.com/v1"

# Set to 'true' to run fully offline with simulated mock data
VITE_USE_MOCK=false
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Authored & Maintained by <a href="https://github.com/mubarakkasimmaishanu"><strong>Mubarak Kasim Mashanu</strong></a>
</p>
