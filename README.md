<div align="center">

# Applirank

**The open-source ATS you own. No per-seat fees. No data lock-in. No secret algorithms.**

[Live Demo](https://demo.applirank.com) · [Documentation](ARCHITECTURE.md) · [Roadmap](ROADMAP.md) · [Report Bug](https://github.com/applirank/applirank/issues/new)

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)

</div>

---

Most recruiting software holds your candidate data hostage behind per-seat pricing and opaque algorithms. Applirank is different — it runs on **your** infrastructure, your team scales without increasing your software bill, and when AI ranks a candidate, it shows you exactly why.

## Why Applirank?

| | **Applirank** | Greenhouse | Lever | Ashby | OpenCATS |
|---|:---:|:---:|:---:|:---:|:---:|
| **Open source** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Self-hosted** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **No per-seat pricing** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Own your data** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Transparent AI ranking** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Modern tech stack** | Nuxt 4 / Vue 3 | — | — | — | PHP 5 |
| **Active development** | ✅ 2026 | ✅ | ✅ | ✅ | ❌ Stale |
| **Resume parsing** | 🔜 | ✅ | ✅ | ✅ | ❌ |
| **Pipeline / Kanban** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Public job board** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Document storage** | ✅ MinIO | ✅ | ✅ | ✅ | ✅ |
| **Custom application forms** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Local AI (privacy-first)** | 🔜 Ollama | ❌ | ❌ | ❌ | ❌ |

## Features

- **Job management** — Create, edit, and track jobs through draft → open → closed → archived
- **Candidate pipeline** — Drag candidates through screening → interview → offer → hired with a Kanban board
- **Public job board** — SEO-friendly job listings with custom slugs that applicants can browse and apply to
- **Custom application forms** — Add custom questions (text, select, file upload, etc.) per job
- **Document storage** — Upload and manage resumes and cover letters via S3-compatible storage (MinIO)
- **Multi-tenant organizations** — Isolated data per organization with role-based membership
- **Recruiter dashboard** — At-a-glance stats, pipeline breakdown, recent applications, and top active jobs
- **Server-proxied documents** — Resumes are never exposed via public URLs; all access is authenticated and streamed

## Quick Start

You only need **Git** and **Docker** (with Docker Compose). No Node.js required.

```bash
git clone https://github.com/applirank/applirank.git
cd applirank
./setup.sh           # generates .env with random secrets
docker compose up    # builds the app and starts everything
```

That's it. Open **http://localhost:3000**.

> **Windows?** Run `setup.sh` in Git Bash, or see the [manual setup](#manual-env-setup) below.

Migrations and the S3 bucket are created automatically on first boot.

### Seed demo data (optional)

Once the app is running, create a demo account in a second terminal:

```bash
docker compose exec app npm run db:seed
# Login: demo@applirank.com / demo1234
```

### Local URLs

| Service | URL | Notes |
|---------|-----|-------|
| **App** | [localhost:3000](http://localhost:3000) | |
| **MinIO Console** | [localhost:9001](http://localhost:9001) | S3 browser |
| **Adminer** (DB browser) | [localhost:8080](http://localhost:8080) | Run with `--profile tools` (see below) |

### Stopping and restarting

```bash
docker compose down        # stop (keeps data)
docker compose up          # start again (no rebuild needed)

docker compose up --build  # rebuild the app image (after code changes)
docker compose down -v     # stop + delete all data
```

### Adminer (optional DB browser)

Adminer is hidden by default to keep `docker compose up` clean. Enable it with:

```bash
docker compose --profile tools up
# Adminer → http://localhost:8080
# System: PostgreSQL | Server: db | Username/Password: from your .env
```

### Manual .env setup

If `setup.sh` isn't available (Windows CMD, CI, etc.), create `.env` manually:

```bash
cp .env.example .env
```

Then replace the placeholder values:

| Variable | How to generate |
|----------|----------------|
| `DB_PASSWORD` / `STORAGE_PASSWORD` | Any random string |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |

The `DATABASE_URL` and `S3_ENDPOINT` in `.env` are for host tools (e.g. `drizzle-kit`). Docker Compose automatically uses the correct internal hostnames for the app container — no manual editing needed.

### Troubleshooting

| Problem | Fix |
|---------|-----|
| `docker: command not found` | Docker isn't installed or Docker Desktop isn't running |
| App shows connection error | Wait 30 s for the first build to finish, then reload |
| Port 3000 / 5432 already in use | Stop the conflicting process or change the port in `docker-compose.yml` |
| S3 / upload errors | Run `docker compose logs minio` — MinIO may still be starting |
| Need to change a secret | Edit `.env`, then `docker compose up --build` |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Nuxt 4](https://nuxt.com) (Vue 3 + Nitro) |
| Database | PostgreSQL 16 |
| ORM | [Drizzle ORM](https://orm.drizzle.team) + postgres.js |
| Auth | [Better Auth](https://www.better-auth.com) with organization plugin |
| Storage | [MinIO](https://min.io) (S3-compatible) |
| Validation | [Zod v4](https://zod.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Icons | [Lucide](https://lucide.dev) (tree-shakeable) |

## Project Structure

```
app/                          # Frontend (Nuxt 4 srcDir)
  pages/                      #   File-based routing
  components/                 #   Auto-imported Vue components
  composables/                #   Auto-imported composables (useJobs, useCandidates, etc.)
  layouts/                    #   Dashboard, auth, and public layouts
server/                       # Backend (Nitro)
  api/                        #   REST API routes (authenticated + public)
  database/schema/            #   Drizzle ORM table definitions
  database/migrations/        #   Generated SQL migrations
  utils/                      #   Auto-imported utilities (db, auth, env, s3)
  plugins/                    #   Startup plugins (migrations, S3 bucket)
Dockerfile                    # Multi-stage build for the app container
docker-compose.yml            # App + Postgres + MinIO (+ optional Adminer)
setup.sh                      # One-time secret generator → writes .env
```

## Deployment

Applirank is designed to run on a single VPS. The reference deployment uses:

| Component | Role |
|-----------|------|
| **Hetzner Cloud CX23** | 2 vCPU, 4GB RAM, Ubuntu 24.04 (~€5/mo) |
| **Caddy** | Reverse proxy with automatic HTTPS |
| **Cloudflare** | DNS, DDoS protection, edge SSL (free tier) |
| **Docker Compose** | Postgres + MinIO (localhost only) |
| **systemd** | Process management with auto-restart |

### Deploy

```bash
ssh deploy@your-server '~/deploy.sh'
# Pulls latest code, installs, builds, restarts — zero downtime
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full deployment architecture diagram.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:generate` | Generate migrations from schema changes |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Drizzle Studio (database browser) |

## Roadmap

Applirank is actively developed. Here's what's next:

| Status | Milestone |
|--------|-----------|
| ✅ Shipped | Jobs, Candidates, Applications, Pipeline, Documents, Dashboard, Public Job Board, Custom Forms |
| 🔨 Building | Resume parsing (PDF → structured data) |
| 🔮 Planned | AI candidate ranking (Glass Box — shows matching logic), team collaboration, email notifications, candidate portal |

See the full [Roadmap](ROADMAP.md) and [Product Vision](PRODUCT.md).

## Contributing

Applirank is in early development and contributions are welcome. Check [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, DCO sign-off requirements, and submission guidelines.

## License

Licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE).
