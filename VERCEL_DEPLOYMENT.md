# 🚀 Vercel Deployment Guide

This guide walks you through deploying CipherSQLStudio to Vercel.

## Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free)
3. **MongoDB Atlas** - Free database at [mongodb.com/atlas](https://www.mongodb.com/atlas)
4. **PostgreSQL** - Free options:
   - [Supabase](https://supabase.com) (recommended)
   - [Neon](https://neon.tech)
   - [Railway](https://railway.app)
5. **AI API Key** (optional):
   - [Google Gemini](https://makersuite.google.com/app/apikey) (free!)
   - [OpenAI](https://platform.openai.com/api-keys)

---

## Step 1: Set Up Databases

### MongoDB Atlas (for assignments & progress)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Create a database user (note the password)
4. Add `0.0.0.0/0` to Network Access (allows Vercel access)
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/ciphersqlstudio
   ```

### PostgreSQL - Supabase (for SQL sandbox)

1. Go to [Supabase](https://supabase.com) and create a project
2. Go to **Settings > Database**
3. Copy the connection info:
   - Host: `db.xxxxx.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: `postgres`
   - Password: Your project password

---

## Step 2: Get AI API Key (Optional but Recommended)

For the hint system to work with AI-generated hints:

### Google Gemini (FREE - Recommended)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Note: Set `LLM_PROVIDER=gemini` in env vars

### OpenAI (Paid)

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an API key
3. Note: Set `LLM_PROVIDER=openai` in env vars

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Easiest)

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. **Configure the project:**

   - Framework Preset: `Other`
   - Root Directory: `./`
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install && cd client && npm install`

5. **Add Environment Variables** (click "Environment Variables"):

   | Name                | Value                  |
   | ------------------- | ---------------------- |
   | `MONGODB_URI`       | `mongodb+srv://...`    |
   | `POSTGRES_HOST`     | `db.xxxxx.supabase.co` |
   | `POSTGRES_PORT`     | `5432`                 |
   | `POSTGRES_DB`       | `postgres`             |
   | `POSTGRES_USER`     | `postgres`             |
   | `POSTGRES_PASSWORD` | `your_password`        |
   | `LLM_PROVIDER`      | `gemini`               |
   | `GEMINI_API_KEY`    | `AIzaSy-xxxxx`         |

6. Click **Deploy**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts, then add env vars
vercel env add MONGODB_URI
vercel env add POSTGRES_HOST
# ... add all env vars

# Deploy to production
vercel --prod
```

---

## Step 4: Seed the Database

After deployment, you need to add the SQL challenges to MongoDB.

### Option 1: Run seed script locally

```bash
# Set your production MongoDB URI locally
export MONGODB_URI="mongodb+srv://..."

# Run seed
cd server
npm run seed
```

### Option 2: Use MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to your Atlas cluster
3. Import data from `server/scripts/seedAssignments.js`

---

## Project Structure for Vercel

```
CipherSQLStudio/
├── api/                    # Serverless API functions
│   ├── _lib/              # Shared utilities
│   │   ├── mongodb.js     # MongoDB connection
│   │   ├── postgres.js    # PostgreSQL pool
│   │   ├── llmService.js  # AI hints
│   │   └── models/        # Mongoose models
│   ├── assignments/       # /api/assignments routes
│   ├── execute/           # /api/execute routes
│   ├── hints/             # /api/hints routes
│   ├── progress/          # /api/progress routes
│   └── health.js          # /api/health endpoint
├── client/                # React frontend
│   ├── src/
│   └── build/             # Built by Vercel
├── server/                # Original Express (for local dev)
├── vercel.json            # Vercel configuration
└── package.json           # Root package.json
```

---

## Environment Variables Reference

| Variable                   | Required | Description                         |
| -------------------------- | -------- | ----------------------------------- |
| `MONGODB_URI`              | ✅       | MongoDB connection string           |
| `POSTGRES_HOST`            | ✅       | PostgreSQL host                     |
| `POSTGRES_PORT`            | ✅       | PostgreSQL port (usually 5432)      |
| `POSTGRES_DB`              | ✅       | PostgreSQL database name            |
| `POSTGRES_USER`            | ✅       | PostgreSQL username                 |
| `POSTGRES_PASSWORD`        | ✅       | PostgreSQL password                 |
| `LLM_PROVIDER`             | ❌       | `openai` or `gemini`                |
| `OPENAI_API_KEY`           | ❌       | OpenAI API key                      |
| `GEMINI_API_KEY`           | ❌       | Google Gemini API key               |
| `MAX_QUERY_EXECUTION_TIME` | ❌       | Query timeout in ms (default: 5000) |
| `MAX_RESULT_ROWS`          | ❌       | Max rows returned (default: 1000)   |

---

## Local Development

You can still run the original Express server locally:

```bash
# Install all dependencies
npm run install:all

# Copy env file
cp .env.example server/.env

# Start both frontend and backend
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

---

## Troubleshooting

### "Cannot connect to MongoDB"

- Check if `0.0.0.0/0` is in Network Access
- Verify connection string has correct password
- Make sure username/password are URL-encoded if they contain special characters

### "PostgreSQL connection failed"

- For Supabase, ensure SSL is enabled
- Check if the password is correct
- Verify the host URL

### "Hints not working"

- Make sure `LLM_PROVIDER` matches your API key
- Check if API key is valid and has quota

### "API routes returning 404"

- Verify `vercel.json` is in the root directory
- Check that all API files are in `/api` folder
- Make sure files use `module.exports = async function handler(req, res)`

---

## Performance Tips

1. **Cold Starts**: First request after idle may be slow (~1-2s). This is normal for serverless.

2. **Database Connection Pooling**: The code uses connection caching to minimize cold start impact.

3. **Edge Functions**: For even faster responses, consider migrating to Vercel Edge Functions (requires code changes).

---

## Support

Having issues? Check:

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Supabase Docs](https://supabase.com/docs)

---

Happy deploying! 🎉
