# Image Background Remover

A modern web app to remove image backgrounds instantly using the Remove.bg API.

## Features

- **Drag & Drop Upload** — drag or click to upload JPG, PNG, WebP (max 10MB)
- **Background Removal** — powered by Remove.bg API
- **Side-by-Side Preview** — compare original vs. result
- **Transparent Background** — shown with checkerboard pattern
- **Background Replacement** — pick white, black, blue, red or any custom color
- **One-Click Download** — saves as `removed-bg-{filename}.png`
- **Usage Tracker** — counts daily uses via localStorage (free tier: 50/month)

## Tech Stack

- **Next.js 14** — App Router + API Routes
- **TailwindCSS** — utility-first styling
- **TypeScript** — strict mode

## Getting Started

1. Copy env file and add your API key:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and set REMOVEBG_API_KEY=your_key
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `REMOVEBG_API_KEY` | Your Remove.bg API key ([get one here](https://www.remove.bg/api)) |

## API Route

`POST /api/remove-bg`

Accepts `multipart/form-data` with field `image_file`. Proxies to Remove.bg API and returns PNG binary on success, or `{ error, code }` JSON on failure.

## Deployment

Compatible with Vercel, Cloudflare Pages + Workers, or any Node.js host.
