# Crestoak E-Learning Survey App — Deployment Guide

This is your survey app, restructured into a real, standalone website project
(Vite + React + Tailwind + Recharts), with Supabase added as the shared
database so responses from every device show up on one dashboard.

Follow the steps in order. It takes about 15–20 minutes the first time.

---

## Part 1 — Create the free database (Supabase)

1. Go to https://supabase.com and sign up (free tier is enough).
2. Click **New project**. Pick any name (e.g. `crestoak-survey`), set a
   database password (save it somewhere), choose a region close to you, and
   click **Create new project**. Wait ~2 minutes for it to finish setting up.
3. In the left sidebar, click the **SQL Editor** icon, then **New query**.
4. Open `supabase-setup.sql` (included in this folder), copy all of it, paste
   it into the query editor, and click **Run**. This creates the `responses`
   table and the security rules that let respondents submit and everyone view
   results, without allowing anyone to edit or delete existing responses.
5. In the left sidebar, click **Project Settings > API**. You'll need two
   values from this page in Part 3:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

---

## Part 2 — Put the code on GitHub

If you don't have a GitHub account, create one free at https://github.com.

**Easiest method — no command line needed:**

1. Go to https://github.com/new
2. Name the repository `crestoak-elearning-survey` (or anything you like),
   set it to **Public** or **Private** (either works with Vercel), and click
   **Create repository**.
3. On the new repo's page, click **uploading an existing file**.
4. Drag in every file and folder from this project (unzip it first) —
   `src/`, `index.html`, `package.json`, `vite.config.js`,
   `tailwind.config.js`, `postcss.config.js`, `.gitignore`, and
   `supabase-setup.sql`. Do **not** upload `.env` if you create one locally —
   it's already excluded by `.gitignore`.
5. Scroll down and click **Commit changes**.

(If you're comfortable with git instead, the usual `git init`, `git add .`,
`git commit -m "initial commit"`, `git remote add origin <repo-url>`,
`git push -u origin main` works too.)

---

## Part 3 — Deploy on Vercel

1. Go to https://vercel.com and sign up using your **GitHub account** (this
   makes the next step automatic).
2. Click **Add New... > Project**.
3. Find your `crestoak-elearning-survey` repo in the list and click
   **Import**. Vercel will auto-detect it as a Vite project — leave the
   build settings as they are.
4. Before clicking Deploy, open the **Environment Variables** section and
   add these two (from Part 1, step 5):

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | your Project URL |
   | `VITE_SUPABASE_ANON_KEY` | your anon public key |

5. Click **Deploy**. Wait about a minute.
6. Once it finishes, Vercel gives you a live link like
   `https://crestoak-elearning-survey.vercel.app` — that's your public,
   shareable survey link. Anyone with it can open **Take Survey** on their
   own phone or laptop, and everyone who opens **View Results** sees the
   same live, combined dashboard.

---

## Updating it later

Any time you edit the code and push the change to GitHub (or upload new
files the same way as Part 2), Vercel automatically rebuilds and redeploys
the live link within a minute or two — nothing else to do.

## Exporting your data for the project report

In Supabase, go to **Table Editor > responses**, and use the **Export**
button (top right) to download all responses as CSV — convenient for
recomputing frequency tables in Excel or SPSS if needed for the project
appendix.
