// Import necessary libraries
import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg; // WhatsApp connection
import qrcode from "qrcode-terminal"; // Display QR code
import dotenv from "dotenv"; // Load API keys
import { askAI } from "./ai.js"; // AI functionnp

import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.send("✅ SomaSmart WhatsApp bot is running!");
});

dotenv.config(); // Load .env variables

// ================================================
import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

async function test() {
  const list = await pc.listIndexes();
  console.log("✅ Available indexes:", list);
}

test().catch(console.error);
// =================================================

// Create WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(), // Saves session locally so you don't scan QR every time
});

// Event: Display QR code to scan in WhatsApp
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("Scan the QR code above with WhatsApp to login.");
});

// Event: Client ready and connected
client.on("ready", () => {
  console.log("SomaSmart is ready!");
});

// Event: Listen to incoming messages
client.on("message", async (msg) => {
  // Only respond if message starts with "soma:"
  console.log("📩 Message received:", msg.body);

  let thinkingSent = false;

  // Always notify immediately
  const thinkingTimer = setTimeout(async () => {
    await msg.reply("I am thinking... Please wait a moment.");
    thinkingSent = true;
  }, 12000);

  // Ignore system messages or empty texts
  if (!msg.body) return;

  try {
    // Show typing indicator
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    // Call AI
    const reply = await askAI(msg.body);
    // Clear "thinking..." timer once AI responds
    clearTimeout(thinkingTimer);

    // Reply back to the same chat
    await msg.reply(reply);
    console.log("🤖 Replied with:", reply);
  } catch (error) {
    clearTimeout(thinkingTimer);
    console.error("❌ Error handling message:", error);
    await msg.reply("Sorry, something went wrong.");
  }
});

// Initialize client (starts WhatsApp connection)
client.initialize();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
