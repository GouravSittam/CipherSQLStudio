/**
 * =================================================
 * SEED ASSIGNMENTS SCRIPT
 * =================================================
 *
 * Author: Gourav Chaudhary
 *
 * This script populates our MongoDB database with SQL challenges.
 * Run this once when setting up, or whenever you want to reset
 * the challenges back to defaults.
 *
 * Usage:
 *   node scripts/seedAssignments.js
 *
 * I spent WAY too much time coming up with these challenges lol
 * Some are inspired by real interview questions, others I just
 * made up based on common SQL patterns students struggle with.
 *
 * Difficulty breakdown:
 *   - Easy: Basic SELECT, WHERE, simple filtering
 *   - Medium: JOINs, GROUP BY, subqueries
 *   - Hard: Window functions, CTEs, complex analytics
 *
 * Feel free to add more challenges! Just follow the same format.
 * =================================================
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");

// All our SQL challenges - organized by difficulty
const sampleAssignments = [
  // ==================== EASY CHALLENGES ====================
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
    title: "Select All Products",
    difficulty: "Easy",
    question: "Retrieve all products from the products table",
    sampleTables: [
      {
        tableName: "products",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "price", dataType: "REAL" },
          { columnName: "category", dataType: "TEXT" },
        ],
        rows: [
          [1, "Laptop", 999.99, "Electronics"],
          [2, "Mouse", 29.99, "Electronics"],
          [3, "Desk Chair", 199.99, "Furniture"],
          [4, "Notebook", 4.99, "Stationery"],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { id: 1, name: "Laptop", price: 999.99, category: "Electronics" },
        { id: 2, name: "Mouse", price: 29.99, category: "Electronics" },
        { id: 3, name: "Desk Chair", price: 199.99, category: "Furniture" },
        { id: 4, name: "Notebook", price: 4.99, category: "Stationery" },
      ],
    },
    tags: ["SELECT", "basics"],
  },
  {
    title: "Find Students by Age",
    difficulty: "Easy",
    question: "Find all students who are 18 years or older",
    sampleTables: [
      {
        tableName: "students",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "age", dataType: "INTEGER" },
          { columnName: "grade", dataType: "TEXT" },
        ],
        rows: [
          [1, "John", 17, "11th"],
          [2, "Emma", 18, "12th"],
          [3, "Mike", 19, "12th"],
          [4, "Sarah", 16, "10th"],
          [5, "Alex", 18, "12th"],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { id: 2, name: "Emma", age: 18, grade: "12th" },
        { id: 3, name: "Mike", age: 19, grade: "12th" },
        { id: 5, name: "Alex", age: 18, grade: "12th" },
      ],
    },
    tags: ["SELECT", "WHERE", "comparison"],
  },
  {
    title: "Sort Products by Price",
    difficulty: "Easy",
    question: "List all products sorted by price from lowest to highest",
    sampleTables: [
      {
        tableName: "products",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "price", dataType: "REAL" },
        ],
        rows: [
          [1, "Phone", 699.0],
          [2, "Charger", 19.99],
          [3, "Headphones", 149.99],
          [4, "Cable", 9.99],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { id: 4, name: "Cable", price: 9.99 },
        { id: 2, name: "Charger", price: 19.99 },
        { id: 3, name: "Headphones", price: 149.99 },
        { id: 1, name: "Phone", price: 699.0 },
      ],
    },
    tags: ["SELECT", "ORDER BY", "sorting"],
  },
  {
    title: "Find Active Users",
    difficulty: "Easy",
    question: "Find all users whose status is 'active'",
    sampleTables: [
      {
        tableName: "users",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "username", dataType: "TEXT" },
          { columnName: "email", dataType: "TEXT" },
          { columnName: "status", dataType: "TEXT" },
        ],
        rows: [
          [1, "gamer123", "gamer@email.com", "active"],
          [2, "coder456", "coder@email.com", "inactive"],
          [3, "designer", "design@email.com", "active"],
          [4, "writer99", "writer@email.com", "banned"],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        {
          id: 1,
          username: "gamer123",
          email: "gamer@email.com",
          status: "active",
        },
        {
          id: 3,
          username: "designer",
          email: "design@email.com",
          status: "active",
        },
      ],
    },
    tags: ["SELECT", "WHERE", "text matching"],
  },
  {
    title: "Count Total Records",
    difficulty: "Easy",
    question: "Count the total number of books in the library",
    sampleTables: [
      {
        tableName: "books",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "title", dataType: "TEXT" },
          { columnName: "author", dataType: "TEXT" },
        ],
        rows: [
          [1, "The Great Gatsby", "F. Scott Fitzgerald"],
          [2, "To Kill a Mockingbird", "Harper Lee"],
          [3, "1984", "George Orwell"],
          [4, "Pride and Prejudice", "Jane Austen"],
          [5, "The Catcher in the Rye", "J.D. Salinger"],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [{ count: 5 }],
    },
    tags: ["COUNT", "aggregation", "basics"],
  },
  {
    title: "Select Specific Columns",
    difficulty: "Easy",
    question: "Display only the name and email of all employees",
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "email", dataType: "TEXT" },
          { columnName: "department", dataType: "TEXT" },
          { columnName: "salary", dataType: "INTEGER" },
        ],
        rows: [
          [1, "Alice", "alice@company.com", "HR", 50000],
          [2, "Bob", "bob@company.com", "IT", 65000],
          [3, "Carol", "carol@company.com", "Sales", 55000],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { name: "Alice", email: "alice@company.com" },
        { name: "Bob", email: "bob@company.com" },
        { name: "Carol", email: "carol@company.com" },
      ],
    },
    tags: ["SELECT", "columns", "basics"],
  },
  {
    title: "Find Items in Price Range",
    difficulty: "Easy",
    question: "Find all items with price between 10 and 50 (inclusive)",
    sampleTables: [
      {
        tableName: "items",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "price", dataType: "REAL" },
        ],
        rows: [
          [1, "Pen", 5.0],
          [2, "Book", 25.0],
          [3, "Bag", 45.0],
          [4, "Watch", 150.0],
          [5, "Wallet", 35.0],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { id: 2, name: "Book", price: 25.0 },
        { id: 3, name: "Bag", price: 45.0 },
        { id: 5, name: "Wallet", price: 35.0 },
      ],
    },
    tags: ["SELECT", "WHERE", "BETWEEN", "range"],
  },

  // ==================== MEDIUM CHALLENGES ====================
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
    title: "Average Salary by Department",
    difficulty: "Medium",
    question: "Calculate the average salary for each department",
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
          [1, "Alice", "Engineering", 80000],
          [2, "Bob", "Engineering", 90000],
          [3, "Carol", "Sales", 60000],
          [4, "Dave", "Sales", 70000],
          [5, "Eve", "HR", 55000],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { department: "Engineering", avg_salary: 85000 },
        { department: "Sales", avg_salary: 65000 },
        { department: "HR", avg_salary: 55000 },
      ],
    },
    tags: ["GROUP BY", "AVG", "aggregation"],
  },
  {
    title: "Products with Categories",
    difficulty: "Medium",
    question: "List all products with their category names using a JOIN",
    sampleTables: [
      {
        tableName: "products",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "category_id", dataType: "INTEGER" },
          { columnName: "price", dataType: "REAL" },
        ],
        rows: [
          [1, "iPhone", 1, 999.0],
          [2, "MacBook", 1, 1999.0],
          [3, "T-Shirt", 2, 29.99],
          [4, "Jeans", 2, 59.99],
        ],
      },
      {
        tableName: "categories",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
        ],
        rows: [
          [1, "Electronics"],
          [2, "Clothing"],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { product_name: "iPhone", category_name: "Electronics", price: 999.0 },
        {
          product_name: "MacBook",
          category_name: "Electronics",
          price: 1999.0,
        },
        { product_name: "T-Shirt", category_name: "Clothing", price: 29.99 },
        { product_name: "Jeans", category_name: "Clothing", price: 59.99 },
      ],
    },
    tags: ["JOIN", "INNER JOIN", "multiple tables"],
  },
  {
    title: "Find Duplicate Emails",
    difficulty: "Medium",
    question: "Find all emails that appear more than once in the users table",
    sampleTables: [
      {
        tableName: "users",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "email", dataType: "TEXT" },
        ],
        rows: [
          [1, "John", "john@email.com"],
          [2, "Jane", "jane@email.com"],
          [3, "Johnny", "john@email.com"],
          [4, "Janet", "jane@email.com"],
          [5, "Jake", "jake@email.com"],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [{ email: "john@email.com" }, { email: "jane@email.com" }],
    },
    tags: ["GROUP BY", "HAVING", "COUNT", "duplicates"],
  },
  {
    title: "Top 3 Expensive Products",
    difficulty: "Medium",
    question: "Find the top 3 most expensive products",
    sampleTables: [
      {
        tableName: "products",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "price", dataType: "REAL" },
        ],
        rows: [
          [1, "Laptop", 1200.0],
          [2, "Phone", 800.0],
          [3, "Tablet", 500.0],
          [4, "Monitor", 350.0],
          [5, "Keyboard", 100.0],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { id: 1, name: "Laptop", price: 1200.0 },
        { id: 2, name: "Phone", price: 800.0 },
        { id: 3, name: "Tablet", price: 500.0 },
      ],
    },
    tags: ["ORDER BY", "LIMIT", "sorting"],
  },
  {
    title: "Students with Courses",
    difficulty: "Medium",
    question: "List all students along with the courses they are enrolled in",
    sampleTables: [
      {
        tableName: "students",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
        ],
        rows: [
          [1, "Alice"],
          [2, "Bob"],
          [3, "Carol"],
        ],
      },
      {
        tableName: "enrollments",
        columns: [
          { columnName: "student_id", dataType: "INTEGER" },
          { columnName: "course_id", dataType: "INTEGER" },
        ],
        rows: [
          [1, 101],
          [1, 102],
          [2, 101],
          [3, 103],
        ],
      },
      {
        tableName: "courses",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
        ],
        rows: [
          [101, "Mathematics"],
          [102, "Physics"],
          [103, "Chemistry"],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { student_name: "Alice", course_name: "Mathematics" },
        { student_name: "Alice", course_name: "Physics" },
        { student_name: "Bob", course_name: "Mathematics" },
        { student_name: "Carol", course_name: "Chemistry" },
      ],
    },
    tags: ["JOIN", "multiple tables", "many-to-many"],
  },
  {
    title: "Orders in Date Range",
    difficulty: "Medium",
    question: "Find all orders placed in January 2024",
    sampleTables: [
      {
        tableName: "orders",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "customer_name", dataType: "TEXT" },
          { columnName: "order_date", dataType: "DATE" },
          { columnName: "amount", dataType: "REAL" },
        ],
        rows: [
          [1, "John", "2024-01-05", 150.0],
          [2, "Jane", "2024-01-15", 200.0],
          [3, "Mike", "2024-02-01", 175.0],
          [4, "Sarah", "2024-01-28", 300.0],
          [5, "Tom", "2023-12-20", 250.0],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        {
          id: 1,
          customer_name: "John",
          order_date: "2024-01-05",
          amount: 150.0,
        },
        {
          id: 2,
          customer_name: "Jane",
          order_date: "2024-01-15",
          amount: 200.0,
        },
        {
          id: 4,
          customer_name: "Sarah",
          order_date: "2024-01-28",
          amount: 300.0,
        },
      ],
    },
    tags: ["WHERE", "DATE", "BETWEEN", "filtering"],
  },
  {
    title: "Employees Without Manager",
    difficulty: "Medium",
    question:
      "Find all employees who do not have a manager (manager_id is NULL)",
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "manager_id", dataType: "INTEGER" },
        ],
        rows: [
          [1, "CEO John", null],
          [2, "Manager Alice", 1],
          [3, "Developer Bob", 2],
          [4, "CTO Sarah", null],
          [5, "Designer Carol", 2],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { id: 1, name: "CEO John", manager_id: null },
        { id: 4, name: "CTO Sarah", manager_id: null },
      ],
    },
    tags: ["WHERE", "NULL", "IS NULL"],
  },
  {
    title: "Combine Results with UNION",
    difficulty: "Medium",
    question: "Get a combined list of all customer and supplier names",
    sampleTables: [
      {
        tableName: "customers",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
        ],
        rows: [
          [1, "Alpha Corp"],
          [2, "Beta Inc"],
        ],
      },
      {
        tableName: "suppliers",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
        ],
        rows: [
          [1, "Gamma Ltd"],
          [2, "Delta Co"],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { name: "Alpha Corp" },
        { name: "Beta Inc" },
        { name: "Gamma Ltd" },
        { name: "Delta Co" },
      ],
    },
    tags: ["UNION", "combining", "set operations"],
  },

  // ==================== HARD CHALLENGES ====================
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
  {
    title: "Second Highest Salary",
    difficulty: "Hard",
    question: "Find the second highest salary in the company",
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
          [3, "Charlie", 60000],
          [4, "Diana", 75000],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [{ second_highest_salary: 75000 }],
    },
    tags: ["SUBQUERY", "DISTINCT", "OFFSET", "advanced"],
  },
  {
    title: "Employees Earning More Than Manager",
    difficulty: "Hard",
    question: "Find employees who earn more than their manager",
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "salary", dataType: "INTEGER" },
          { columnName: "manager_id", dataType: "INTEGER" },
        ],
        rows: [
          [1, "John", 100000, null],
          [2, "Alice", 80000, 1],
          [3, "Bob", 95000, 2],
          [4, "Carol", 75000, 2],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [{ employee_name: "Bob" }],
    },
    tags: ["SELF JOIN", "comparison", "advanced"],
  },
  {
    title: "Customers Who Never Ordered",
    difficulty: "Hard",
    question: "Find customers who have never placed an order",
    sampleTables: [
      {
        tableName: "customers",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
        ],
        rows: [
          [1, "John"],
          [2, "Jane"],
          [3, "Mike"],
          [4, "Sarah"],
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
          [1, 1, 100.0],
          [2, 1, 200.0],
          [3, 3, 150.0],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [{ name: "Jane" }, { name: "Sarah" }],
    },
    tags: ["LEFT JOIN", "NULL", "NOT IN", "advanced"],
  },
  {
    title: "Running Total of Sales",
    difficulty: "Hard",
    question: "Calculate the running total of sales ordered by date",
    sampleTables: [
      {
        tableName: "sales",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "sale_date", dataType: "DATE" },
          { columnName: "amount", dataType: "REAL" },
        ],
        rows: [
          [1, "2024-01-01", 100.0],
          [2, "2024-01-02", 150.0],
          [3, "2024-01-03", 200.0],
          [4, "2024-01-04", 75.0],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { sale_date: "2024-01-01", amount: 100.0, running_total: 100.0 },
        { sale_date: "2024-01-02", amount: 150.0, running_total: 250.0 },
        { sale_date: "2024-01-03", amount: 200.0, running_total: 450.0 },
        { sale_date: "2024-01-04", amount: 75.0, running_total: 525.0 },
      ],
    },
    tags: ["WINDOW FUNCTION", "SUM", "OVER", "advanced"],
  },
  {
    title: "Rank Employees by Salary",
    difficulty: "Hard",
    question:
      "Rank employees by salary within each department (highest salary = rank 1)",
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
          [1, "Alice", "Engineering", 90000],
          [2, "Bob", "Engineering", 85000],
          [3, "Carol", "Sales", 70000],
          [4, "Dave", "Sales", 75000],
          [5, "Eve", "Engineering", 80000],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { name: "Alice", department: "Engineering", salary: 90000, rank: 1 },
        { name: "Bob", department: "Engineering", salary: 85000, rank: 2 },
        { name: "Eve", department: "Engineering", salary: 80000, rank: 3 },
        { name: "Dave", department: "Sales", salary: 75000, rank: 1 },
        { name: "Carol", department: "Sales", salary: 70000, rank: 2 },
      ],
    },
    tags: ["WINDOW FUNCTION", "RANK", "PARTITION BY", "advanced"],
  },
  {
    title: "Find Consecutive Days",
    difficulty: "Hard",
    question: "Find users who logged in for at least 2 consecutive days",
    sampleTables: [
      {
        tableName: "logins",
        columns: [
          { columnName: "user_id", dataType: "INTEGER" },
          { columnName: "login_date", dataType: "DATE" },
        ],
        rows: [
          [1, "2024-01-01"],
          [1, "2024-01-02"],
          [1, "2024-01-05"],
          [2, "2024-01-01"],
          [2, "2024-01-03"],
          [3, "2024-01-10"],
          [3, "2024-01-11"],
          [3, "2024-01-12"],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [{ user_id: 1 }, { user_id: 3 }],
    },
    tags: ["SELF JOIN", "DATE", "consecutive", "advanced"],
  },
  {
    title: "Department with Highest Total Salary",
    difficulty: "Hard",
    question: "Find the department(s) with the highest total salary expense",
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
          [1, "Alice", "Engineering", 80000],
          [2, "Bob", "Engineering", 90000],
          [3, "Carol", "Sales", 60000],
          [4, "Dave", "Sales", 70000],
          [5, "Eve", "HR", 50000],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [{ department: "Engineering", total_salary: 170000 }],
    },
    tags: ["SUBQUERY", "GROUP BY", "MAX", "advanced"],
  },
  {
    title: "Products Never Ordered",
    difficulty: "Hard",
    question: "Find products that have never been ordered",
    sampleTables: [
      {
        tableName: "products",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "price", dataType: "REAL" },
        ],
        rows: [
          [1, "Laptop", 999.0],
          [2, "Mouse", 29.0],
          [3, "Keyboard", 79.0],
          [4, "Monitor", 299.0],
        ],
      },
      {
        tableName: "order_items",
        columns: [
          { columnName: "order_id", dataType: "INTEGER" },
          { columnName: "product_id", dataType: "INTEGER" },
          { columnName: "quantity", dataType: "INTEGER" },
        ],
        rows: [
          [1, 1, 2],
          [1, 2, 1],
          [2, 1, 1],
          [3, 3, 3],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [{ id: 4, name: "Monitor", price: 299.0 }],
    },
    tags: ["LEFT JOIN", "NOT EXISTS", "advanced"],
  },
  {
    title: "Moving Average of Sales",
    difficulty: "Hard",
    question: "Calculate the 3-day moving average of sales",
    sampleTables: [
      {
        tableName: "daily_sales",
        columns: [
          { columnName: "sale_date", dataType: "DATE" },
          { columnName: "amount", dataType: "REAL" },
        ],
        rows: [
          ["2024-01-01", 100.0],
          ["2024-01-02", 150.0],
          ["2024-01-03", 200.0],
          ["2024-01-04", 120.0],
          ["2024-01-05", 180.0],
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { sale_date: "2024-01-03", moving_avg: 150.0 },
        { sale_date: "2024-01-04", moving_avg: 156.67 },
        { sale_date: "2024-01-05", moving_avg: 166.67 },
      ],
    },
    tags: ["WINDOW FUNCTION", "AVG", "ROWS BETWEEN", "advanced"],
  },
];

// =================================================
// DATABASE SEEDING FUNCTION
// This is the main entry point - clears everything and starts fresh
// =================================================

async function seedDatabase() {
  try {
    // Step 1: Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Step 2: Wipe existing data (fresh start every time)
    await Assignment.deleteMany({});
    console.log("🗑️  Cleared existing assignments");

    // Step 3: Insert all our challenges
    await Assignment.insertMany(sampleAssignments);
    console.log(`✅ Inserted ${sampleAssignments.length} sample assignments`);

    // Step 4: Show what we seeded (nice for debugging)
    console.log("\n📊 Sample Assignments:");
    sampleAssignments.forEach((assignment, idx) => {
      console.log(`${idx + 1}. ${assignment.title} (${assignment.difficulty})`);
    });

    // Done! Exit cleanly
    process.exit(0);
  } catch (error) {
    // Something went wrong - log it and bail
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Kick off the seeding
seedDatabase();
