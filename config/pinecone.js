// config/pinecone.js
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

export const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const index = pc.index(
  process.env.PINECONE_INDEX,
  process.env.PINECONE_HOST
);
