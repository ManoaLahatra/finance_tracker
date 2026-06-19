# Personal Finance Tracker

Full-stack personal finance tracker built with React, Vite, TypeScript, and Express.

## Setup

Requirements:

- Node `22.13.1`
- npm `11.13.0`

```bash
npm ci
npm run dev
```

Useful commands:

```bash
npm run lint
npm run test:ci
npm run build
npm run serve
```

Local routes:

- `http://localhost:3000` renders the web application.
- `http://localhost:3000/api` serves the REST API.

## CI/CD

GitHub Actions runs on pull requests and pushes to `main` or `master`:

1. `npm ci`
2. `npm run lint`
3. `npm run test:ci`
4. `npm run build`

Vercel is configured through `vercel.json` to install with `npm ci` and build with `npm run build`.
The `api/` directory contains Vercel serverless functions, while `server/` supports the local Express development server.

Recommended Git flow:

- Work on short-lived feature branches.
- Open a pull request before merging to `main`.
- Keep `package-lock.json` committed for reproducible CI and Vercel installs.
- Do not commit generated folders such as `node_modules` or `dist`.
