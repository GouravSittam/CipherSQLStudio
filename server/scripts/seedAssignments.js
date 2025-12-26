require("dotenv").config();
const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");

const sampleAssignments = [
  {
    title: "Select All Employees",
    difficulty: "Easy",
    question:
      "Write a SQL query to retrieve all columns from the 'employees' table.",
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "department", dataType: "TEXT" },
          { columnName: "salary", dataType: "INTEGER" },
        ],
        rows: [
          [1, "John Doe", "Engineering", 75000],
          [2, "Jane Smith", "Marketing", 65000],
          [3, "Bob Johnson", "Engineering", 80000],
          [4, "Alice Williams", "HR", 60000],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { id: 1, name: "John Doe", department: "Engineering", salary: 75000 },
        { id: 2, name: "Jane Smith", department: "Marketing", salary: 65000 },
        {
          id: 3,
          name: "Bob Johnson",
          department: "Engineering",
          salary: 80000,
        },
        { id: 4, name: "Alice Williams", department: "HR", salary: 60000 },
      ],
    },
    tags: ["SELECT", "basics"],
  },
  {
    title: "Filter High Salaries",
    difficulty: "Easy",
    question:
      "Write a SQL query to find all employees who earn more than 70,000. Display their name and salary.",
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "department", dataType: "TEXT" },
          { columnName: "salary", dataType: "INTEGER" },
        ],
        rows: [
          [1, "John Doe", "Engineering", 75000],
          [2, "Jane Smith", "Marketing", 65000],
          [3, "Bob Johnson", "Engineering", 80000],
          [4, "Alice Williams", "HR", 60000],
          [5, "Charlie Brown", "Engineering", 90000],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { name: "John Doe", salary: 75000 },
        { name: "Bob Johnson", salary: 80000 },
        { name: "Charlie Brown", salary: 90000 },
      ],
    },
    tags: ["WHERE", "filtering"],
  },
  {
    title: "Count Employees by Department",
    difficulty: "Medium",
    question:
      "Write a SQL query to count the number of employees in each department. Display the department name and the count.",
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "department", dataType: "TEXT" },
          { columnName: "salary", dataType: "INTEGER" },
        ],
        rows: [
          [1, "John Doe", "Engineering", 75000],
          [2, "Jane Smith", "Marketing", 65000],
          [3, "Bob Johnson", "Engineering", 80000],
          [4, "Alice Williams", "HR", 60000],
          [5, "Charlie Brown", "Engineering", 90000],
          [6, "Diana Prince", "Marketing", 70000],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { department: "Engineering", count: 3 },
        { department: "Marketing", count: 2 },
        { department: "HR", count: 1 },
      ],
    },
    tags: ["GROUP BY", "COUNT", "aggregation"],
  },
  {
    title: "Join Orders with Customers",
    difficulty: "Medium",
    question:
      "Write a SQL query to join the 'orders' table with the 'customers' table and display the customer name along with their order details.",
    sampleTables: [
      {
        tableName: "customers",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "email", dataType: "TEXT" },
        ],
        rows: [
          [1, "Alice", "alice@example.com"],
          [2, "Bob", "bob@example.com"],
          [3, "Charlie", "charlie@example.com"],
        ],
      },
      {
        tableName: "orders",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "customer_id", dataType: "INTEGER" },
          { columnName: "product", dataType: "TEXT" },
          { columnName: "amount", dataType: "INTEGER" },
        ],
        rows: [
          [101, 1, "Laptop", 1200],
          [102, 2, "Phone", 800],
          [103, 1, "Mouse", 25],
          [104, 3, "Keyboard", 75],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { name: "Alice", product: "Laptop", amount: 1200 },
        { name: "Bob", product: "Phone", amount: 800 },
        { name: "Alice", product: "Mouse", amount: 25 },
        { name: "Charlie", product: "Keyboard", amount: 75 },
      ],
    },
    tags: ["JOIN", "INNER JOIN", "relationships"],
  },
  {
    title: "Find Top 3 Highest Paid Employees",
    difficulty: "Hard",
    question:
      "Write a SQL query to find the top 3 highest-paid employees. Display their name, department, and salary, ordered by salary in descending order.",
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "department", dataType: "TEXT" },
          { columnName: "salary", dataType: "INTEGER" },
        ],
        rows: [
          [1, "John Doe", "Engineering", 75000],
          [2, "Jane Smith", "Marketing", 65000],
          [3, "Bob Johnson", "Engineering", 95000],
          [4, "Alice Williams", "HR", 60000],
          [5, "Charlie Brown", "Engineering", 90000],
          [6, "Diana Prince", "Marketing", 85000],
          [7, "Eve Anderson", "Engineering", 100000],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { name: "Eve Anderson", department: "Engineering", salary: 100000 },
        { name: "Bob Johnson", department: "Engineering", salary: 95000 },
        { name: "Charlie Brown", department: "Engineering", salary: 90000 },
      ],
    },
    tags: ["ORDER BY", "LIMIT", "sorting"],
  },
  {
    title: "Subquery: Employees Above Average Salary",
    difficulty: "Hard",
    question:
      "Write a SQL query using a subquery to find all employees who earn more than the average salary. Display their name and salary.",
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "department", dataType: "TEXT" },
          { columnName: "salary", dataType: "INTEGER" },
        ],
        rows: [
          [1, "John Doe", "Engineering", 75000],
          [2, "Jane Smith", "Marketing", 65000],
          [3, "Bob Johnson", "Engineering", 95000],
          [4, "Alice Williams", "HR", 60000],
          [5, "Charlie Brown", "Engineering", 90000],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { name: "Bob Johnson", salary: 95000 },
        { name: "Charlie Brown", salary: 90000 },
      ],
    },
    tags: ["SUBQUERY", "AVG", "advanced"],
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Clear existing assignments
    await Assignment.deleteMany({});
    console.log("🗑️  Cleared existing assignments");

    // Insert sample assignments
    await Assignment.insertMany(sampleAssignments);
    console.log(`✅ Inserted ${sampleAssignments.length} sample assignments`);

    console.log("\n📊 Sample Assignments:");
    sampleAssignments.forEach((assignment, index) => {
      console.log(
        `${index + 1}. ${assignment.title} (${assignment.difficulty})`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
