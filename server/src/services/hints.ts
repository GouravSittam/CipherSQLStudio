/**
 * AI Hint Service
 *
 * Generates hints with OpenAI or Google Gemini (set LLM_PROVIDER).
 * The prompt is designed to guide students without handing over the answer.
 * If no API key is configured, or the provider fails, a built-in hint is used.
 *
 * Author: Gourav Chaudhary
 */

import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { env } from "../config/env.js";
import type { Assignment } from "../models/Assignment.js";

export interface HintResult {
  hint: string;
  usingFallback: boolean;
}

const SYSTEM_PROMPT = `You are a SQL tutor helping students learn SQL. Your role is to provide HINTS, not solutions.

CRITICAL RULES:
1. NEVER provide the complete SQL query solution
2. Give conceptual guidance and point students in the right direction
3. Ask leading questions that help them think through the problem
4. Suggest which SQL concepts/clauses to use without writing them
5. If they're stuck on syntax, explain the concept but don't write the full query
6. Keep hints short (2-3 sentences maximum)

Your goal is to help them learn, not to solve it for them.`;

const MAX_OUTPUT_TOKENS = 1024;

const FALLBACK_HINTS: Record<string, string[]> = {
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

let openai: OpenAI | undefined;
let gemini: GoogleGenAI | undefined;

export function getFallbackHint(difficulty: string): string {
  const hints = FALLBACK_HINTS[difficulty.toLowerCase()] ?? FALLBACK_HINTS.medium!;
  return hints[Math.floor(Math.random() * hints.length)]!;
}

export function isLLMAvailable(): boolean {
  return env.LLM_PROVIDER === "openai" ? Boolean(env.OPENAI_API_KEY) : Boolean(env.GEMINI_API_KEY);
}

function buildUserPrompt(assignment: Assignment, userQuery: string, previousHints: string[]): string {
  const tables = assignment.sampleTables
    .map((table) => {
      const columns = table.columns.map((col) => `  - ${col.columnName} (${col.dataType})`).join("\n");
      return `Table: ${table.tableName}\n${columns}`;
    })
    .join("\n\n");

  return [
    `Assignment: ${assignment.title}`,
    `Difficulty: ${assignment.difficulty}`,
    "",
    `Question: ${assignment.question}`,
    "",
    `Available Tables:\n${tables}`,
    "",
    userQuery.trim()
      ? `Student's current query attempt:\n${userQuery}`
      : "Student has not written any query yet.",
    previousHints.length > 0 ? `\nPrevious hints given:\n${previousHints.join("\n")}` : "",
    "",
    "Provide a helpful hint that guides them towards the solution without revealing it.",
  ].join("\n");
}

async function askOpenAI(prompt: string): Promise<string> {
  openai ??= new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const response = await openai.responses.create({
    model: env.OPENAI_MODEL,
    instructions: SYSTEM_PROMPT,
    input: prompt,
    max_output_tokens: MAX_OUTPUT_TOKENS,
  });
  return response.output_text;
}

async function askGemini(prompt: string): Promise<string> {
  gemini ??= new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const response = await gemini.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: prompt,
    config: { systemInstruction: SYSTEM_PROMPT, maxOutputTokens: MAX_OUTPUT_TOKENS },
  });
  return response.text ?? "";
}

export async function generateHint(
  assignment: Assignment,
  userQuery = "",
  previousHints: string[] = [],
): Promise<HintResult> {
  const fallback = (): HintResult => ({ hint: getFallbackHint(assignment.difficulty), usingFallback: true });

  if (!isLLMAvailable()) return fallback();

  try {
    const prompt = buildUserPrompt(assignment, userQuery, previousHints);
    const text = env.LLM_PROVIDER === "openai" ? await askOpenAI(prompt) : await askGemini(prompt);
    const hint = text.trim();
    return hint ? { hint, usingFallback: false } : fallback();
  } catch (error) {
    console.error(`LLM (${env.LLM_PROVIDER}) error:`, error instanceof Error ? error.message : error);
    return fallback();
  }
}
