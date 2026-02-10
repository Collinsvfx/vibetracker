# 🛸 VibeTracker

**Memecoin Intelligence & Sentinel System**

A full-stack Next.js application that scans for trending tokens on DexScreener, allows you to bookmark/monitor them ("Vault"), and sends real-time Telegram alerts when they moon ("Sentinel").

## 🛠️ Prerequisites

**Crucial**: You need to install **Node.js** to run this application.
1.  Download Node.js (LTS version) from [nodejs.org](https://nodejs.org/).
2.  Install it and restart your terminal.

## 🚀 Getting Started

### 1. Install Dependencies
Open a terminal in this folder (`vibetracker`) and run:
```bash
npm install
```

### 2. Set up Supabase (Database)
1.  Create a project at [supabase.com](https://supabase.com).
2.  Go to the **SQL Editor** in your Supabase dashboard.
3.  Copy the contents of `supabase/schema.sql` and run it to create the `watchlist` table.
4.  Get your **Project URL** and **Anon Key** from Project Settings > API.

### 3. Set up Environment Variables
1.  Copy `.env.local.example` to `.env.local`:
    ```bash
    cp .env.local.example .env.local
    # Or manually rename the file
    ```
2.  Fill in your Supabase credentials in `.env.local`.
3.  (Optional) Add your `TELEGRAM_BOT_TOKEN` if you want alerts.

### 4. Run the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## ⚡ Features

*   **Scanner**: Live feed of trending tokens on Solana and Base (via DexScreener Token Boosts).
*   **The Vault**: Click the bookmark icon on any token to save it to your Watchlist.
*   **The Sentinel**: A background process monitors your vault.
    *   To test alerts manually, run: `node scripts/test-alerts.js` (requires the app to be running).
    *   In production, you would set up a Cron job to hit `/api/sentinel` every 60s.

## 🎨 Design
Built with **Next.js 14**, **Tailwind CSS**, and **Framer Motion**.
Featuring a "Dark Mode" aesthetic with neon purple/violet accents and glassmorphism cards.
