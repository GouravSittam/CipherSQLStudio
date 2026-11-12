# CipherSQLStudio

**🎮 Created by Gourav Chaudhary**

[![GitHub](https://img.shields.io/badge/GitHub-GouravSittam-blue?style=flat&logo=github)](https://github.com/GouravSittam)

A browser-based SQL learning platform where students can practice SQL queries against pre-configured assignments with real-time execution and intelligent hints. Features a **Brutalist Gaming Theme** with bold, playful, and modern UI design.

## ✨ Features

- 🎮 **Gaming-Inspired UI** - Brutalist/Neo-Brutalism design with bold colors and animations
- 📝 **SQL Challenges** - View assignments with pre-loaded sample data
- 💻 **Monaco Editor** - Write SQL in a professional code editor (Ctrl/Cmd + Enter to run)
- 💡 **AI-Powered Hints** - Get hints (not solutions) from OpenAI or Google Gemini
- 📊 **Real-Time Results** - See query results instantly, with automatic answer checking
- 📝 **Progress Tracking** - Query history and completion status for logged-in users
- 📱 **Mobile-First Design** - Fully responsive across all devices
- ⚡ **Safe Sandbox** - Every query runs in a throwaway PostgreSQL transaction

## 🛠️ Tech Stack

### Frontend

- **React 19** + **TypeScript** with **Vite 8**
- **React Router 8**
- **Monaco Editor** (SQL code editor)
- **SCSS** (Dart Sass, module system) with Brutalist Gaming Theme

### Backend

- **Node.js 22+** & **Express 5** in **TypeScript** (run with `tsx`)
- **zod** for request and environment validation
- **MongoDB** via **Mongoose 9** (assignments, users, progress)
- **PostgreSQL** via `pg` (sandbox query execution)
- **LLM Integration** - OpenAI (Responses API) or Google Gemini (`@google/genai`)
- **Vercel** serverless deployment - the same Express app runs locally and on Vercel

## 📁 Project Structure

```
CipherSQLStudio/
├── api/
│   └── index.ts               # Vercel entry point - exports the Express app
├── server/src/                # Backend (TypeScript)
│   ├── app.ts                 # Express app: middleware + routes
│   ├── index.ts               # Local server entry point
│   ├── config/env.ts          # Validated environment variables
│   ├── db/                    # MongoDB + PostgreSQL connections
│   ├── models/                # Mongoose models
│   ├── middleware/auth.ts     # JWT auth (optional / required / admin)
│   ├── routes/                # auth, assignments, execute, hints, progress
│   ├── services/              # sandbox, grading, AI hints
│   └── scripts/seed.ts        # Database seeding
├── client/                    # React frontend (Vite + TypeScript)
│   ├── public/                # Static assets & CipherSchools logo
│   └── src/
│       ├── components/        # Header, Footer, SQLEditor, ResultsPanel, SampleDataViewer
│       ├── context/           # Auth context
│       ├── pages/             # AssignmentList, AssignmentAttempt, Login, Signup
│       ├── services/api.ts    # Typed API client (axios)
│       ├── styles/            # SCSS (Brutalist Gaming Theme)
│       └── types.ts           # Shared API types
├── package.json               # Backend dependencies + root scripts
├── tsconfig.json              # Backend TypeScript config
└── vercel.json                # API deployment config
```

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- A MongoDB database (e.g. MongoDB Atlas free tier)
- A PostgreSQL database (e.g. Supabase or Neon free tier, or local)
- Optional: an OpenAI or Gemini API key for AI hints

### Installation

```bash
git clone https://github.com/GouravSittam/CipherSQLStudio.git
cd CipherSQLStudio

# Installs backend (root) and frontend (client/) dependencies
npm run install:all
```

### Configuration

Copy `.env.example` to `.env` in the repo root and fill in your values (an existing `server/.env` is still picked up as a fallback):

```env
MONGODB_URI=your_mongodb_connection_string
POSTGRES_HOST=localhost        # or POSTGRES_URL=postgres://...
POSTGRES_PORT=5432
POSTGRES_DB=ciphersqlstudio_app
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
JWT_SECRET=a-long-random-string
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_api_key
```

See `.env.example` for every option. For the client, `client/.env` can set `VITE_API_URL`. Leave it unset in development to use the Vite proxy to `localhost:5000`.

### Seed and run

```bash
npm run seed   # load the 18 sample challenges into MongoDB
npm run dev    # starts the API (port 5000) and the client (port 3000) together
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other scripts

| Script               | What it does                                 |
| -------------------- | -------------------------------------------- |
| `npm run dev:server` | API only, restarts on file changes           |
| `npm run dev:client` | Frontend only                                |
| `npm start`          | Run the API without watch mode               |
| `npm run typecheck`  | Type-check backend and frontend              |
| `npm run build:client` | Production build of the frontend (`client/build`) |

## 📡 API Endpoints

| Method | Endpoint                                | Auth     | Description                      |
| ------ | --------------------------------------- | -------- | -------------------------------- |
| GET    | `/api/health`                           | -        | Health check                     |
| POST   | `/api/auth/signup`                      | -        | Create an account                |
| POST   | `/api/auth/login`                       | -        | Log in, returns a JWT            |
| GET    | `/api/auth/me`                          | Required | Current user                     |
| GET    | `/api/assignments`                      | -        | List challenges (`?difficulty=`) |
| GET    | `/api/assignments/:id`                  | -        | Challenge details + sample data  |
| POST   | `/api/assignments`                      | Admin    | Create a challenge               |
| POST   | `/api/execute/query`                    | Optional | Run and check a SQL query        |
| POST   | `/api/hints`                            | Optional | Get an AI-generated hint         |
| GET    | `/api/progress/history?assignmentId=`   | Required | Your query history               |
| GET    | `/api/progress/:userId`                 | Required | Your progress on all challenges  |
| POST   | `/api/progress`                         | Required | Save progress                    |

## ☁️ Deployment (Vercel)

Two Vercel projects:

- **API** - project root = repo root. `vercel.json` sends every `/api/*` request to `api/index.ts`, which serves the shared Express app. Add the variables from `.env.example` in the Vercel dashboard (`JWT_SECRET` is required in production).
- **Frontend** - project root = `client/`. `client/vercel.json` builds into `build/` and rewrites all routes to `index.html`. Set `VITE_API_URL` to the API's URL.

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 640px
- **Tablet**: 641px - 1023px
- **Desktop**: 1024px - 1280px
- **Large Desktop**: 1281px+

## 🔒 Security Features

- Only a single `SELECT` / `WITH` statement is allowed; destructive keywords and stacked statements are rejected
- Each query runs in a fresh schema inside a transaction that is always rolled back, so nothing persists
- Query timeout (default 5 seconds) and result row limit (default 1000 rows)
- Expected answers are never sent to the browser
- Passwords hashed with bcrypt; JWT auth; users can only read their own progress
- Request bodies and environment variables validated with zod

## 📄 License

MIT License © Gourav Chaudhary

---

**Made with ❤️ by [Gourav Chaudhary](https://github.com/GouravSittam)**
