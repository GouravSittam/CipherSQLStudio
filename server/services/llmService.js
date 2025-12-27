/**
 * LLM Service
 *
 * Handles AI-powered features using OpenAI or Gemini.
 * Main uses:
 * - Generating hints for stuck users
 * - Validating query results
 *
 * The hint prompts are carefully designed to guide users
 * without just giving them the answer. We want learning!
 *
 * Author: Gourav Chaudhary
 */

const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

class LLMService {
  constructor() {
    // Which LLM to use - set in .env
    this.provider = process.env.LLM_PROVIDER || "openai";
    this.client = null;

    console.log(`LLM Provider: ${this.provider}`);

    // Initialize the appropriate client
    if (this.provider === "openai" && process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log("✅ OpenAI client initialized");
    } else if (this.provider === "gemini" && process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.client = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      console.log("✅ Gemini client initialized");
    } else {
      // No API key - that's okay, we have fallback hints
      console.warn(
        "Warning: No LLM API key is set. LLM features will be disabled."
      );
    }
  }

  // Check if LLM is configured
  isAvailable() {
    return this.client !== null;
  }

  /**
   * Generate a hint for a SQL challenge
   *
   * This is the main function - takes the assignment, user's attempt,
   * and any previous hints they've received.
   */
  async generateHint(assignment, userQuery, previousHints = []) {
    // No LLM? Use fallback hints
    if (!this.isAvailable()) {
      return {
        success: true,
        hint: this.getFallbackHint(assignment.difficulty),
        isGenerated: false,
      };
    }

    // System prompt - this is key to getting good hints
    // We really hammer home the "no solutions" rule
    const systemPrompt = `You are a SQL tutor helping students learn SQL. Your role is to provide HINTS, not solutions.

CRITICAL RULES:
1. NEVER provide the complete SQL query solution
2. Give conceptual guidance and point students in the right direction
3. Ask leading questions that help them think through the problem
4. Suggest which SQL concepts/clauses to use without writing them
5. If they're stuck on syntax, explain the concept but don't write the full query
6. Keep hints short (2-3 sentences maximum)

Your goal is to help them learn, not to solve it for them.`;

    // Build the user prompt with all the context
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
      // Call the appropriate API
      if (this.provider === "openai") {
        const response = await this.client.chat.completions.create({
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

      if (this.provider === "gemini") {
        const prompt = `${systemPrompt}\n\n${userPrompt}`;
        console.log("Calling Gemini API...");

        const result = await this.client.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        console.log("Gemini response received:", text.substring(0, 100));

        return {
          success: true,
          hint: text.trim(),
        };
      }

      // Shouldn't get here but just in case
      throw new Error(`LLM provider ${this.provider} not implemented yet`);
    } catch (error) {
      console.error("LLM API Error:", error.message || error);

      // Return fallback if API fails
      return {
        success: false,
        error: "Failed to generate hint. Please try again.",
        fallbackHint: this.getFallbackHint(assignment.difficulty),
      };
    }
  }

  /**
   * Fallback hints when LLM is unavailable or fails
   * Basic but better than nothing
   */
  getFallbackHint(difficulty) {
    const hints = {
      Easy: "Start with a basic SELECT statement. Think about which columns you need to retrieve and from which table.",
      Medium:
        "Consider using JOIN clauses to combine data from multiple tables. Think about the relationship between the tables.",
      Hard: "This might require subqueries or aggregate functions with GROUP BY. Break down the problem into smaller parts.",
    };

    return (
      hints[difficulty] ||
      "Review the question carefully and identify the key SQL concepts needed."
    );
  }

  /**
   * Check if user's query result matches the expected output
   * Used for auto-grading
   */
  async validateQuery(userResult, expectedOutput) {
    try {
      switch (expectedOutput.type) {
        case "count":
          // Just check row count
          return userResult.rowCount === expectedOutput.value;

        case "single_value":
          // Check single cell value
          return (
            userResult.rows.length === 1 &&
            Object.values(userResult.rows[0])[0] === expectedOutput.value
          );

        case "table":
          // Compare full table data
          // Using JSON.stringify is a bit hacky but works for our use case
          return (
            JSON.stringify(userResult.rows) ===
            JSON.stringify(expectedOutput.value)
          );

        case "column":
          // Compare single column values
          const columnValues = userResult.rows.map(
            (row) => Object.values(row)[0]
          );
          return (
            JSON.stringify(columnValues) ===
            JSON.stringify(expectedOutput.value)
          );

        default:
          return false;
      }
    } catch (error) {
      // If comparison fails, assume wrong answer
      return false;
    }
  }
}

module.exports = new LLMService();
