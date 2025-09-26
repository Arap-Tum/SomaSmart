import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { index } from "./config/pinecone.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Embedding + LLM models
const embedder = genAI.getGenerativeModel({ model: "text-embedding-004" });
const llm = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Step 1: Fetch relevant chunks from Pinecone
 */
async function findRelevantChunks(question, limit = 3) {
  const embeddingResult = await embedder.embedContent(question);
  const queryEmbedding = embeddingResult.embedding.values;

  const results = await index.query({
    vector: queryEmbedding,
    topK: limit,
    includeMetadata: true,
  });

  if (!results.matches || results.matches.length === 0) {
    return ["No relevant context found."];
  }

  // return results.matches.map((m) => m.metadata.text);

  return results.matches.map((m) => m.metadata.text).filter(Boolean);
}

/**
 * Step 2: Ask Gemini using retrieved chunks as context
 */
export async function askAI(question) {
  try {
    const chunks = await findRelevantChunks(
      question,
      question.length > 30 ? 5 : 3
    );
    const context = chunks.join("\n---\n");

    const prompt = `
SYSTEM ROLE:
You are **SomaSmart**, an AI tutor. Your job is to explain clearly, factually, 
and in a beginner-friendly tone. Be structured and avoid hallucinations.

Context:  ${context}

INSTRUCTIONS:
1. Use the context above to answer the user’s question.
2. If the context does not contain enough information, say: 
   "I don’t know from the provided documents, but here’s what I can explain generally."
3. Always provide step-by-step reasoning or structured bullet points.
4. Keep answers clear, concise, and focused on helping the user learn.

User: ${question}
Answer as SomaSmart:
    `;

    // ✅ FIXED Gemini call
    const result = await llm.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error("Error in askAI:", error);
    return "Sorry, I could not process that.";
  }
}
