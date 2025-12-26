# CipherSQLStudio - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Prerequisites Check

- [ ] Node.js v16+ installed (`node --version`)
- [ ] PostgreSQL v13+ installed and running
- [ ] MongoDB Atlas account (free tier is fine)
- [ ] OpenAI API key (or Gemini)

### Step 1: Clone & Install Dependencies

```bash
# Navigate to project
cd CipherSQLStudio

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Setup PostgreSQL

```bash
# Create database
psql -U postgres
CREATE DATABASE ciphersqlstudio_app;
\q
```

### Step 3: Configure Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env and fill in:
# - MongoDB connection string from Atlas
# - PostgreSQL credentials
# - OpenAI API key
```

**backend/.env** (example):

```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ciphersqlstudio
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ciphersqlstudio_app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
OPENAI_API_KEY=sk-your-key-here
LLM_PROVIDER=openai
```

### Step 4: Seed Database

```bash
# Still in backend directory
node scripts/seedAssignments.js
```

Expected output:

```
✅ Connected to MongoDB
🗑️  Cleared existing assignments
✅ Inserted 6 sample assignments

📊 Sample Assignments:
1. Select All Employees (Easy)
2. Filter High Salaries (Easy)
3. Count Employees by Department (Medium)
...
```

### Step 5: Start Backend

```bash
npm run dev
```

Expected output:

```
🚀 Server running on port 5000
✅ MongoDB connected successfully
✅ PostgreSQL connected successfully
```

### Step 6: Configure & Start Frontend

```bash
# Open new terminal
cd frontend

# Copy environment file
cp .env.example .env

# Edit .env
# VITE_API_URL=http://localhost:5000/api

# Start frontend
npm run dev
```

Browser will open at: http://localhost:3000

### Step 7: Test the Application

1. **View Assignments**: You should see 6 sample assignments
2. **Click on "Select All Employees"**
3. **Write query**: `SELECT * FROM employees`
4. **Click "Execute Query"**: See results!
5. **Try "Get Hint"**: See LLM-generated hint

## 📁 Project Structure

```
CipherSQLStudio/
├── backend/
│   ├── config/          # Database configs
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── scripts/         # Seed scripts
│   └── server.js        # Entry point
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       ├── services/    # API calls
│       └── styles/      # SCSS files
└── README.md
```

## 🎯 Key Features Implemented

### Core Features (90%)

- ✅ Assignment listing with difficulty filters
- ✅ Assignment attempt interface
- ✅ Sample data viewer
- ✅ Monaco SQL editor
- ✅ Query execution with PostgreSQL sandbox
- ✅ Results display with execution time
- ✅ LLM hint generation (no solutions!)
- ✅ Query validation & security

### Optional Features (10%)

- ✅ User progress tracking (schema ready)
- ⚠️ Login/Signup (not implemented - focus on core features)

## 🎨 Mobile-First SCSS

The styling follows a mobile-first approach with breakpoints:

```scss
// Base styles for mobile (320px+)
.component { ... }

// Tablet (641px+)
@include tablet { ... }

// Desktop (1024px+)
@include desktop { ... }

// Large (1281px+)
@include large { ... }
```

**SCSS Features Used:**

- ✅ Variables (\_variables.scss)
- ✅ Mixins (\_mixins.scss)
- ✅ Nesting
- ✅ Partials
- ✅ BEM naming convention

## 🔧 Troubleshooting

### Backend won't start

```bash
# Check PostgreSQL is running
pg_isready

# Check MongoDB connection string
# Make sure to replace <password> in MONGODB_URI
```

### Frontend can't connect to backend

```bash
# Make sure backend is running on port 5000
# Check REACT_APP_API_URL in frontend/.env
```

### Query execution fails

```bash
# Check PostgreSQL permissions
# Make sure user has CREATE SCHEMA permission
GRANT CREATE ON DATABASE ciphersqlstudio_app TO your_user;
```

## 📊 API Endpoints

### Assignments

- `GET /api/assignments` - List all
- `GET /api/assignments/:id` - Get one
- `POST /api/assignments` - Create (admin)

### Query Execution

- `POST /api/execute/query` - Execute SQL
- `POST /api/execute/cleanup` - Cleanup sandbox

### Hints

- `POST /api/hints` - Get LLM hint

### Progress (Optional)

- `GET /api/progress/:userId` - Get progress
- `POST /api/progress` - Save progress

## 🚀 Production Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Use production MongoDB cluster
- [ ] Configure CORS for production domain
- [ ] Set up PostgreSQL connection pooling
- [ ] Add rate limiting
- [ ] Add authentication/authorization
- [ ] Set up error logging (Sentry, etc.)
- [ ] Configure HTTPS
- [ ] Add database backups

## 📝 Adding New Assignments

Edit `backend/scripts/seedAssignments.js`:

```javascript
{
  title: "Your Assignment Title",
  difficulty: "Easy", // Easy, Medium, Hard
  question: "Write a SQL query to...",
  sampleTables: [
    {
      tableName: "your_table",
      columns: [
        { columnName: "id", dataType: "INTEGER" },
        { columnName: "name", dataType: "TEXT" }
      ],
      rows: [
        [1, "Alice"],
        [2, "Bob"]
      ]
    }
  ],
  expectedOutput: {
    type: "table", // table, single_value, count, column, row
    value: [...]
  },
  tags: ["SELECT", "basics"]
}
```

Then run: `node scripts/seedAssignments.js`

## 🎓 Educational Notes

### PostgreSQL Sandboxing

Each user gets an isolated schema (`workspace_{sessionId}`):

- Tables are created fresh for each attempt
- No data leakage between users
- Automatic cleanup available

### LLM Prompt Engineering

The hint system is designed to:

- Provide conceptual guidance
- Ask leading questions
- NOT give away the solution
- Adapt based on previous hints

### Security Measures

- Query validation (no DROP, DELETE, etc.)
- SELECT-only queries
- 5-second timeout per query
- 1000 row result limit
- Schema isolation

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review the data flow diagram
3. Check console logs (browser & server)

## 🎉 You're All Set!

Your CipherSQLStudio is now running. Students can:

1. Browse SQL assignments
2. Write queries in the editor
3. Execute queries with real-time feedback
4. Get intelligent hints
5. Learn SQL interactively!

Happy Learning! 🚀
