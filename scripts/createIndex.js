import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

async function createIndex() {
  await pc.createIndex({
    name: "book-embeddings", // new index name
    dimension: 768, // ✅ must match Google embeddings
    metric: "cosine",
    spec: {
      serverless: {
        cloud: "aws",
        region: "us-east-1", // replace with your region
      },
    },
  });

  console.log("✅ Created index 'book-embeddings' with 768 dimensions");
}

createIndex().catch(console.error);
