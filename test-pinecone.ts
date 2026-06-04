import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY as string });
    const indexName = 'bookeasy-listings';
    const index = pc.Index(indexName);
    await index.deleteAll();
    console.log("Delete all success");
  } catch(e) {
    console.error("Delete all failed:", e);
  }
}
run();
