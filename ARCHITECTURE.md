# CipherSQLStudio - Architecture Documentation

**🎮 Created by Gourav Chaudhary** | [GitHub](https://github.com/GouravSittam)

## 🏗️ System Architecture Overview

CipherSQLStudio follows a **three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│              (React Frontend with Vite)                  │
│  - Brutalist Gaming Theme UI                            │
│  - State Management                                     │
│  - API Communication                                    │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
┌────────────────────▼────────────────────────────────────┐
│                   APPLICATION LAYER                      │
│                  (Express.js Backend)                    │
│  - Request Routing                                      │
│  - Business Logic                                       │
│  - Authentication (future)                              │
│  - Validation & Sanitization                            │
└─────┬──────────────────────────────────────┬───────────┘
      │                                      │
      │ Mongoose ODM                         │ node-pg
      │                                      │
┌─────▼──────────────┐              ┌───────▼────────────┐
│   DATA LAYER       │              │   DATA LAYER       │
│  MongoDB Atlas     │              │   PostgreSQL       │
│  - Assignments     │              │   - Query Sandbox  │
│  - User Progress   │              │   - Schema         │
│  - Metadata        │              │     Isolation      │
└────────────────────┘              └────────────────────┘
```

---

## 🎯 Design Principles

### 1. **Separation of Concerns**

- **Client**: UI/UX only, no business logic (Brutalist Gaming Theme)
- **Server**: API, validation, orchestration
- **Services**: Isolated business logic (query execution, LLM, etc.)

### 2. **Security by Design**

- Query validation at entry point
- SQL injection prevention
- Schema isolation per session
- No destructive operations allowed

### 3. **Scalability**

- Stateless API design
- Session-based schema isolation
- Connection pooling for PostgreSQL
- MongoDB for horizontal scalability

### 4. **User-Centric**

- Mobile-first responsive design
- Progressive enhancement
- Error-friendly UX
- Fast feedback loops

---

## 📦 Component Architecture

### Frontend Components (React + Vite)

```
App
├── Header
│   ├── CipherSchools Logo
│   └── Navigation Links
│
├── Footer
│   ├── Author: Gourav Chaudhary
│   └── GitHub Link
│
├── AssignmentList (Page)
│   ├── Filter Buttons (⭐ Easy, ⭐⭐ Medium, ⭐⭐⭐ Hard)
│   └── AssignmentCard[] (Grid)
│       ├── Title
│       ├── Level Badge
│       ├── Question Preview
│       └── Tags (#hashtags)
│
└── AssignmentAttempt (Page)
    ├── QuestionPanel (Mission Briefing)
    │   └── Challenge Question
    │
    ├── SampleDataViewer (Database Terminal)
    │   └── DataTable[]
    │       ├── Table Schema
    │       └── Sample Rows
    │
    ├── EditorPanel (SQL Terminal)
    │   ├── SQLEditor (Monaco)
    │   ├── Execute Button
    │   └── Power-Up Button (Get Hint)
    │
    ├── ResultsPanel (Output Console)
    │   ├── Results Table
    │   ├── Execution Metadata
    │   └── Error Display
    │
    └── HintsPanel
        └── HintItem[]
```

### Backend Structure

```
backend/
├── server.js (Entry Point)
│   ├── Middleware Setup
│   ├── Route Registration
│   └── Error Handling
│
├── config/
│   ├── database.js (MongoDB Connection)
│   └── postgres.js (PostgreSQL Pool)
│
├── models/
│   ├── Assignment.js (MongoDB Schema)
│   └── UserProgress.js (MongoDB Schema)
│
├── routes/
│   ├── assignments.js (CRUD for assignments)
│   ├── execute.js (Query execution)
│   ├── hints.js (LLM hint generation)
│   └── progress.js (User progress tracking)
│
├── services/
│   ├── queryExecutionService.js
│   │   ├── validateQuery()
│   │   ├── createSandboxSchema()
│   │   ├── loadSampleData()
│   │   ├── executeQuery()
│   │   └── cleanupSchema()
│   │
│   └── llmService.js
│       ├── generateHint()
│       ├── validateQuery()
│       └── getFallbackHint()
│
└── scripts/
    └── seedAssignments.js (Database Seeding)
```

---

## 🔄 Data Flow Architecture

### Query Execution Flow

```
1. USER ACTION
   └─> User writes SQL in editor
   └─> Clicks "Execute Query"

2. FRONTEND (React)
   └─> handleExecuteQuery() called
   └─> API call: executeQuery(assignmentId, query, sessionId)
   └─> Loading state set to true

3. API SERVICE (Axios)
   └─> POST /api/execute/query
   └─> Sends: { assignmentId, query, sessionId }

4. BACKEND ROUTING (Express)
   └─> Route: /api/execute/query
   └─> Controller receives request

5. DATABASE FETCH (MongoDB)
   └─> Find assignment by ID
   └─> Retrieve: sampleTables, expectedOutput

6. SANDBOX CREATION (PostgreSQL)
   └─> CREATE SCHEMA workspace_{sessionId}
   └─> SET search_path TO workspace_{sessionId}

7. DATA LOADING (PostgreSQL)
   └─> CREATE TABLE for each sampleTable
   └─> INSERT sample rows

8. VALIDATION (Security Layer)
   └─> Check for dangerous keywords (DROP, DELETE, etc.)
   └─> Ensure query starts with SELECT
   └─> Throw error if invalid

9. EXECUTION (PostgreSQL)
   └─> SET statement_timeout = 5000ms
   └─> Execute user's query
   └─> Measure execution time

10. RESULT PROCESSING
    └─> Format results
    └─> Limit to 1000 rows
    └─> Compare with expectedOutput

11. RESPONSE
    └─> Return: { success, data, executionTime, isCorrect }

12. FRONTEND UPDATE
    └─> Update results state
    └─> Display table or error
    └─> Show success badge if correct
```

### Hint Generation Flow

```
1. USER ACTION
   └─> Clicks "Get Hint"

2. FRONTEND
   └─> handleGetHint() called
   └─> API call: getHint(assignmentId, currentQuery, previousHints)

3. BACKEND
   └─> Fetch assignment from MongoDB
   └─> Pass to LLM Service

4. LLM SERVICE
   └─> Construct system prompt (enforce: hints only, no solutions)
   └─> Construct user prompt with:
       - Assignment question
       - Sample table schemas
       - User's current query attempt
       - Previous hints given
   └─> Call OpenAI API (or Gemini)

5. LLM API
   └─> Process prompt
   └─> Generate contextual hint
   └─> Return response

6. BACKEND
   └─> Extract hint text
   └─> Return to frontend

7. FRONTEND
   └─> Add hint to hints array
   └─> Display in HintsPanel
```

---

## 🗄️ Database Schema Design

### MongoDB Collections

#### assignments

```javascript
{
  _id: ObjectId,
  title: String,
  difficulty: "Easy" | "Medium" | "Hard",
  question: String,
  sampleTables: [
    {
      tableName: String,
      columns: [
        {
          columnName: String,
          dataType: "INTEGER" | "TEXT" | "REAL" | ...
        }
      ],
      rows: [[...]] // 2D array of values
    }
  ],
  expectedOutput: {
    type: "table" | "single_value" | "count" | ...,
    value: Mixed // Flexible for different output types
  },
  hints: [String], // Optional pre-written hints
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

#### userProgress (Optional)

```javascript
{
  _id: ObjectId,
  userId: String,
  assignmentId: ObjectId (ref: Assignment),
  sqlQuery: String,
  lastAttempt: Date,
  isCompleted: Boolean,
  attemptCount: Number,
  hintsUsed: Number,
  queryHistory: [
    {
      query: String,
      timestamp: Date,
      wasSuccessful: Boolean,
      executionTime: Number
    }
  ]
}
```

### PostgreSQL Schema

#### Dynamic Schema per Session

```sql
-- Example for sessionId: "abc-123-xyz"
CREATE SCHEMA workspace_abc_123_xyz;

-- Within this schema, assignment tables are created
CREATE TABLE workspace_abc_123_xyz.employees (
  id INTEGER,
  name TEXT,
  department TEXT,
  salary INTEGER
);

-- Sample data inserted
INSERT INTO workspace_abc_123_xyz.employees VALUES
  (1, 'John Doe', 'Engineering', 75000),
  (2, 'Jane Smith', 'Marketing', 65000);

-- User's query executes in this isolated schema
SET search_path TO workspace_abc_123_xyz;
SELECT * FROM employees; -- Only sees their own data
```

**Benefits:**

- Complete isolation between users
- No data leakage
- Easy cleanup (DROP SCHEMA CASCADE)
- Supports concurrent users

---

## 🔐 Security Architecture

### 1. Query Validation Layer

```javascript
const dangerousKeywords = [
  "DROP",
  "DELETE",
  "TRUNCATE",
  "ALTER",
  "CREATE",
  "INSERT",
  "UPDATE",
  "GRANT",
  "REVOKE",
  "EXECUTE",
];

// Check query doesn't contain dangerous operations
// Must start with SELECT
// No semicolon injection (multiple statements)
```

### 2. Schema Isolation

- Each session gets unique schema
- No cross-contamination
- Automatic resource limits

### 3. Execution Safeguards

- 5-second timeout per query
- 1000 row result limit
- Connection pooling for resource management

### 4. LLM Prompt Security

- System prompt enforces "hints only"
- No solution revealing
- Context limited to assignment info

---

## 🎨 Frontend Architecture

### State Management

```javascript
// Component-level state (no Redux/Context needed for this scale)
const [assignments, setAssignments] = useState([]);
const [assignment, setAssignment] = useState(null);
const [query, setQuery] = useState("");
const [results, setResults] = useState(null);
const [hints, setHints] = useState([]);
const [sessionId, setSessionId] = useState(null);
```

### API Service Layer

```javascript
// Centralized API calls in services/api.js
export const executeQuery = async (assignmentId, query, sessionId) => {
  const response = await api.post('/execute/query', { ... });
  return response.data;
};
```

### Styling Architecture (SCSS)

```
styles/
├── _variables.scss   # Colors, spacing, breakpoints
├── _mixins.scss      # Reusable patterns
├── _base.scss        # Reset, global styles
├── _assignment-list.scss
├── _assignment-attempt.scss
└── main.scss         # Entry point, imports all
```

**Mobile-First Approach:**

```scss
// Base styles for mobile (320px+)
.component { ... }

// Tablet (641px+)
@include tablet {
  .component { ... }
}

// Desktop (1024px+)
@include desktop {
  .component { ... }
}
```

---

## 🚀 Performance Optimizations

### Frontend

1. **Monaco Editor**: Loaded asynchronously
2. **Component Optimization**: Functional components with hooks
3. **API Calls**: Centralized with axios for request cancellation
4. **CSS**: Minimized, compiled SCSS

### Backend

1. **Connection Pooling**: PostgreSQL pool for efficient connections
2. **Query Timeout**: Prevents long-running queries
3. **Result Limiting**: Max 1000 rows returned
4. **Error Handling**: Fast fail with meaningful messages

### Database

1. **MongoDB Indexes**: On difficulty, createdAt, userId
2. **PostgreSQL**: Schema-level isolation (faster than row-level)

---

## 🔄 Scalability Considerations

### Current Architecture

- Single server deployment
- Session-based schema isolation
- Suitable for 100s of concurrent users

### Future Scalability

1. **Horizontal Scaling**:

   - Load balancer in front of multiple backend instances
   - Stateless design supports this

2. **Database Scaling**:

   - MongoDB: Sharding by difficulty/tags
   - PostgreSQL: Read replicas for query execution

3. **Caching**:

   - Redis for assignment caching
   - CDN for frontend assets

4. **Microservices** (if needed):
   - Query execution service
   - Hint generation service
   - User management service

---

## 🧪 Testing Architecture

### Unit Tests (Future)

- Services: `queryExecutionService`, `llmService`
- Models: Schema validation
- Utilities: Helper functions

### Integration Tests (Future)

- API endpoints end-to-end
- Database operations
- LLM integration

### Manual Testing (Current)

- See TESTING_GUIDE.md

---

## 📈 Monitoring & Logging (Future)

### Key Metrics

- Query execution time
- Error rates
- Hint generation success rate
- User completion rate per assignment

### Logging

- Request logs (Express middleware)
- Error logs (Winston/Bunyan)
- Query logs (PostgreSQL)
- LLM API logs

---

## 🔮 Future Enhancements

### Phase 1 (Immediate)

- User authentication (JWT)
- Progress persistence in UI
- More sample assignments
- Better error messages

### Phase 2 (Medium-term)

- Real-time collaboration
- Assignment creation UI (for admins)
- Leaderboards
- Achievement system

### Phase 3 (Long-term)

- Multiple SQL dialects (MySQL, SQLite)
- Notebook-style interface
- Video explanations
- Community-submitted assignments

---

## 📚 Technology Decisions

### Why React?

- Component-based architecture
- Large ecosystem
- Great developer experience
- Easy to learn and scale

### Why MongoDB?

- Flexible schema for assignments
- Easy to add new fields
- Great for semi-structured data
- Horizontal scalability

### Why PostgreSQL?

- Robust SQL support
- Schema isolation feature
- ACID compliance
- Industry standard

### Why Monaco Editor?

- Same editor as VS Code
- Excellent SQL support
- Syntax highlighting
- Professional UX

### Why SCSS?

- Variables and mixins (DRY)
- Nesting for readability
- Compile-time error checking
- Better than plain CSS at scale

---

## 🎓 Learning Resources

### Understanding the Architecture

1. **Three-tier architecture**: Presentation, Application, Data
2. **RESTful API design**: Stateless, resource-based
3. **Schema isolation**: PostgreSQL namespaces
4. **Prompt engineering**: LLM instruction design

### Key Concepts

- **Sandbox**: Isolated execution environment
- **Schema**: Database namespace for organizing tables
- **Stateless API**: Each request is independent
- **Mobile-first**: Design for small screens first

---

This architecture is designed to be:

- ✅ Educational (easy to understand)
- ✅ Secure (query validation, isolation)
- ✅ Scalable (stateless design)
- ✅ Maintainable (separation of concerns)
- ✅ User-friendly (responsive, fast feedback)

---

**Note**: This is a learning project. Production deployment would require additional considerations (authentication, rate limiting, monitoring, backups, etc.)
