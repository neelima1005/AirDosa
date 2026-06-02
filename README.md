# AirDosa — AI-Powered Instant Dosa Delivery Drones

Next.js landing page for AirDosa, converted from the original single-file `index.html`.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## GitHub Actions

This repo includes two workflows:

| Workflow | File | Purpose |
|----------|------|---------|
| **CI** | `.github/workflows/ci.yml` | Lint and build on every push/PR to `main` |
| **Deploy** | `.github/workflows/deploy.yml` | Build and publish to GitHub Pages on push to `main` |

### Enable GitHub Pages (one-time setup)

1. Push this repo to [github.com/neelima1005/Live_Air_Dosa](https://github.com/neelima1005/Live_Air_Dosa).
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. After the next push to `main`, the **Deploy to GitHub Pages** workflow will publish the site.

Live URL: **https://neelima1005.github.io/Live_Air_Dosa/**

## Project structure

```
app/
  layout.js    # Root layout, fonts, metadata
  page.js      # Main landing page (client component)
  globals.css  # All styles from the original HTML
public/        # Static assets (hero image, etc.)
index.html     # Original source file (kept for reference)
```
