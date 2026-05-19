# Frontend — Blog App (Vite + React)

This document explains how to run, build, and deploy the frontend single-page application.

Technologies

- React 19 (Vite)
- Vite for dev server and production builds
- Tailwind CSS for styling
- Routing: `react-router`
- Forms: `react-hook-form`
- State: `zustand` for auth state
- HTTP client: `axios`
- Notifications: `react-hot-toast`

Structure (important files)

- `src/main.jsx` — app bootstrap
- `src/App.jsx` — top-level routing
- `src/Components/` — UI and page components, e.g., `Login.jsx`, `Register.jsx`, `Articles.jsx`, `ArticleById.jsx`, `AddArticles.jsx`, `EditArticle.jsx`, `ProtectedRout.jsx`, and profile/admin pages.
- `src/Store/authStore.js` — client-side auth state and helpers

## Development

1. Install dependencies

    npm install

2. Run dev server

    npm run dev

The Vite dev server runs on `http://localhost:5173` by default.

Environment (connecting to Backend)

- In development, set the API base URL (e.g., `VITE_API_URL`) in an `.env` file in `Frontend/` as `VITE_API_URL=http://localhost:5000`.
- Vite exposes env vars prefixed with `VITE_` to the client.

## Build & Production

1. Produce an optimized build:

    npm run build

2. Preview build locally:

    npm run preview

3. Deploy static files to a CDN / static host (Netlify, Vercel, S3 + CloudFront) or serve from a backend static server (Nginx).

Deployment recommendations

- Serve built static files behind a CDN for low latency and caching.
- Configure the host to fallback to `index.html` for client-side routing.
- Set security headers (CSP, HSTS) at CDN/load balancer.

Production concerns

- Keep API base URL and any third-party keys in secure environment variables on the host.
- Use HTTPS and ensure cookies/tokens follow secure practices.
- Do not store secrets in client code; only public, non-sensitive third-party keys should be exposed.

Testing & CI

- Add unit and integration tests for critical components.
- Use GitHub Actions to run `npm ci`, `npm run lint`, and `npm run build` on pull requests.

Notes about this codebase

- `ProtectedRout.jsx` wraps pages requiring authentication — ensure tokens are refreshed/validated server-side.
- `AddArticles.jsx` and `EditArticle.jsx` interact with the backend file upload endpoints — follow `multer` limits from the backend.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

```txt

    cdn server
    perfermonce enhanced , why?, How?
    ex : cloudinary
    these provide cloud services -> simple free

    client is making a post request
        => Content type is added to the req
        => Required for fetch -> added to teh header
        => HTTP can retreive the data using body parser middlewear like express.json() -> req.body
        => Json cannot transfer the binary data
        => We use form data -> Browser Api -> allows to send text + binary dsta -> multipart (multimedia content)/formdata -> if we use fetch we need to pick this
        => Multer is used to extract the file data -> req.file contains the multer data
        => we dont store the binary data in db -> we use cloud services like cloudinary or aws
        => We need to store the data temp folder -> not a good idea -> performance issues
        => we can stor in memory for temp -> but can lead to memory issues -> solution : limit the size
        => React can directly communicate with cloudinary (Beta version of cloudinary)

        => Every event handeler function recieves the event implisitly
        => Event is not a function it sends event automatically



```

### Reload handeling

```txt

=> when we reload the page is behaving abnormal

=> when we reload from the user profile it takes us back to login as we went to profile fron login
```
