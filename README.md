# CipherSQLStudio

**Created by Gourav Chaudhary**

A browser-based SQL learning platform where students can practice SQL queries against pre-configured assignments with real-time execution and intelligent hints.

## Features

- 📝 View SQL assignments with pre-loaded sample data
- 💻 Write and execute SQL queries in browser-based Monaco Editor
- 💡 Get intelligent hints (not solutions) from integrated LLM
- 📊 See query results in real-time
- 📱 Mobile-first responsive design

## Tech Stack

### Frontend

- React.js with Vite
- Monaco Editor (SQL code editor)
- Vanilla SCSS (mobile-first responsive design)

### Backend

- Node.js & Express.js
- MongoDB Atlas (assignments & user progress)
- PostgreSQL (sandbox query execution)
- LLM Integration (OpenAI/Gemini for hints)

## Project Structure

```
CipherSQLStudio/
├── backend/              # Express.js server
│   ├── config/          # Database configurations
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   └── server.js        # Entry point
├── frontend/            # React application
│   ├── public/
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       ├── styles/      # SCSS files
│       └── services/    # API calls
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- MongoDB Atlas account

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
npm install
```

2. Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:

   - MongoDB connection string
   - PostgreSQL credentials
   - LLM API key (OpenAI/Gemini)
   - Server port

4. Start the server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
npm install
```

2. Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

### Backend (.env)

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ciphersqlstudio_app
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
LLM_API_KEY=your_llm_api_key
LLM_PROVIDER=openai # or gemini
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
```

## Data Flow Diagram

**User Executes Query:**

```
1. User writes SQL in Monaco Editor
2. User clicks "Execute Query" button
3. Frontend sends POST request to /api/execute-query
4. Backend validates and sanitizes query
5. Backend creates isolated PostgreSQL schema
6. Backend loads sample tables for assignment
7. PostgreSQL executes query in sandbox
8. Backend formats results
9. Backend sends response to frontend
10. Frontend updates Results Panel with table data
```

**User Requests Hint:**

```
1. User clicks "Get Hint" button
2. Frontend sends POST request to /api/get-hint with assignmentId
3. Backend retrieves assignment question from MongoDB
4. Backend constructs prompt for LLM (engineered to give hints only)
5. Backend calls LLM API (OpenAI/Gemini)
6. LLM returns hint (not solution)
7. Backend sends hint to frontend
8. Frontend displays hint in UI
```

## API Endpoints

### Assignments

- `GET /api/assignments` - List all assignments
- `GET /api/assignments/:id` - Get single assignment with sample data

### Query Execution

- `POST /api/execute-query` - Execute SQL query
  - Body: `{ assignmentId, query, sessionId }`

### Hints

- `POST /api/get-hint` - Get LLM-generated hint
  - Body: `{ assignmentId, currentQuery, previousHints }`

### User Progress (Optional)

- `POST /api/progress` - Save user progress
- `GET /api/progress/:userId` - Get user's progress

## Mobile-First Responsive Breakpoints

- Mobile: 320px - 640px
- Tablet: 641px - 1023px
- Desktop: 1024px - 1280px
- Large Desktop: 1281px+

## Development Guidelines

### SCSS Structure

- Use BEM naming convention
- Utilize SCSS variables, mixins, and nesting
- Mobile-first approach (base styles for mobile, media queries for larger screens)
- Separate partials for variables, mixins, and components

### Security Considerations

- SQL query validation and sanitization
- Schema isolation per user session
- Prevent destructive operations (DROP, DELETE, UPDATE)
- Rate limiting on query execution

## License

MIT License © Gourav Chaudhary
#
