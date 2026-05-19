# Capstone Project — Blog App

This repository contains a full-stack blogging application (Backend + Frontend). This top-level README gives a high-level overview, quick start, and production considerations. More detailed developer guides live in `Backend/README.md` and `Frontend/README.md`.

## Contents

- `Backend/` — Node.js + Express API, MongoDB models, authentication, file uploads (Cloudinary), middleware.
- `Frontend/` — React (Vite) single-page app, Tailwind CSS, client-side routing and forms.

## Quick start (development)

1. Copy `.env` files into `Backend/` and provide values (see `Backend/README.md`).
2. Start backend:

    cd Backend
    npm install
    npm run start

3. Start frontend:

    cd Frontend
    npm install
    npm run dev

## Project structure and responsibilities

- Backend: provides REST API endpoints (users, authors, articles, admin tasks), authentication (JWT), file upload/processing (multer + Cloudinary), and MongoDB persistence using Mongoose.
- Frontend: React application using Vite, client-side routing, form handling with `react-hook-form`, global auth state with `zustand`, and API calls via `axios`.

## Production checklist (high level)

- Environment: store secrets in a secure secret manager (Azure Key Vault, AWS Secrets Manager, or environment variables on your host).
- Database: use managed MongoDB (Atlas) or a properly backed-up and monitored MongoDB instance.
- HTTPS: terminate TLS at load balancer or reverse proxy (NGINX) and redirect HTTP to HTTPS.
- CORS: configure strictly to allow only required origins.
- Logging & monitoring: integrate centralized logs (e.g., Winston -> ELK / Papertrail) and application monitoring (Sentry, Prometheus, New Relic).
- Scaling: run backend behind a process manager (PM2) or container orchestrator (Kubernetes); scale frontend as static assets served by CDN.
- Security hardening: refresh dependencies, set HTTP security headers, rate limiting, input validation, and sanitize file uploads.

## Where to go next

- See `Backend/README.md` for backend setup, env variables, APIs, and deployment notes.
- See `Frontend/README.md` for frontend setup, build, and deployment notes.
