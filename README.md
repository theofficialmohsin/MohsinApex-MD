# MohsinApex-MD – WhatsApp Bot

**MohsinApex-MD** is a powerful, multi‑device WhatsApp bot built by **Mohsin Raza** (Full Stack Developer). It offers over 200 commands, AI integration, media downloads, group management, economy, games, and a web dashboard – all production‑ready.

## Bot Information

- **Bot Name:** MohsinApex-MD
- **Owner:** Mohsin Raza
- **Contact:** +923254834280
- **Email:** talkmohsin.pk@gmail.com

## Features

- Multi‑device support (QR & Pair Code)
- Auto‑reconnect, session persistence
- 200+ commands (AI, downloads, groups, utilities, fun, economy, games)
- Web dashboard (command manager, stats, uptime)
- MongoDB + JSON database
- Premium system, owner controls
- Anti‑spam, anti‑flood, anti‑link, and more
- Easy deployment (Render, Railway, VPS, Docker, PM2)

## Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/MohsinRaza/mohsinapex-md.git
   cd mohsinapex-md
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in your API keys and settings.

4. Start the bot:
   ```bash
   npm start
   ```

## Dashboard

The dashboard runs on port `3000` by default (configurable). Access it via `http://your-server:3000` with the credentials set in `.env`.

## API Configuration

Add your API keys for AI services (OpenAI, Gemini, DeepSeek, Claude) and download services (YouTube, TikTok, Instagram, etc.) in the `.env` file.

## Deployment

- **VPS:** Use PM2 (`pm2 start ecosystem.config.js`).
- **Docker:** `docker build -t mohsinapex-md . && docker run -d mohsinapex-md`
- **Render/Railway:** Set environment variables and deploy from GitHub.

## Command List

For a full list of commands, visit the dashboard's **Command Manager** or type `.menu` in the bot chat.

---

Built with ❤️ by Mohsin Raza