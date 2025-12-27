const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

class LLMService {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || "openai";
    this.client = null;

    console.log(`LLM Provider: ${this.provider}`);

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
      console.warn(
        "Warning: No LLM API key is set. LLM features will be disabled."
      );
    }
  }

  isAvailable() {
    return this.client !== null;
  }

  /**
   * Generates hint for SQL assignment
   * Engineered to provide guidance without giving away the solution
   */
  async generateHint(assignment, userQuery, previousHints = []) {
    // Return fallback hint if LLM is not available
    if (!this.isAvailable()) {
      return {
        success: true,
        hint: this.getFallbackHint(assignment.difficulty),
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

      // Add support for other providers here
      throw new Error(`LLM provider ${this.provider} not implemented yet`);
    } catch (error) {
      console.error("LLM API Error:", error.message || error);
      return {
        success: false,
        error: "Failed to generate hint. Please try again.",
        fallbackHint: this.getFallbackHint(assignment.difficulty),
      };
    }
  }

  /**
   * Provides fallback hints if LLM is unavailable
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
   * Validates if query matches expected output (for auto-grading)
   */
  async validateQuery(userResult, expectedOutput) {
    try {
      switch (expectedOutput.type) {
        case "count":
          return userResult.rowCount === expectedOutput.value;

        case "single_value":
          return (
            userResult.rows.length === 1 &&
            Object.values(userResult.rows[0])[0] === expectedOutput.value
          );

        case "table":
          return (
            JSON.stringify(userResult.rows) ===
            JSON.stringify(expectedOutput.value)
          );

        case "column":
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
      return false;
    }
  }
}

module.exports = new LLMService();
