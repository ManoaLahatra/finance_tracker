# Finance Tracker

Full-stack personal finance app: Express + React + Prisma + SQLite (dev) / Turso (prod).

## Quick Start

```bash
npm ci
npm run dev
```

Opens at http://localhost:3000. The API is at `/api`.

## What It Does

- Track multiple accounts (checking, savings, cash)
- Log income/expenses/transfers with categories
- Set monthly spending limits per category (warns when exceeded)
- Monthly summary with breakdown by category
- Export transactions to XLSX
- Prevents negative balances

## Project Structure

```
server/        — Express backend (controllers → services → repository → database)
src/           — React frontend (Vite SSR + SPA)
prisma/        — Database schema
api/           — Vercel serverless entry point (esbuild bundle)
```

## Architecture Decisions

**Layered backend:** Controllers handle HTTP, services hold business logic, repository abstracts the database. Makes testing easy — there's an `InMemoryFinanceRepository` used in tests alongside the real `PrismaFinanceRepository`.

**CQRS-lite:** Reads go through `FinanceQueryService`, writes through `AccountService`/`CategoryService`/`TransactionService`. Keeps query logic separate from command logic.

**Two databases, same schema:** Local dev uses SQLite (file: `./dev.db`) via `better-sqlite3`. Production on Vercel uses Turso (edge-hosted libSQL). The Prisma adapter switches based on the `VERCEL` env var in `server/finance/service/financeModule.ts`.

**Serverless on Vercel:** The `api/_handler.ts` is bundled with esbuild into `api/handler.js`. Express app is mounted as a serverless function. SPA routes fall back to `index.html` via `vercel.json` rewrites.

## Trade-offs Worth Knowing

| Choice | Why | Downside |
|---|---|---|
| SQLite locally, Turso in prod | Zero setup for dev, edge-hosted for prod | Slight difference in DB features; Prisma adapter versions must match exactly |
| `@prisma/adapter-libsql@6.19.3` | v6.x API uses `PrismaLibSQL` (capital S); v7+ renamed to `PrismaLibSql` | Pinning to v6 means no newer features |
| `Float` for money | Good enough for personal finance | Not safe for accounting (floating point) |
| Timestamps as `String` | SQLite has no native datetime | No date arithmetic in DB |
| `provider = "sqlite"` in Prisma | Keeps things simple | Can't use Turso CLI `prisma db push` directly — need to generate SQL manually |
| esbuild `--packages=external` | Avoids CJS/ESM conflicts with `exceljs` | Dependencies must be installed on Vercel at runtime |
| Category limit warnings on write | Simple to implement | Doesn't catch overspend across multiple transactions in the same batch |
| Transfers as two transactions | Balance stays accurate | No single "transfer" entity linking the pair |

## Environment Variables

```
DATABASE_URL="file:./dev.db"                                # local
TURSO_DATABASE_URL="libsql://<your-db>.turso.io"            # Vercel
TURSO_AUTH_TOKEN="<token>"                                  # Vercel
```

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run test` | Tests in watch mode |
| `npm run test:ci` | Tests once |
| `npm run lint` | ESLint |
| `npm run build` | Production build (client + server) |

## Deploying to Vercel

1. Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Vercel dashboard
2. Push the Prisma schema to Turso: `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script \| turso db shell <db-name>`
3. Deploy — `vercel.json` handles esbuild bundling and SPA rewrites
