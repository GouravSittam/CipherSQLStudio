# CipherSQLStudio - Data Flow Diagram

**🎮 Created by Gourav Chaudhary** | [GitHub](https://github.com/GouravSittam)

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                      CLIENT (React + Vite)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Assignment   │  │ Assignment   │  │    Header    │        │
│  │    List      │  │   Attempt    │  │   Footer     │        │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘        │
│         │                 │                                     │
│         │                 ├─ SQLEditor (Monaco)                │
│         │                 ├─ SampleDataViewer                  │
│         │                 └─ ResultsPanel                       │
└─────────┼─────────────────┼─────────────────────────────────────┘
          │                 │
          │ API Service     │ API Service (axios)
          │ (api.js)        │
          │                 │
┌─────────▼─────────────────▼─────────────────────────────────────┐
│                    API ROUTES (Vercel Serverless)                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ /api/      │  │ /api/      │  │ /api/      │  │ /api/    │ │
│  │assignments │  │execute     │  │hints       │  │progress  │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬────┘ │
└────────┼───────────────┼───────────────┼───────────────┼────────┘
         │               │               │               │
         │               │               │               │
    ┌────▼─────┐    ┌────▼──────┐   ┌───▼────┐     ┌────▼─────┐
    │ MongoDB  │    │ MongoDB   │   │MongoDB │     │ MongoDB  │
    │ Atlas    │    │ + Postgres│   │+ LLM   │     │ Atlas    │
    │          │    │ Service   │   │Service │     │          │
    │ - Read   │    │           │   │        │     │ - Save   │
    │   assign │    │ - Validate│   │- Prompt│     │   progress│
    │   ments  │    │ - Execute │   │- OpenAI│     │ - Update │
    └──────────┘    │ - Compare │   │/Gemini │     │   stats  │
                    └───────────┘   └────────┘     └──────────┘
```

---

## 📊 Data Flow 1: View Assignments List

```
┌─────────────┐
│   USER      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Navigate to homepage / assignments list
       ▼
┌──────────────────────────────┐
│  CLIENT: AssignmentList.jsx  │
│  - useEffect() on mount      │
│  - calls fetchAssignments()  │
└──────┬───────────────────────┘
       │
       │ 2. API Service: getAssignments(filters)
       │    GET /api/assignments?difficulty=easy
       ▼
┌─────────────────────────────────────┐
│  API: /api/assignments/index.js     │
│  - Parse query params               │
│  - Build MongoDB query              │
└──────┬──────────────────────────────┘
       │
       │ 3. Query MongoDB
       ▼
┌─────────────────────────────────────┐
│  MongoDB Atlas                      │
│  db.assignments.find({              │
│    difficulty: 'easy'               │
│  })                                 │
│  .select('title difficulty question │
│           tags createdAt')          │
│  .sort({ createdAt: -1 })           │
└──────┬──────────────────────────────┘
       │
       │ 4. Return assignments array
       ▼
┌─────────────────────────────────────┐
│  API Response                       │
│  {                                  │
│    success: true,                   │
│    count: 5,                        │
│    data: [                          │
│      {                              │
│        _id: "...",                  │
│        title: "Employee Query",    │
│        difficulty: "easy",         │
│        question: "SELECT...",      │
│        tags: ["joins", "basic"]    │
│      },                             │
│      ...                            │
│    ]                                │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 5. Client updates state
       ▼
┌─────────────────────────────────────┐
│  CLIENT: setAssignments(data)       │
│  - Render AssignmentCard grid       │
│  - Show filters (⭐ Easy, ⭐⭐ Med)  │
└──────┬──────────────────────────────┘
       │
       │ 6. UI displays assignments
       ▼
┌─────────────┐
│   USER      │
│  Sees cards │
│  with       │
│  difficulty │
│  badges     │
└─────────────┘
```

---

## 📊 Data Flow 2: Execute SQL Query

```
┌─────────────┐
│   USER      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. User writes SQL query in Monaco Editor
       │    (e.g., "SELECT * FROM employees WHERE dept='Sales'")
       ▼
┌──────────────────────────────┐
│  CLIENT: SQLEditor Component │
│  - State: query              │
│  - Monaco editor instance    │
└──────┬───────────────────────┘
       │
       │ 2. User clicks "▶ EXECUTE" button
       │    onClick={handleExecuteQuery}
       │
       │ 3. executeQuery(assignmentId, query, sessionId)
       ▼
┌─────────────────────────────────────┐
│  API Service (axios)                │
│  POST /api/execute/query            │
│  Body: {                            │
│    assignmentId: "abc123",          │
│    query: "SELECT * FROM...",       │
│    sessionId: "uuid-v4-..."         │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 4. HTTP POST to Vercel API
       ▼
┌─────────────────────────────────────┐
│  API: /api/execute/query.js         │
│  - Validate request                 │
│  - Generate/use sessionId           │
└──────┬──────────────────────────────┘
       │
       │ 5. Fetch assignment from MongoDB
       ▼
┌─────────────────────────────────────┐
│  MongoDB Atlas                      │
│  Assignment.findById(assignmentId)  │
│  Returns:                           │
│  - question                         │
│  - sampleTables[]                   │
│  - expectedOutput                   │
│  - difficulty                       │
└──────┬──────────────────────────────┘
       │
       │ 6. Assignment data
       ▼
┌─────────────────────────────────────┐
│  queryExecutionService.js           │
│  createSandboxSchema(sessionId)     │
└──────┬──────────────────────────────┘
       │
       │ 7. CREATE SCHEMA workspace_{sessionId}
       ▼
┌─────────────────────────────────────┐
│  PostgreSQL (node-pg)               │
│  - CREATE SCHEMA IF NOT EXISTS      │
│    workspace_abc123                 │
│  - SET search_path TO workspace_... │
└──────┬──────────────────────────────┘
       │
       │ 8. Schema created
       ▼
┌─────────────────────────────────────┐
│  queryExecutionService.js           │
│  loadSampleTables(sessionId, tables)│
└──────┬──────────────────────────────┘
       │
       │ 9. CREATE TABLE employees (...); INSERT INTO...
       ▼
┌─────────────────────────────────────┐
│  PostgreSQL                         │
│  workspace_abc123:                  │
│  - employees table                  │
│  - departments table                │
│  - Sample data inserted             │
└──────┬──────────────────────────────┘
       │
       │ 10. Tables ready
       ▼
┌─────────────────────────────────────┐
│  queryExecutionService.js           │
│  validateQuery(query)               │
│  - Check for DROP, DELETE, TRUNCATE │
│  - Must start with SELECT           │
│  - SQL injection prevention         │
└──────┬──────────────────────────────┘
       │
       │ 11. Query valid ✓
       ▼
┌─────────────────────────────────────┐
│  queryExecutionService.js           │
│  executeUserQuery(query, sessionId) │
│  - SET statement_timeout = '10s'    │
│  - START TRANSACTION                │
└──────┬──────────────────────────────┘
       │
       │ 12. Execute user's query
       ▼
┌─────────────────────────────────────┐
│  PostgreSQL                         │
│  workspace_abc123:                  │
│  SELECT * FROM employees            │
│    WHERE dept='Sales'               │
│  - Track execution time             │
│  - Return rows                      │
└──────┬──────────────────────────────┘
       │
       │ 13. Query results
       │     { rows: [...], rowCount: 3, executionTime: 24ms }
       ▼
┌─────────────────────────────────────┐
│  llmService.js                      │
│  validateQueryResult(               │
│    userResult,                      │
│    expectedOutput,                  │
│    question                         │
│  )                                  │
└──────┬──────────────────────────────┘
       │
       │ 14. Compare with expected output
       │     isCorrect = (userRows === expectedRows)
       ▼
┌─────────────────────────────────────┐
│  API Response                       │
│  {                                  │
│    success: true,                   │
│    data: [                          │
│      { id: 1, name: "Alice", ... }, │
│      { id: 4, name: "Bob", ... }    │
│    ],                               │
│    rowCount: 2,                     │
│    executionTime: 24,               │
│    isCorrect: true,                 │
│    sessionId: "abc123",             │
│    message: "Victory! Query is..."  │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 15. Response to client
       ▼
┌─────────────────────────────────────┐
│  CLIENT: AssignmentAttempt.jsx      │
│  - setResults(response.data)        │
│  - setIsCorrect(response.isCorrect) │
│  - setExecutionTime(...)            │
└──────┬──────────────────────────────┘
       │
       │ 16. Update ResultsPanel
       ▼
┌─────────────────────────────────────┐
│  ResultsPanel Component             │
│  🎮 OUTPUT CONSOLE                  │
│  ┌─────────────────────────────┐   │
│  │ ✓ VICTORY - Query Correct!  │   │
│  │ ⏱ Execution Time: 24ms      │   │
│  │ 📊 Rows: 2                  │   │
│  │                             │   │
│  │  id │ name  │ dept          │   │
│  │ ────┼───────┼─────          │   │
│  │  1  │ Alice │ Sales         │   │
│  │  4  │ Bob   │ Sales         │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
       │
       │ 17. User sees results
       ▼
┌─────────────┐
│   USER      │
│  🎉 Victory │
│  message    │
└─────────────┘
```

---

## 📊 Data Flow 3: Get AI Hint (Power-Up)

```
┌─────────────┐
│   USER      │
└──────┬──────┘
       │
       │ 1. Clicks "💡 POWER-UP" button
       │    (struggling with the query)
       ▼
┌──────────────────────────────┐
│  CLIENT: AssignmentAttempt   │
│  handleGetHint()             │
└──────┬───────────────────────┘
       │
       │ 2. API Service: getHint(assignmentId, currentQuery, previousHints)
       │    POST /api/hints
       ▼
┌─────────────────────────────────────┐
│  API Service (axios)                │
│  Body: {                            │
│    assignmentId: "abc123",          │
│    currentQuery: "SELECT * FROM..", │
│    previousHints: ["Use JOIN", ...] │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 3. HTTP POST to API
       ▼
┌─────────────────────────────────────┐
│  API: /api/hints/index.js           │
│  - Validate assignmentId            │
└──────┬──────────────────────────────┘
       │
       │ 4. Fetch assignment from MongoDB
       ▼
┌─────────────────────────────────────┐
│  MongoDB Atlas                      │
│  Assignment.findById(assignmentId)  │
│  Returns:                           │
│  - question                         │
│  - sampleTables (schema)            │
│  - hints (pre-defined hints)        │
│  - difficulty                       │
└──────┬──────────────────────────────┘
       │
       │ 5. Assignment data
       ▼
┌─────────────────────────────────────┐
│  llmService.js                      │
│  generateHint(                      │
│    assignment,                      │
│    currentQuery,                    │
│    previousHints                    │
│  )                                  │
└──────┬──────────────────────────────┘
       │
       │ 6. Construct AI prompt:
       │    System: "You are SQL tutor..."
       │    Context:
       │      - Question: "Find all employees..."
       │      - Tables: employees { id, name, dept }
       │      - User's query: "SELECT * FROM..."
       │      - Previous hints: ["Use WHERE"]
       │      - Rule: NO SOLUTIONS! Only hints
       ▼
┌─────────────────────────────────────┐
│  OpenAI API / Google Gemini         │
│  - Model: gpt-4 / gemini-1.5-flash  │
│  - Temperature: 0.7                 │
│  - Process prompt                   │
│  - Generate helpful hint            │
└──────┬──────────────────────────────┘
       │
       │ 7. LLM returns hint text
       │    "Try filtering the department column
       │     using a WHERE clause"
       ▼
┌─────────────────────────────────────┐
│  API Response                       │
│  {                                  │
│    success: true,                   │
│    hint: "Try filtering the dept...",│
│    hintsUsed: 2,                    │
│    remainingHints: 1                │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 8. Response to client
       ▼
┌─────────────────────────────────────┐
│  CLIENT: AssignmentAttempt.jsx      │
│  - addHint(response.hint)           │
│  - setHintsUsed(response.hintsUsed) │
│  - Display hint in UI               │
└──────┬──────────────────────────────┘
       │
       │ 9. Show hint in UI
       ▼
┌─────────────────────────────────────┐
│  Hints Panel                        │
│  💡 HINT #2                         │
│  ┌─────────────────────────────┐   │
│  │ Try filtering the department│   │
│  │ column using a WHERE clause │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
       │
       │ 10. User reads hint
       ▼
┌─────────────┐
│   USER      │
│  💡 "Aha!"  │
│  moment     │
└─────────────┘
```

---

## 📊 Data Flow 4: Save User Progress

```
┌─────────────┐
│   USER      │
└──────┬──────┘
       │
       │ 1. User completes query successfully
       │    isCorrect = true
       ▼
┌──────────────────────────────┐
│  CLIENT: AssignmentAttempt   │
│  - Query execution complete  │
│  - isCorrect = true          │
└──────┬───────────────────────┘
       │
       │ 2. API Service: saveProgress(...)
       │    POST /api/progress
       ▼
┌─────────────────────────────────────┐
│  API Service (axios)                │
│  Body: {                            │
│    userId: "user123",               │
│    assignmentId: "abc123",          │
│    sqlQuery: "SELECT * FROM...",    │
│    isCompleted: true,               │
│    executionTime: 24,               │
│    wasSuccessful: true              │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 3. HTTP POST to API
       ▼
┌─────────────────────────────────────┐
│  API: /api/progress/index.js        │
│  - Validate userId & assignmentId   │
└──────┬──────────────────────────────┘
       │
       │ 4. Find or create user progress
       ▼
┌─────────────────────────────────────┐
│  MongoDB Atlas                      │
│  UserProgress.findOne({             │
│    userId: "user123",               │
│    assignmentId: "abc123"           │
│  })                                 │
└──────┬──────────────────────────────┘
       │
       │ 5. Update progress document
       │    - Increment attempts
       │    - Update lastAttempt timestamp
       │    - Save best execution time
       │    - Mark as completed if first success
       ▼
┌─────────────────────────────────────┐
│  MongoDB Atlas                      │
│  {                                  │
│    userId: "user123",               │
│    assignmentId: "abc123",          │
│    attempts: 5,                     │
│    isCompleted: true,               │
│    savedQuery: "SELECT * FROM...",  │
│    bestExecutionTime: 24,           │
│    lastAttempt: "2025-12-28T..."    │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 6. Return updated progress
       ▼
┌─────────────────────────────────────┐
│  API Response                       │
│  {                                  │
│    success: true,                   │
│    data: {                          │
│      attempts: 5,                   │
│      isCompleted: true,             │
│      bestExecutionTime: 24          │
│    }                                │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 7. Client updates UI (optional)
       ▼
┌─────────────────────────────────────┐
│  CLIENT                             │
│  - Show completion badge            │
│  - Display stats                    │
└─────────────────────────────────────┘
```

---

## 📊 Data Flow 5: Get User Progress

```
┌─────────────┐
│   USER      │
└──────┬──────┘
       │
       │ 1. Navigate to user dashboard
       ▼
┌──────────────────────────────┐
│  CLIENT: Dashboard/Profile   │
│  - useEffect() on mount      │
└──────┬───────────────────────┘
       │
       │ 2. API Service: getUserProgress(userId)
       │    GET /api/progress/{userId}
       ▼
┌─────────────────────────────────────┐
│  API: /api/progress/[userId].js     │
│  - Extract userId from params       │
└──────┬──────────────────────────────┘
       │
       │ 3. Query all progress for user
       ▼
┌─────────────────────────────────────┐
│  MongoDB Atlas                      │
│  UserProgress.find({                │
│    userId: "user123"                │
│  })                                 │
│  .populate('assignmentId')          │
│  .sort({ lastAttempt: -1 })         │
└──────┬──────────────────────────────┘
       │
       │ 4. Return progress array
       ▼
┌─────────────────────────────────────┐
│  API Response                       │
│  {                                  │
│    success: true,                   │
│    data: [                          │
│      {                              │
│        assignmentId: {...},         │
│        attempts: 5,                 │
│        isCompleted: true,           │
│        bestExecutionTime: 24        │
│      },                             │
│      ...                            │
│    ]                                │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 5. Display progress stats
       ▼
┌─────────────┐
│   USER      │
│  Views:     │
│  - Attempts │
│  - Complete │
│  - Best Time│
└─────────────┘
```

---

## 📊 Data Flow 6: Get Assignment by ID

```
┌─────────────┐
│   USER      │
└──────┬──────┘
       │
       │ 1. Click on assignment card
       │    Navigate to /assignment/:id
       ▼
┌──────────────────────────────┐
│  CLIENT: AssignmentAttempt   │
│  - useEffect() with id param │
└──────┬───────────────────────┘
       │
       │ 2. API Service: getAssignment(id)
       │    GET /api/assignments/{id}
       ▼
┌─────────────────────────────────────┐
│  API: /api/assignments/[id].js      │
│  - Extract id from params           │
└──────┬──────────────────────────────┘
       │
       │ 3. Query assignment by ID
       ▼
┌─────────────────────────────────────┐
│  MongoDB Atlas                      │
│  Assignment.findById(id)            │
│  Returns:                           │
│  - title, difficulty, question      │
│  - sampleTables (complete data)     │
│  - expectedOutput                   │
│  - hints (pre-defined)              │
│  - tags                             │
└──────┬──────────────────────────────┘
       │
       │ 4. Return full assignment
       ▼
┌─────────────────────────────────────┐
│  API Response                       │
│  {                                  │
│    success: true,                   │
│    data: {                          │
│      _id: "abc123",                 │
│      title: "Employee Query",       │
│      difficulty: "easy",            │
│      question: "Find all...",       │
│      sampleTables: [{               │
│        name: "employees",           │
│        schema: [...],               │
│        data: [...]                  │
│      }],                            │
│      expectedOutput: [...],         │
│      hints: ["Hint 1", "Hint 2"]    │
│    }                                │
│  }                                  │
└──────┬──────────────────────────────┘
       │
       │ 5. Render assignment components
       ▼
┌─────────────────────────────────────┐
│  CLIENT                             │
│  - Question Panel (Mission Briefing)│
│  - SampleDataViewer (show tables)   │
│  - SQLEditor (Monaco)               │
│  - ResultsPanel (empty initially)   │
└─────────────────────────────────────┘
       │
       │ 6. User begins coding
       ▼
┌─────────────┐
│   USER      │
│  Ready to   │
│  code SQL!  │
└─────────────┘
```

---

## 🔄 Complete System Integration Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                          │
│                      (React Frontend - Vite)                      │
│                                                                    │
│  ┌────────────┐    ┌───────────────┐    ┌──────────────┐       │
│  │ Assignment │───▶│  Assignment   │───▶│   Results    │       │
│  │    List    │    │    Attempt    │    │    Panel     │       │
│  │  (Browse)  │    │  (Code + Run) │    │  (Feedback)  │       │
│  └─────┬──────┘    └───────┬───────┘    └──────────────┘       │
└────────┼────────────────────┼──────────────────────────────────────┘
         │                    │
         │ GET /api/         │ POST /api/execute/query
         │ assignments       │ POST /api/hints
         │                    │ POST /api/progress
         │                    │
┌────────▼────────────────────▼──────────────────────────────────────┐
│              VERCEL SERVERLESS API FUNCTIONS                       │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────┐   │
│  │ assignments │  │  execute    │  │  hints   │  │ progress │   │
│  │   routes    │  │   routes    │  │  routes  │  │  routes  │   │
│  └──────┬──────┘  └──────┬──────┘  └─────┬────┘  └─────┬────┘   │
└─────────┼─────────────────┼─────────────────┼────────────┼──────────┘
          │                 │                 │            │
          │                 │                 │            │
    ┌─────▼──────┐    ┌─────▼──────┐    ┌────▼─────┐  ┌──▼────┐
    │  MongoDB   │    │  MongoDB   │    │ MongoDB  │  │MongoDB│
    │  Atlas     │    │  + Postgres│    │ + LLM    │  │ Atlas │
    │            │    │            │    │ Service  │  │       │
    │ - Read     │    │ - Validate │    │          │  │- Save │
    │   assign   │    │ - Sandbox  │    │ - OpenAI │  │  prog │
    │   ments    │    │   Schema   │    │ - Gemini │  │  ress │
    └────────────┘    │ - Execute  │    └──────────┘  └───────┘
                      │ - Compare  │
                      └────────────┘
```

---

## 🗄️ Database Schemas

### MongoDB Collections

#### **assignments**

```javascript
{
  _id: ObjectId,
  title: String,              // "Basic SELECT Query"
  difficulty: String,         // "easy" | "medium" | "hard"
  question: String,           // "Find all employees in Sales"
  sampleTables: [{
    name: String,             // "employees"
    schema: [{
      name: String,           // "id"
      type: String,           // "INTEGER"
      constraints: String     // "PRIMARY KEY"
    }],
    data: [[Any]]             // [[1, "Alice", "Sales"], ...]
  }],
  expectedOutput: [[Any]],    // Expected query result
  hints: [String],            // Pre-defined hints
  tags: [String],             // ["joins", "where", "aggregate"]
  createdAt: Date,
  updatedAt: Date
}
```

#### **userProgress**

```javascript
{
  _id: ObjectId,
  userId: String,             // "user123" (future: auth ID)
  assignmentId: ObjectId,     // Reference to assignment
  attempts: Number,           // Number of attempts
  isCompleted: Boolean,       // Solved correctly?
  savedQuery: String,         // Last saved query
  bestExecutionTime: Number,  // Best time in ms
  lastAttempt: Date,
  createdAt: Date
}
```

### PostgreSQL Sandbox

#### **Dynamic Schemas**

```sql
-- Created per session
CREATE SCHEMA IF NOT EXISTS workspace_{sessionId};

-- Sample table (from assignment)
CREATE TABLE workspace_{sessionId}.employees (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100),
  department VARCHAR(50)
);

-- Automatically cleaned up after session
```

---

## 🔒 Security Measures

### 1. **Query Validation**

- Block destructive operations: `DROP`, `DELETE`, `TRUNCATE`, `UPDATE`, `INSERT`, `ALTER`
- Only allow `SELECT` queries
- SQL injection prevention using parameterized queries

### 2. **Sandbox Isolation**

- Each session gets unique PostgreSQL schema
- `SET search_path = workspace_{sessionId}`
- No access to other schemas or system tables

### 3. **Resource Limits**

- Query timeout: 10 seconds (`statement_timeout`)
- Row limit: 1000 rows maximum
- Connection pooling to prevent exhaustion

### 4. **LLM Safety**

- System prompt prevents solution disclosure
- Hints only, never complete answers
- Rate limiting on hint requests (future)

### 5. **API Security**

- CORS enabled for frontend domain
- Input validation on all endpoints
- Error messages don't leak sensitive info

---

## 🎨 UI Theme: Brutalist Gaming

### Visual Design

- **Dark backgrounds** (#0F0F1E, #1A1A2E)
- **Neon accents** (#00FF9D - primary, #FF0055 - error, #FFD93D - warning)
- **Bold 4px borders** with offset shadows
- **Space Grotesk** (headings) + **JetBrains Mono** (code)

### Gaming Terminology

- Assignments → **"Challenges"**
- Difficulty Levels → **"⭐ Easy", "⭐⭐ Medium", "⭐⭐⭐ Hard"**
- Hints → **"💡 Power-Ups"**
- Success → **"✓ VICTORY"**
- SQL Editor → **"SQL Terminal"**
- Results → **"Output Console"**

---

## 🚀 Technology Stack

### Frontend

- **React 18** + **Vite** - Fast build tool
- **Monaco Editor** - VS Code editor component
- **Axios** - HTTP client
- **SCSS** - Styling with variables

### Backend (Serverless)

- **Vercel Functions** - Serverless deployment
- **Express.js** - API routing (via serverless)
- **Node.js** - Runtime

### Databases

- **MongoDB Atlas** - Assignment & progress storage
- **PostgreSQL** (Vercel Postgres) - Query sandbox
- **Mongoose** - MongoDB ODM
- **node-pg** - PostgreSQL client

### AI Integration

- **OpenAI API** (GPT-4) - Hint generation
- **Google Gemini** - Alternative LLM

---

## 📈 Performance Considerations

### Frontend

- Code splitting with React lazy loading
- Monaco editor loads on-demand
- Debounced query execution
- Optimized re-renders with React.memo

### Backend

- Connection pooling for PostgreSQL
- Cached MongoDB connections (serverless)
- Schema cleanup after timeout
- Efficient query validation

### Database

- Indexed MongoDB fields (assignmentId, userId, difficulty)
- PostgreSQL query timeout enforcement
- Sandbox schema isolation prevents resource contention

---

## 🔄 Session Management

```
Session Lifecycle:
1. User opens assignment → Generate UUID sessionId
2. Create PostgreSQL schema → workspace_{sessionId}
3. Load sample tables → INSERT data
4. Execute queries → Isolated in schema
5. Session expires (30 min) → Cleanup schema
6. User closes tab → Optional cleanup call
```

---

## 🎯 User Journey Summary

```
1. Browse Assignments
   ↓
2. Select Challenge
   ↓
3. View Question & Sample Data
   ↓
4. Write SQL Query in Monaco Editor
   ↓
5. Execute Query
   ↓
6. View Results in Output Console
   ↓
7. Get Feedback (✓ Victory or hints)
   ↓
8. Iterate until correct
   ↓
9. Progress saved automatically
```

---

**🎮 Built with ❤️ by Gourav Chaudhary**  
[GitHub](https://github.com/GouravSittam) | [CipherSchools](https://cipherschools.com)
