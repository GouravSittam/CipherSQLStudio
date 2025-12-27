require("dotenv").config();
const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");

const sampleAssignments = [
  {
    title: "Find High Salary Employees",
    difficulty: "Easy",
    question: "List all employees earning more than 50,000",
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "salary", dataType: "INTEGER" },
          { columnName: "department", dataType: "TEXT" },
        ],
        rows: [
          [1, "Alice", 45000, "HR"],
          [2, "Bob", 60000, "Engineering"],
          [3, "Charlie", 75000, "Engineering"],
          [4, "Diana", 48000, "Sales"],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { id: 2, name: "Bob", salary: 60000, department: "Engineering" },
        { id: 3, name: "Charlie", salary: 75000, department: "Engineering" },
      ],
    },
    tags: ["SELECT", "WHERE", "filtering"],
  },
  {
    title: "Department-wise Employee Count",
    difficulty: "Medium",
    question: "Find the number of employees in each department",
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "department", dataType: "TEXT" },
        ],
        rows: [
          [1, "Alice", "HR"],
          [2, "Bob", "Engineering"],
          [3, "Charlie", "Engineering"],
          [4, "Diana", "Sales"],
          [5, "Eve", "Sales"],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { department: "HR", count: 1 },
        { department: "Engineering", count: 2 },
        { department: "Sales", count: 2 },
      ],
    },
    tags: ["GROUP BY", "COUNT", "aggregation"],
  },
  {
    title: "Total Order Value per Customer",
    difficulty: "Medium",
    question: "Find total order value for each customer",
    sampleTables: [
      {
        tableName: "customers",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
        ],
        rows: [
          [1, "Aman"],
          [2, "Saurabh"],
        ],
      },
      {
        tableName: "orders",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "customer_id", dataType: "INTEGER" },
          { columnName: "amount", dataType: "REAL" },
        ],
        rows: [
          [1, 1, 1200.5],
          [2, 1, 800.0],
          [3, 2, 1500.0],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { name: "Aman", total_amount: 2000.5 },
        { name: "Saurabh", total_amount: 1500.0 },
      ],
    },
    tags: ["JOIN", "SUM", "GROUP BY", "aggregation"],
  },
  {
    title: "Highest Paid Employee",
    difficulty: "Hard",
    question: "Find the employee(s) with the highest salary",
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "salary", dataType: "INTEGER" },
        ],
        rows: [
          [1, "Alice", 70000],
          [2, "Bob", 85000],
          [3, "Charlie", 85000],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { id: 2, name: "Bob", salary: 85000 },
        { id: 3, name: "Charlie", salary: 85000 },
      ],
    },
    tags: ["SUBQUERY", "MAX", "advanced"],
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
