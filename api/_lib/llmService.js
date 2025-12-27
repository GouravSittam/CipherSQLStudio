/**
 * LLM Service for Vercel Serverless
 *
 * AI-powered hints and query validation using OpenAI or Gemini.
 *
 * Author: Gourav Chaudhary
 */

const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

let openaiClient = null;
let geminiClient = null;

function getOpenAIClient() {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

function getGeminiClient() {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiClient = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }
  return geminiClient;
}

function getProvider() {
  return process.env.LLM_PROVIDER || "openai";
}

function isAvailable() {
  const provider = getProvider();
  if (provider === "openai") return !!getOpenAIClient();
  if (provider === "gemini") return !!getGeminiClient();
  return false;
}

function getFallbackHint(difficulty) {
  const hints = {
    easy: [
      "Start by identifying which columns you need from the table.",
      "Think about what the SELECT statement should return.",
      "Consider if you need a WHERE clause to filter results.",
    ],
    medium: [
      "Break down the problem into smaller parts.",
      "Consider which JOIN type might be appropriate here.",
      "Think about grouping and aggregation functions.",
    ],
    hard: [
      "This might require a subquery or CTE.",
      "Consider the order of operations in your query.",
      "Think about edge cases in your data.",
    ],
  };
  const difficultyHints = hints[difficulty] || hints.medium;
  return difficultyHints[Math.floor(Math.random() * difficultyHints.length)];
}

async function generateHint(assignment, userQuery, previousHints = []) {
  if (!isAvailable()) {
    return {
      success: true,
      hint: getFallbackHint(assignment.difficulty),
      isGenerated: false,
    };
  }

  const systemPrompt = `You are a SQL tutor helping students learn SQL. Your role is to provide HINTS, not solutions.

CRITICAL RULES:
1. NEVER provide the complete SQL query solution
2. Give conceptual guidance and point students in the right direction
3. Ask leading questions that help them think through the problem
4. Suggest which SQL concepts/clauses to use without writing them
5. If they're stuck on syntax, explain the concept but don't write the full query
6. Keep hints short (2-3 sentences maximum)

Your goal is to help them learn, not to solve it for them.`;

  const userPrompt = `Assignment: ${assignment.title}
Difficulty: ${assignment.difficulty}

Question: ${assignment.question}

Available Tables:
${assignment.sampleTables
  .map((table) => {
    const columns = table.columns
      .map((col) => `  - ${col.columnName} (${col.dataType})`)
      .join("\n");
    return `Table: ${table.tableName}\n${columns}`;
  })
  .join("\n\n")}

${
  userQuery
    ? `Student's current query attempt:\n${userQuery}\n`
    : "Student has not written any query yet.\n"
}

${
  previousHints.length > 0
    ? `Previous hints given:\n${previousHints.join("\n")}\n`
    : ""
}

Provide a helpful hint that guides them towards the solution without revealing it.`;

  try {
    const provider = getProvider();

    if (provider === "openai") {
      const client = getOpenAIClient();
      const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });
      return {
        success: true,
        hint: response.choices[0].message.content.trim(),
      };
    }

    if (provider === "gemini") {
      const client = getGeminiClient();
      const result = await client.generateContent(
        `${systemPrompt}\n\n${userPrompt}`
      );
      return {
        success: true,
        hint: result.response.text().trim(),
      };
    }

    throw new Error(`LLM provider ${provider} not supported`);
  } catch (error) {
    console.error("LLM Error:", error.message);
    return {
      success: true,
      hint: getFallbackHint(assignment.difficulty),
      fallbackHint: true,
    };
  }
}

async function validateQuery(result, expectedOutput) {
  if (!result.success || !result.rows || result.rows.length === 0) {
    return false;
  }

  const userRows = result.rows;
  const expectedRows = expectedOutput.rows;

  if (userRows.length !== expectedRows.length) {
    return false;
  }

  // Basic comparison - check if results match
  const userStr = JSON.stringify(userRows.map((r) => Object.values(r)).sort());
  const expectedStr = JSON.stringify(expectedRows.sort());

  return userStr === expectedStr;
}

module.exports = {
  generateHint,
  validateQuery,
  isAvailable,
  getFallbackHint,
};
