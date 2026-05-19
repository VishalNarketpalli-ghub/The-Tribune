# Backend — Blog App

This document explains how to run and deploy the Backend API. It covers environment variables, key endpoints, technology choices, and production recommendations.

Technologies

- Node.js (ES modules)
- Express 5
- MongoDB with Mongoose
- Authentication: JWT (`jsonwebtoken`)
- Password hashing: `bcrypt`
- File uploads: `multer` (multipart handling) + `cloudinary` for storage
- Other libs: `cors`, `cookie-parser`, `dotenv`, `nodemon` (dev)

Repository layout (important files)

- `server.js` — app entrypoint and Express setup
- `APIs/` — route handlers: `AdminAPI.js`, `AuthorAPI.js`, `CommonAPI.js`, `UserAPI.js`
- `Models/` — Mongoose models: `ArticleModel.js`, `UserModel.js`
- `middlewear/` — auth and role checks: `verifyToken.js`, `checkUser.js`, `checkAuthor.js`
- `config/` — integration helpers: `cloudinary.js`, `cloudinaryUpload.js`, `multer.js`
- `scripts/` — helper scripts like `createAdmin.js`

Environment variables
Create a `.env` file in `Backend/` (do not commit). Example values:

MONGO_URI=mongodb+srv://<user>:<pass>@cluster.example.mongodb.net/blog-app
PORT=5000
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

Development commands

- Install dependencies: `npm install`
- Start server (production-style): `npm run start`
- Create admin user (dev helper): `npm run create-admin`

API overview
The backend exposes REST endpoints grouped by functionality. Refer to the `APIs/` files for exact routes and request/response schemas.

- Authentication: register, login (JWT issued as cookie and/or response). Protect routes with `verifyToken` middleware.
- Users: profile retrieval and update.
- Authors: author-specific endpoints and article management.
- Articles: CRUD operations, image upload using `multer` + Cloudinary.
- Admin: admin-only operations to manage users and site content.

Security and best practices

- Use HTTPS in production and set cookies to `Secure` + `HttpOnly` where applicable.
- Store secrets in a secure secret manager; rotate keys regularly.
- Validate and sanitize all input. Use schemas or validation middleware.
- Rate-limit public endpoints and add abuse detection.
- Limit file upload size and validate mime types in `multer`.

Deployment recommendations

- Containerize with Docker; run behind a reverse proxy (NGINX) that handles TLS.
- Use a process manager (PM2) as fallback for simple VPS deploys.
- Use a managed MongoDB (Atlas) with daily backups and monitoring.
- Configure environment-specific settings via environment variables and CI secrets.

Logging, monitoring, backups

- Add structured logging (Winston) and centralize logs.
- Connect error monitoring (Sentry) for exception tracking.
- Implement regular DB backups and retention.

Useful tips for this codebase

- `cloudinaryUpload.js` contains helpers to push images to Cloudinary — ensure Cloudinary credentials are set.
- `multer.js` is used to parse multipart form data — tune `limits` according to your needs.
- `verifyToken.js` expects `JWT_SECRET` to validate tokens.

### Backend development

1. Create git Repository
    - `git init`

2. add .gitignore
    - `node_modules`
    - `env`

3. Create .env file for environment variables
   read Date from .env with dotenv module
    - `npm install dotenv`

4. Generate package.json
    - `npm init -y`

5. Create express application
    - `npm install express`

6. Connect to database
    - `npm install mongoose`

7. Add middlewares
   body parser, error handler

8. Design Schema and Models
9. Design REST APIs for all resources

### Regestration & login

10. As register method is common in user, author we write a function and export it

### -----------
