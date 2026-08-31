# Expenses

A private personal expense tracker: React + TypeScript + Vite frontend, dashboard with
charts, and full CRUD for expenses, categories, and payment methods/accounts.

This project intentionally reuses the same deployment and access-control architecture as
[SubTrack](https://github.com/panpapadopoulos/subtrack):

- The frontend is a static Vite build, deployed to **GitHub Pages** by a GitHub Actions
  workflow on every push to `main`.
- A single **Cloudflare Worker**, mapped to the custom domain, sits in front of it. It:
  - gates every request behind a password/cookie login it implements itself,
  - proxies authenticated page requests through to the GitHub Pages origin,
  - serves `/api/data` (GET/POST), backed by a **Cloudflare KV** namespace, which is where
    your real expense data lives.
- Nothing sensitive — no password, no expense data — is ever committed to this repo.

## Privacy

- This repository contains **no real expenses, no credentials, no account details**.
- The data model (expenses/categories/accounts) ships with a small set of generic default
  categories and accounts (e.g. "Groceries", "Cash") purely as starter UI content — not
  real financial data.
- Your actual data is stored **only** in a Cloudflare KV namespace, reachable only through
  the password-protected Worker. It never touches Git.
- The login password and the KV binding are configured directly on the Cloudflare Worker
  (dashboard or `wrangler secret put`), never in this repo.

## Local Development

Prerequisites: Node.js (18+).

```bash
npm install
npm run dev
```

This starts the Vite dev server. Note that `/api/data` only exists once the Cloudflare
Worker is deployed — locally, the app will fail to fetch data and fall back to an empty
data set, which is fine for UI development. To develop against real data locally, point
`API_URL` in [services/dataService.ts](services/dataService.ts) at your deployed Worker,
or use `wrangler dev` against the worker script with a local KV namespace.

Build for production:

```bash
npm run build
```

## Data Model

Each expense has: date, merchant/description, amount, category, payment method/account,
and optional notes. Categories and accounts are freely editable — add, rename (with a
color, for categories), or delete them from the **Categories** and **Accounts** pages.

## Deployment

Everything below is a **one-time manual setup**, mirroring exactly how SubTrack is wired
up. After this is done once, `git push` to `main` is all you need for future frontend
updates.

### 1. GitHub repository

1. Create a **public** GitHub repository named `expenses` (public is required for GitHub
   Pages on a free personal plan — this is fine, since no private data ever lives in Git).
2. Push this project to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/expenses.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages → Build and deployment → Source** and select
   **GitHub Actions**. (The workflow at
   [.github/workflows/deploy.yml](.github/workflows/deploy.yml) is already included — it
   builds the Vite app and publishes `dist/` to Pages on every push to `main`.)
4. After the first successful run, your build is live at
   `https://<your-username>.github.io/expenses/`. You never link people to this URL
   directly — it's just the origin the Worker proxies from `expenses.panagiotispapadopoulos.com`
   (a redirect in `index.html` bounces any direct visit there back to the real domain).

> If your GitHub username differs from `panpapadopoulos`, update `GITHUB_ORIGIN` in
> [cloudflare-worker.js](cloudflare-worker.js) and the redirect target in
> [index.html](index.html) accordingly.

### 2. Cloudflare Worker

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Worker**. Name it
   `expenses` (or similar) and deploy the default template.
2. Open the Worker's **Edit code** view, replace its contents with the full contents of
   [cloudflare-worker.js](cloudflare-worker.js) from this repo, and **Deploy**.
3. Create a KV namespace: **Workers & Pages → KV → Create namespace**, name it e.g.
   `EXPENSES_DATA`.
4. Bind it to the Worker: Worker **Settings → Variables → KV Namespace Bindings → Add
   binding**. Variable name **must be** `EXPENSES_DATA` (matches `env.EXPENSES_DATA` in
   the worker code), bound to the namespace you just created.
5. Add the login password as a secret: Worker **Settings → Variables → Environment
   Variables → Add variable**, name `PASSWORD`, mark it **Encrypt**, and set it to a
   strong password of your choice. (Equivalent CLI: `wrangler secret put PASSWORD`.)
6. Add the custom domain: Worker **Settings → Triggers → Custom Domains → Add Custom
   Domain**, enter `expenses.panagiotispapadopoulos.com`. If `panagiotispapadopoulos.com`
   is already on this Cloudflare account (it is, since SubTrack uses it), Cloudflare
   creates the required DNS record automatically.

### 3. Verify

Visit `https://expenses.panagiotispapadopoulos.com`, enter the password you set, and
confirm the app loads and you can add/edit/delete an expense (check the Worker's KV
namespace in the dashboard to confirm data is actually being persisted).

### Updating the deployed app

- **Frontend changes**: just `git push` to `main` — GitHub Actions rebuilds and
  redeploys to GitHub Pages automatically, and the Worker proxies the new build
  immediately (no cache to bust).
- **Worker changes** (`cloudflare-worker.js`): there's no CI for the Worker (matching
  SubTrack) — after editing it, re-paste the file into the Cloudflare dashboard's Worker
  editor and Deploy.
