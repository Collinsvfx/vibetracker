# 🛸 VibeTracker

**Sentient Memecoin Intelligence & Sentinel System**

A full-stack Next.js application designed to scan, analyze, and monitor the memecoin jungle. VibeTracker doesn't just show you tokens; it gives you the tools to survive and profit.

---

## ⚡ Key Features

*   **🔥 Trending Feed**: Real-time scan of tokens with community momentum (Solana & Base).
*   **🛡️ Safety Score**: Automated risk assessment (Safest, Riskiest, Newest) based on liquidity, volume, and age.
*   **🔮 Crystal Ball**: 24h price projections based on current momentum (standardized at a $10 baseline).
*   **🛡️ Deep Scan (RugCheck)**: Direct integration with external security tools for contract verification.
*   **🧮 Profit Calculator**: Real-time ROI and Net Gain tracking (subtracting fees and gas automatically).
*   **💊 DEX Badges**: Visual indicators for Pump.fun and other DEX origins.
*   **🛰️ The Sentinel**: Background monitoring that sends Telegram alerts the moment your tokens hit a profit target.

---

## 📚 Guides & Strategy

*   **[🎯 Sniper Trading Strategy (TRADE.md)](./TRADE.md)**: A beginner-friendly guide on when to enter, when to exit, and how to avoid rugs.
*   **[🚀 Vercel Deployment Guide (DEPLOY.md)](./DEPLOY.md)**: How to host this app and set up automated monitoring for free.

---

## 🚀 Getting Started (Local)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Database & Local Environment
1.  **Supabase**: Create a project, run the SQL in `supabase/schema.sql`, and get your API keys.
2.  **Environment**: Copy `.env.local.example` to `.env.local` and fill in:
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `TELEGRAM_BOT_TOKEN`
    *   `CRON_SECRET`

### 3. Run the App
```bash
npm run dev
```

---

## 🎨 Technology Stack
*   **Framework**: Next.js 14
*   **Database**: Supabase
*   **Styling**: Tailwind CSS + Custom Glassmorphism
*   **Icons**: Lucide React
*   **Charts**: TradingView Embeds

---
*Disclaimer: Not financial advice. VibeTracker is a tool for data analysis. Always do your own research.*
