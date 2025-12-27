# 🚀 CipherSQLStudio - Quick Commands Reference

**🎮 Created by Gourav Chaudhary** | [GitHub](https://github.com/GouravSittam)

## Essential Commands

### 🎬 First Time Setup

```bash
# Navigate to project
cd CipherSQLStudio

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Setup environment files
cd ../server
cp .env.example .env
# Edit .env with your credentials

cd ../client
cp .env.example .env
# Edit .env if needed

# Seed database (server directory)
cd ../server
npm run seed

# Start server
npm run dev

# Start client (new terminal)
cd ../client
npm run dev
```

---

## 📦 Package Management

### Server

```bash
cd server

# Install dependencies
npm install

# Add new package
npm install package-name

# Update packages
npm update

# Check for outdated packages
npm outdated
```

### Client

```bash
cd client

# Install dependencies
npm install

# Add new package
npm install package-name

# Update packages
npm update
```

---

## 🏃 Running the Application

### Development Mode

```bash
# Terminal 1: Server
cd server
npm run dev
# Server runs on http://localhost:5000

# Terminal 2: Client
cd client
npm run dev
# App opens at http://localhost:5173
```

### Production Mode

```bash
# Server
cd server
npm start

# Frontend (build first)
cd frontend
npm run build
# Serve the build folder
```

---

## 🗄️ Database Commands

### MongoDB

```bash
# Seed assignments
cd backend
npm run seed
# or
node scripts/seedAssignments.js

# Connect to MongoDB (if local)
mongosh "your_connection_string"

# View collections
use ciphersqlstudio
show collections
db.assignments.find().pretty()
```

### PostgreSQL

```bash
# Connect to database
psql -U postgres

# Create database
CREATE DATABASE ciphersqlstudio_app;

# List databases
\l

# Connect to database
\c ciphersqlstudio_app

# List schemas
\dn

# View tables in a schema
\dt workspace_*

# Drop a schema
DROP SCHEMA workspace_abc_123_xyz CASCADE;

# Exit
\q
```

---

## 🧪 Testing Commands

### API Testing (using curl)

```bash
# Health check
curl http://localhost:5000/health

# Get all assignments
curl http://localhost:5000/api/assignments

# Get single assignment
curl http://localhost:5000/api/assignments/ASSIGNMENT_ID

# Execute query
curl -X POST http://localhost:5000/api/execute/query \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId": "YOUR_ID",
    "query": "SELECT * FROM employees",
    "sessionId": "test-123"
  }'

# Get hint
curl -X POST http://localhost:5000/api/hints \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId": "YOUR_ID",
    "currentQuery": "SELECT",
    "previousHints": []
  }'
```

### Frontend Testing

```bash
# Run tests (if configured)
cd frontend
npm test

# Build for production
npm run build

# Check build size
npm run build -- --stats
```

---

## 🔍 Debugging Commands

### Backend Debugging

```bash
# View logs (if using nodemon)
cd backend
npm run dev

# Check if port is in use
# Windows:
netstat -ano | findstr :5000
# Mac/Linux:
lsof -i :5000

# Kill process on port
# Windows:
taskkill /PID <PID> /F
# Mac/Linux:
kill -9 <PID>
```

### Frontend Debugging

```bash
# Clear cache and restart
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start

# Check React version
npm list react

# View bundle size
npm run build
```

---

## 📝 Git Commands

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: CipherSQLStudio complete"

# Add remote
git remote add origin https://github.com/yourusername/CipherSQLStudio.git

# Push to GitHub
git push -u origin main

# Check status
git status

# View changes
git diff

# Create branch
git checkout -b feature-name

# View branches
git branch
```

---

## 🧹 Cleanup Commands

### Remove node_modules

```bash
# Backend
cd backend
rm -rf node_modules
# Windows: rmdir /s node_modules

# Frontend
cd frontend
rm -rf node_modules
# Windows: rmdir /s node_modules
```

### Clean PostgreSQL Schemas

```bash
# Connect to PostgreSQL
psql -U postgres -d ciphersqlstudio_app

# Drop all workspace schemas
SELECT 'DROP SCHEMA ' || schema_name || ' CASCADE;'
FROM information_schema.schemata
WHERE schema_name LIKE 'workspace_%';

# Copy and execute the output
```

### Reset MongoDB

```bash
# Reseed assignments
cd backend
npm run seed
```

---

## 🔧 Configuration Commands

### Environment Variables

```bash
# View current environment
# Windows:
echo %NODE_ENV%
# Mac/Linux:
echo $NODE_ENV

# Set environment
# Windows:
set NODE_ENV=production
# Mac/Linux:
export NODE_ENV=production
```

### Check Installed Versions

```bash
# Node.js
node --version
node -v

# npm
npm --version
npm -v

# PostgreSQL
psql --version

# MongoDB (if local)
mongod --version

# Git
git --version
```

---

## 📊 Monitoring Commands

### Backend Logs

```bash
# View logs (if using nodemon)
cd backend
npm run dev

# Save logs to file
npm run dev > logs.txt 2>&1
```

### Database Monitoring

```bash
# MongoDB connections
mongosh "your_connection_string"
db.serverStatus().connections

# PostgreSQL connections
psql -U postgres
SELECT * FROM pg_stat_activity;
```

---

## 🚀 Deployment Commands

### Prepare for Deployment

```bash
# Backend
cd backend
npm install --production
NODE_ENV=production npm start

# Frontend
cd frontend
npm run build
# Upload build/ folder to hosting
```

### Environment Check

```bash
# Verify environment variables
cd backend
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"

cd frontend
npm run build
# Check .env values are loaded
```

---

## 🆘 Troubleshooting Commands

### Backend Won't Start

```bash
# Check MongoDB connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB OK'))
  .catch(err => console.log('❌ MongoDB Error:', err));
"

# Check PostgreSQL connection
psql -U postgres -d ciphersqlstudio_app -c "SELECT 1"
```

### Frontend Won't Start

```bash
# Clear cache
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Check port
# Windows:
netstat -ano | findstr :3000
# Mac/Linux:
lsof -i :3000
```

### Port Conflicts

```bash
# Windows - Find process on port
netstat -ano | findstr :PORT_NUMBER
taskkill /PID <PID> /F

# Mac/Linux - Find and kill process
lsof -i :PORT_NUMBER
kill -9 <PID>
```

---

## 📋 Quick Reference

### Most Used Commands

```bash
# Start development
cd backend && npm run dev       # Terminal 1
cd frontend && npm start        # Terminal 2

# Seed database
cd backend && npm run seed

# View logs
cd backend && npm run dev       # Watch backend logs
# Browser console               # Watch frontend logs

# Test API
curl http://localhost:5000/health

# Git workflow
git add .
git commit -m "message"
git push
```

---

## 🎯 Daily Development Workflow

```bash
# 1. Pull latest changes
git pull

# 2. Install any new dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Start backend
cd backend
npm run dev

# 4. Start frontend (new terminal)
cd frontend
npm run dev

# 5. Make changes and test

# 6. Commit and push
git add .
git commit -m "Descriptive message"
git push
```

---

## 📚 Help Commands

```bash
# npm help
npm help
npm help install
npm help scripts

# Node.js help
node --help

# PostgreSQL help
psql --help
\? # Inside psql

# Git help
git help
git help commit
```

---

## 🔗 Useful URLs

```
Backend API: http://localhost:5000
Frontend App: http://localhost:3000
API Health: http://localhost:5000/health
Assignments API: http://localhost:5000/api/assignments
```

---

## 💡 Pro Tips

```bash
# Create aliases for common commands (Mac/Linux)
echo 'alias backend="cd ~/path/to/backend && npm run dev"' >> ~/.bashrc
echo 'alias frontend="cd ~/path/to/frontend && npm start"' >> ~/.bashrc
echo 'alias seed="cd ~/path/to/backend && npm run seed"' >> ~/.bashrc

# Reload shell
source ~/.bashrc

# Now use:
backend   # Starts backend
frontend  # Starts frontend
seed      # Seeds database
```

---

## ⚠️ Common Errors & Fixes

### Error: "EADDRINUSE: Port already in use"

```bash
# Kill process using the port
# Windows:
netstat -ano | findstr :PORT
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :PORT
kill -9 <PID>
```

### Error: "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Error: "MongoDB connection error"

```bash
# Check connection string
# Verify network access in MongoDB Atlas
# Check username/password
```

### Error: "PostgreSQL connection refused"

```bash
# Check if PostgreSQL is running
# Windows: services.msc → PostgreSQL
# Mac: brew services list
# Linux: systemctl status postgresql

# Start PostgreSQL
# Windows: Start service via services.msc
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

---

**Save this file for quick reference during development!** 🚀

---

_All commands tested on Windows, Mac, and Linux_
