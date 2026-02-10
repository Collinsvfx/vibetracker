# Vercel Deployment Guide: VibeTracker 🚀

This guide outlines the steps to push your Sentient Memecoin Intelligence system from your local machine to the global stage on Vercel.

## 🛠️ Step 1: Prep the Repository
Before deploying, ensure your code is pushed to a Git provider (GitHub).

1.  **Initialize Git**: `git init`
2.  **Add all files**: `git add .`
3.  **Commit**: `git commit -m "🚀 Ready for deployment"`
4.  **Push to GitHub**: `git push origin main`

## ☁️ Step 2: Deploy to Vercel
1.  Go to [vercel.com](https://vercel.com) and log in.
2.  Click **"Add New"** > **"Project"**.
3.  Import your VibeTracker repository.
4.  **CRITICAL: Environment Variables**
    Before clicking "Deploy", expand the "Environment Variables" section and add the following:

    | Key | Value |
    | :--- | :--- |
    | `NEXT_PUBLIC_SUPABASE_URL` | (From your Supabase settings) |
    | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (From your Supabase settings) |
    | `TELEGRAM_BOT_TOKEN` | (Your Bot Token) |
    | `CRON_SECRET` | (A random string you choose) |

5.  Click **"Deploy"**.

## 👁️ Step 3: Set up The Sentinel (Monitoring)
> [!WARNING]
> If you are on a **Vercel Hobby (Free)** account, built-in cron jobs can only run **once per day**.

### Option A: Once Per Day (Vercel Built-in)
The included `vercel.json` is set to run daily at midnight. This is "set and forget" but slow for memecoins.

### Option B: Real-Time Monitoring (Recommended)
To monitor prices every 10 minutes for free:
1.  Go to [Cron-job.org](https://cron-job.org).
2.  Set up a job pointing to: `https://your-app.vercel.app/api/sentinel/check`.
3.  Add an **HTTP Header**: `Authorization: Bearer [Your-CRON_SECRET]`.
4.  Set to run every **10 minutes**.

## ✅ Step 4: Verification
Once deployed, verify:
*   **Scanner**: Navigating to your Vercel URL shows the trending feed.
*   **Vault**: Adding a token saves it to Supabase.
*   **Alerts**: Check `/api/sentinel/check` manually to ensure your Telegram Bot fires.
