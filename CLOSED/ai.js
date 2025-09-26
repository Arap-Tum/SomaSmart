import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Load book
const bookContent = fs.readFileSync("./data/book.txt", "utf-8");

// Create Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Load model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Ask AI function
export async function askAI(question) {
  const context = `
You are SomaSmart, an AI assistant trained on this book:

${bookContent}

Answer ONLY using knowledge from this book. 
If you don’t know, say: "I can only answer based on this book."
Be clear and polite.
  `;

  const prompt = `${context}\nUser: ${question}\nSomaSmart:`;

  try {
    const result = await model.generateContent(prompt);

    // Gemini SDK response structure
    return result.response.text();
  } catch (error) {
    console.error("Error contacting Gemini AI:", error);
    return "Sorry, I could not process that.";
  }
}
