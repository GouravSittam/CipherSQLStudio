# Vercel Deployment Guide

## Quick Deploy Steps

### 1. Environment Variables

Add these in your Vercel Dashboard (Settings → Environment Variables):

```
MONGODB_URI=mongodb+srv://penthara:PentharaTech@pentharatech.z6kcjf8.mongodb.net/ciphersqlstudio
POSTGRES_HOST=aws-0-ap-southeast-2.pooler.supabase.com
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres.sclgayfowyuaxijnhvoh
POSTGRES_PASSWORD=9ozn5wOUpzPiwyWu
JWT_SECRET=ciphersqlstudio-super-secret-jwt-key-2024-change-in-production-secure
LLM_PROVIDER=gemini
GEMINI_API_KEY=AIzaSyB67hyvV2Nw6x_6FU6bIyGLRLMUDFRO3xo
NODE_ENV=production
```

### 2. Deploy to Vercel

#### Option A: Via Git (Recommended)

```bash
git add .
git commit -m "Deploy with authentication features"
git push origin main
```

Vercel will auto-deploy from your connected repository.

#### Option B: Via Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

### 3. Verify Deployment

After deployment:

- Check `/api/health` endpoint works
- Test signup/login functionality
- Verify assignments load correctly

## Project Structure

```
/
├── api/               # Serverless API functions
├── client/
│   └── build/        # Built frontend (deployed)
├── vercel.json       # Vercel configuration
└── package.json      # Root dependencies & build script
```

## Troubleshooting

### API 404 Errors

- Ensure all environment variables are set in Vercel dashboard
- Check build logs for errors
- Verify `vercel.json` rewrites are correct

### Database Connection Issues

- Test MongoDB URI with compass/mongosh
- Verify PostgreSQL credentials
- Check IP whitelist in database providers

### Build Failures

```bash
# Local test build
npm run build

# Check for errors
npm run build 2>&1 | tee build.log
```

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Build successful
- [ ] API endpoints responding
- [ ] Frontend loads correctly
- [ ] Authentication works
- [ ] Database connections active
- [ ] Sample assignments visible

## URLs

- Frontend: https://cipher-sql-studio-grvchdry.vercel.app
- API: https://cipher-sql-studio-grvchdry.vercel.app/api
- Health Check: https://cipher-sql-studio-grvchdry.vercel.app/api/health
