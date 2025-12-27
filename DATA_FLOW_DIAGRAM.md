# CipherSQLStudio - Data Flow Diagram

**🎮 Created by Gourav Chaudhary** | [GitHub](https://github.com/GouravSittam)

## User Flow: Execute SQL Query

```
┌─────────────┐
│   USER      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. User writes SQL query in Monaco Editor (SQL Terminal)
       │    (e.g., "SELECT * FROM employees")
       ▼
┌──────────────────┐
│  CLIENT (React)  │
│  - SQLEditor     │
│  - State: query  │
└──────┬───────────┘
       │
       │ 2. User clicks "▶ EXECUTE" button
       │    onClick={handleExecuteQuery}
       │
       │ 3. Client calls API service
       │    executeQuery(assignmentId, query, sessionId)
       ▼
┌─────────────────────────────┐
│  API Service (axios)        │
│  POST /api/execute/query    │
│  Body: {                    │
│    assignmentId,            │
│    query,                   │
│    sessionId                │
│  }                          │
└──────┬──────────────────────┘
       │
       │ 4. HTTP Request sent to server
       ▼
┌─────────────────────────────┐
│  SERVER (Express)           │
│  Route: /api/execute/query  │
└──────┬──────────────────────┘
       │
       │ 5. Fetch assignment from MongoDB
       ▼
┌─────────────────────────────┐
│  MongoDB Atlas              │
│  Collection: assignments    │
│  - Find by assignmentId     │
│  - Returns: sampleTables,   │
│    question, expectedOutput │
└──────┬──────────────────────┘
       │
       │ 6. Assignment data returned
       ▼
┌─────────────────────────────┐
│  QueryExecutionService      │
│  - createSandboxSchema()    │
└──────┬──────────────────────┘
       │
       │ 7. Create isolated schema
       │    CREATE SCHEMA workspace_{sessionId}
       ▼
┌─────────────────────────────┐
│  PostgreSQL                 │
│  - Schema created           │
│  - SET search_path          │
└──────┬──────────────────────┘
       │
       │ 8. Load sample tables
       │    CREATE TABLE, INSERT rows
       ▼
┌─────────────────────────────┐
│  PostgreSQL                 │
│  workspace_{sessionId}:     │
│  - employees table created  │
│  - Sample data inserted     │
└──────┬──────────────────────┘
       │
       │ 9. Validate query (security check)
       │    - Block DROP, DELETE, etc.
       │    - Must start with SELECT
       ▼
┌─────────────────────────────┐
│  QueryExecutionService      │
│  - validateQuery()          │
└──────┬──────────────────────┘
       │
       │ 10. Execute user's query
       │     SET statement_timeout
       │     Execute query in sandbox
       ▼
┌─────────────────────────────┐
│  PostgreSQL                 │
│  - Query executed           │
│  - Results returned         │
│  - Execution time tracked   │
└──────┬──────────────────────┘
       │
       │ 11. Format results
       │     { rows, rowCount, executionTime }
       ▼
┌─────────────────────────────┐
│  LLM Service                │
│  - validateQuery()          │
│  - Compare with expected    │
└──────┬──────────────────────┘
       │
       │ 12. Check if query is correct
       │     isCorrect = (userResult === expectedOutput)
       │
       │ 13. Send response to client
       ▼
┌─────────────────────────────┐
│  SERVER Response            │
│  {                          │
│    success: true,           │
│    data: [...rows],         │
│    rowCount: 4,             │
│    executionTime: 23,       │
│    isCorrect: true,         │
│    sessionId                │
│  }                          │
└──────┬──────────────────────┘
       │
       │ 14. Response received by client
       ▼
┌─────────────────────────────┐
│  CLIENT (React)             │
│  - setResults(response)     │
│  - setSessionId()           │
└──────┬──────────────────────┘
       │
       │ 15. Update UI with results
       ▼
┌─────────────────────────────┐
│  ResultsPanel Component     │
│  🎮 OUTPUT CONSOLE          │
│  - Displays data table      │
│  - Shows execution time     │
│  - Shows VICTORY badge if   │
│    isCorrect === true       │
└──────┬──────────────────────┘
       │
       │ 16. User sees results
       ▼
┌─────────────┐
│   USER      │
│  (Browser)  │
│  Sees:      │
│  - Data     │
│  - ✓ VICTORY│
│  - Time     │
└─────────────┘
```

## User Flow: Get Hint (Power-Up)

```
┌─────────────┐
│   USER      │
└──────┬──────┘
       │ 1. Clicks "💡 POWER-UP" button
       ▼
┌──────────────────┐
│  CLIENT (React)  │
│  handleGetHint() │
└──────┬───────────┘
       │ 2. API call: getHint(assignmentId, query, previousHints)
       ▼
┌─────────────────────────────┐
│  SERVER                     │
│  POST /api/hints            │
└──────┬──────────────────────┘
       │ 3. Fetch assignment from MongoDB
       ▼
┌─────────────────────────────┐
│  MongoDB Atlas              │
│  - Get assignment details   │
└──────┬──────────────────────┘
       │ 4. Assignment data
       ▼
┌─────────────────────────────┐
│  LLM Service                │
│  - generateHint()           │
└──────┬──────────────────────┘
       │ 5. Construct prompt with:
       │    - Question
       │    - Sample tables
       │    - User's current query
       │    - Previous hints
       │    - System prompt (no solutions!)
       ▼
┌─────────────────────────────┐
│  OpenAI API / Gemini        │
│  - Process prompt           │
│  - Generate hint            │
└──────┬──────────────────────┘
       │ 6. LLM returns hint
       │    "Think about using the WHERE clause
       │     to filter rows based on a condition"
       ▼
┌─────────────────────────────┐
│  SERVER Response            │
│  { success: true,           │
│    hint: "..." }            │
└──────┬──────────────────────┘
       │ 7. Client receives hint
       ▼
┌─────────────────────────────┐
│  CLIENT                     │
│  - setHints([...hints,      │
│              newHint])      │
└──────┬──────────────────────┘
       │ 8. Display in Power-Ups Panel
       ▼
┌─────────────┐
│   USER      │
│  Sees hint  │
└─────────────┘
```

## Database Schemas

### MongoDB (Persistence)

- **assignments**: Pre-configured SQL challenges
- **userProgress**: User's attempt history (optional)

### PostgreSQL (Sandbox)

- **workspace\_{sessionId}**: Isolated schema per user
- **Dynamic tables**: Created based on assignment

## Security Measures

1. Query validation (no DROP, DELETE, etc.)
2. Schema isolation per session
3. Query timeout (5 seconds)
4. Result row limit (1000 rows)
5. LLM prompt engineering (hints only, no solutions)

---

## 🎨 Theme

This project uses the **Brutalist Gaming Theme**:

- **Dark backgrounds** with neon accents
- **Bold 4px borders** with offset shadows
- **Gaming terminology** (Challenges, Power-Ups, Victory)
- **Space Grotesk** + **JetBrains Mono** fonts
