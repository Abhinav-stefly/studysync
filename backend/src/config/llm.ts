import "dotenv/config"; // ← bug #2 category: must be first, even though this file
                        // will itself be imported after server.ts's own dotenv import.
                        // Belt-and-suspenders: any file that reads process.env at
                        // module load time should have this, since import order
                        // across files isn't something you want to reason about by memory.
import OpenAI from "openai";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set in environment variables");
}

export const llmClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const LLM_MODEL = "openai/gpt-oss-120b";