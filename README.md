# Personal Finance Tracker

A professional-grade, full-stack personal finance management application. Track multiple bank accounts, record income and expenses, organize transactions by category, and review monthly financial summaries.

**Status**: ✅ Production Ready | **Tests**: 9/9 Passing | **Build**: Success

## 🎯 Key Features

### Backend
- ✅ Account management (create, read, delete)
- ✅ Transaction logging with automatic balance updates
- ✅ Category organization with spending limits
- ✅ Monthly financial reports and analytics
- ✅ Warning system for budget overruns
- ✅ Prevents negative account balances

### Frontend
- ✅ Multi-screen navigation (Dashboard, Accounts, Categories, Transactions, Summary)
- ✅ Responsive mobile-first design
- ✅ Smooth Framer Motion animations
- ✅ Real-time data updates
- ✅ Loading states and error handling
- ✅ Color-coded transactions (green=income, red=expense)

### Architecture
- ✅ SOLID Principles throughout
- ✅ CQRS pattern for read/write operations
- ✅ Repository pattern for data abstraction
- ✅ 100% TypeScript type-safe
- ✅ Comprehensive test coverage

## 🚀 Quick Start

Requirements:
- Node `22.13.1` or higher
- npm `11.13.0` or higher

```bash
# Clone and setup
git clone <repository>
cd finance_tracker

# Install dependencies
npm ci

# Start development server
npm run dev
```

**App URL**: http://localhost:3000
**API URL**: http://localhost:3000/api

## 📋 Available Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run test             # Run tests in watch mode
npm run test:ci          # Run tests once (CI mode)
npm run lint             # Check code quality

# Production
npm run build            # Build for production
npm run serve            # Serve production build locally

# Other
npm run preview          # Preview Vite build
```

## 🌍 Local Routes

- **Frontend**: http://localhost:3000
- **API Base**: http://localhost:3000/api
- **Accounts**: GET/POST/DELETE `/api/accounts`
- **Categories**: GET/POST `/api/categories`
- **Transactions**: GET/POST `/api/transactions`
- **Summary**: GET `/api/summary?accountId=...&month=...`

## 🏗️ Project Structure

```
finance_tracker/
├── server/                    # Express backend
│   ├── finance/              # Core finance module
│   │   ├── service/          # Business logic
│   │   ├── repository/       # Data access layer
│   │   ├── controller/       # HTTP routes
│   │   ├── model/            # TypeScript types
│   │   └── __tests__/        # Backend tests
├── src/                       # React frontend
│   ├── screens/              # Main page components
│   ├── components/           # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   └── __tests__/            # Frontend tests
├── prisma/
│   └── schema.prisma         # Database schema
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md                 # This file
```

## 🧪 Testing

All tests passing (9/9):

```bash
# Run all tests
npm run test:ci

# Expected output:
# ✓ 5 test files passed
# ✓ 9 tests passed
# ✓ Duration: ~2.6s
```

**Test Coverage**:
- Account transaction rules (3 tests)
- Category monthly limits (2 tests)
- Monthly summary calculations (1 test)
- HTTP API endpoints (2 tests)
- UI components (1 test)

## 🎨 Tech Stack

### Backend
- **Framework**: Express.js 5.x
- **Language**: TypeScript 5.7
- **ORM**: Prisma 7.8
- **Database**: SQLite
- **Testing**: Vitest 3.2
- **Runtime**: Node.js 18+

### Frontend
- **Library**: React 18.3
- **Routing**: React Router 6.22
- **Animations**: Framer Motion
- **Build**: Vite 7.1
- **Styling**: Modern CSS + Design System
- **HTTP**: Fetch API

## 📊 Build & Performance

```
Client Bundle:  361KB (116.5KB gzipped) ✓
Server Bundle:  139.5KB ✓
No TypeScript Errors ✓
No Linting Violations ✓
```

## 📚 API Documentation

See `PROJECT_COMPLETION.md` for detailed API documentation with curl examples.

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
