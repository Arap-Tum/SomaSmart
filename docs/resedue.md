// Import necessary libraries
import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg; // WhatsApp connection
import qrcode from "qrcode-terminal"; // Display QR code
import dotenv from "dotenv"; // Load API keys
import { askAI } from "./ai.js"; // AI functionnp

dotenv.config(); // Load .env variables

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
if (msg.body.toLowerCase().startsWith("soma:")) {
const question = msg.body.replace("soma:", "").trim(); // Remove "soma:" prefix
const answer = await askAI(question); // Send question to AI
msg.reply(answer); // Reply back to WhatsApp
}
});

// Initialize client (starts WhatsApp connection)
client.initialize();
