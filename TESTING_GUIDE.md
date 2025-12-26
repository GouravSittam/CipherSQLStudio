# CipherSQLStudio - Testing Guide

## Manual Testing Checklist

### ✅ Backend API Testing

#### 1. Health Check

```bash
curl http://localhost:5000/health
```

Expected: `{"status":"OK","message":"CipherSQLStudio API is running"}`

#### 2. List Assignments

```bash
curl http://localhost:5000/api/assignments
```

Expected: JSON array with 6 assignments

#### 3. Get Single Assignment

```bash
curl http://localhost:5000/api/assignments/{assignment_id}
```

Expected: Full assignment details with sample tables

#### 4. Execute Query

```bash
curl -X POST http://localhost:5000/api/execute/query \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId": "your_assignment_id",
    "query": "SELECT * FROM employees",
    "sessionId": "test-session-123"
  }'
```

Expected: Results with rows, execution time, and correctness flag

#### 5. Get Hint

```bash
curl -X POST http://localhost:5000/api/hints \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId": "your_assignment_id",
    "currentQuery": "SELECT ",
    "previousHints": []
  }'
```

Expected: LLM-generated hint (not solution)

### ✅ Frontend Testing

#### Assignment List Page (/)

- [ ] All 6 assignments display
- [ ] Difficulty badges show correct colors
  - Easy: Green
  - Medium: Orange
  - Hard: Red
- [ ] Filter buttons work (All, Easy, Medium, Hard)
- [ ] Cards are clickable and navigate to attempt page
- [ ] Responsive on mobile (320px), tablet (641px), desktop (1024px)

#### Assignment Attempt Page (/assignment/:id)

- [ ] Back button navigates to list
- [ ] Question displays correctly
- [ ] Sample data tables show with proper formatting
- [ ] Column types display under column names
- [ ] Monaco Editor loads and allows SQL input
- [ ] Syntax highlighting works

#### Query Execution

- [ ] Execute button triggers query
- [ ] Loading state shows while executing
- [ ] Results display in formatted table
- [ ] Execution time displays
- [ ] Correct queries show green ✓ badge
- [ ] Error messages display for invalid queries

#### Hint System

- [ ] Get Hint button works
- [ ] Loading state shows while fetching
- [ ] Hints display in hints panel
- [ ] Multiple hints stack (Hint 1, Hint 2, etc.)
- [ ] Hints are helpful but don't give solutions

### ✅ Mobile Responsiveness Testing

#### Mobile (320px - 640px)

- [ ] Header logo icon shows, text hidden
- [ ] Assignment cards stack vertically
- [ ] Filter buttons wrap properly
- [ ] Editor panel takes full width
- [ ] Tables scroll horizontally
- [ ] Touch-friendly button sizes (min 44px height)

#### Tablet (641px - 1023px)

- [ ] Header shows full logo text
- [ ] Assignment grid: 2 columns
- [ ] Editor and results stack vertically
- [ ] Better spacing and padding

#### Desktop (1024px+)

- [ ] Assignment grid: 3 columns
- [ ] Two-column layout (question left, editor right)
- [ ] Full feature visibility
- [ ] Optimal readability

### ✅ Security Testing

#### Query Validation

Test these queries should FAIL:

```sql
-- Should fail: DROP not allowed
DROP TABLE employees;

-- Should fail: DELETE not allowed
DELETE FROM employees WHERE id = 1;

-- Should fail: INSERT not allowed
INSERT INTO employees VALUES (10, 'Hacker', 'Evil', 0);

-- Should fail: UPDATE not allowed
UPDATE employees SET salary = 999999;

-- Should fail: Not a SELECT
CREATE TABLE hack (id INT);
```

#### Query Isolation

1. Open assignment in two different browser windows/tabs
2. Execute queries in both
3. Verify results don't interfere (different sessionIds)

### ✅ LLM Hint Quality Testing

For assignment "Filter High Salaries":

**Good Hint (Expected):**

- "Think about using a WHERE clause to filter rows"
- "Consider comparing the salary column to a value"
- "What SQL keyword lets you filter data?"

**Bad Hint (Should NOT happen):**

- "SELECT name, salary FROM employees WHERE salary > 70000"
- "Here's the solution: ..."
- Full query revealed

If hints are too revealing, adjust the system prompt in `backend/services/llmService.js`

### ✅ Performance Testing

#### Query Execution Timeout

Execute a slow query (if possible):

```sql
-- Should timeout after 5 seconds
SELECT * FROM employees WHERE id IN (
  SELECT id FROM employees WHERE id IN (
    SELECT id FROM employees
  )
);
```

#### Large Result Set

Try to return more than 1000 rows:

- Expected: Results truncated
- Warning message shows

### ✅ Error Handling Testing

#### Backend Errors

1. Stop MongoDB → Try to load assignments
   - Expected: Error message displayed
2. Stop PostgreSQL → Try to execute query

   - Expected: Error message displayed

3. Invalid Assignment ID

   - Expected: 404 error, "Assignment not found"

4. Empty query
   - Expected: "Please write a SQL query first"

#### Frontend Errors

1. Backend not running → Load assignments

   - Expected: Error message with Retry button

2. Network error during query execution
   - Expected: Error displayed in results panel

### ✅ Data Flow Verification

Use browser DevTools Network tab to verify:

1. **Load Assignments**

   - Request: GET /api/assignments
   - Response: Array of assignments
   - Status: 200

2. **Execute Query**

   - Request: POST /api/execute/query
   - Body includes: assignmentId, query, sessionId
   - Response: success, data, executionTime, isCorrect
   - Status: 200

3. **Get Hint**
   - Request: POST /api/hints
   - Body includes: assignmentId, currentQuery
   - Response: success, hint
   - Status: 200

## Automated Testing (Future Enhancement)

### Backend Unit Tests

```javascript
// Example test structure
describe("Query Execution Service", () => {
  it("should reject DROP queries", () => {
    expect(() => {
      queryService.validateQuery("DROP TABLE employees");
    }).toThrow("Operation not allowed: DROP");
  });

  it("should accept SELECT queries", () => {
    expect(() => {
      queryService.validateQuery("SELECT * FROM employees");
    }).not.toThrow();
  });
});
```

### Frontend Component Tests

```javascript
// Example with React Testing Library
describe("AssignmentCard", () => {
  it("renders assignment title", () => {
    render(<AssignmentCard assignment={mockAssignment} />);
    expect(screen.getByText("Select All Employees")).toBeInTheDocument();
  });
});
```

## Bug Report Template

When you find a bug, document it:

```
**Bug Description:**
[What went wrong?]

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error

**Expected Behavior:**
[What should happen?]

**Actual Behavior:**
[What actually happened?]

**Screenshots:**
[If applicable]

**Environment:**
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox/Safari
- Screen Size: Mobile/Tablet/Desktop
```

## Performance Benchmarks

### Query Execution Time

- Simple SELECT: < 50ms
- JOIN query: < 100ms
- GROUP BY with aggregate: < 150ms
- Complex subquery: < 300ms
- Timeout threshold: 5000ms

### Page Load Time

- Assignment list: < 1s
- Assignment attempt: < 1.5s (includes Monaco Editor)

### API Response Time

- GET /api/assignments: < 200ms
- GET /api/assignments/:id: < 150ms
- POST /api/execute/query: < 300ms (excluding query execution)
- POST /api/hints: 1-3s (depends on LLM API)

## Testing Sign-off

Before submission, ensure:

- [ ] All core features work
- [ ] Mobile responsive on all breakpoints
- [ ] Security validations pass
- [ ] LLM hints are helpful but not solutions
- [ ] No console errors in browser
- [ ] No errors in server logs
- [ ] Sample assignments load correctly
- [ ] Query execution is fast
- [ ] Error messages are user-friendly

## Next Steps After Testing

1. **Fix Critical Bugs**: Priority 1 issues
2. **Document Known Issues**: For non-critical bugs
3. **Optimize Performance**: If needed
4. **Enhance UX**: Based on testing feedback
5. **Add More Assignments**: Expand the catalog
6. **Deploy**: Follow production checklist in QUICK_START.md

Good luck with testing! 🧪
