import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { index } from "../config/pinecone.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

// 1. Read book
const bookContent = fs.readFileSync("./data/G3Maths.txt", "utf-8");

// 2. Simple chunking function
function chunkText(text, chunkSize = 500) {
  const words = text.split(" ");
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }
  return chunks;
}

// 3. Generate embeddings & store in Pinecone
export async function embedChunks() {
  const chunks = chunkText(bookContent);
  console.log("✅ Total chunks created:", chunks.length);
  console.log("🔍 First chunk:", chunks[0].slice(0, 200), "...");

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`Embedding chunk ${i + 1}/${chunks.length}`);

    const result = await embeddingModel.embedContent(chunk);

    // const result = await embeddingModel.embedContent({ content: chunk });
    const embedding = result.embedding.values;

    await index.upsert([
      {
        id: `chunk-${i}`,
        values: embedding,
        metadata: { text: chunk },
      },
    ]);
  }

  console.log("✅ All chunks embedded and stored in Pinecone!");
}

embedChunks().catch(console.error);
