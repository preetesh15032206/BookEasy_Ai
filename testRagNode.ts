import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.APP_GEMINI_API_KEY });
const pc = new Pinecone();

async function run() {
  const query = "Can I book a hotel in SF?";
  const index = pc.Index('bookeasy-listings').namespace('listings_v2');
  
  console.log("Embed...");
  const embedRes = await ai.models.embedContent({
    model: 'gemini-embedding-2-preview',
    contents: query,
  });
  
  console.log("Query...");
  const vector = embedRes.embeddings[0].values;
  const searchResults = await (index as any).query({
    vector,
    topK: 5,
    includeMetadata: true
  });
  console.log("Results:", searchResults.matches.length);
}
run();
