import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.APP_GEMINI_API_KEY });

async function run() {
  const prompt = "Just answer checking";
  
  console.log("Generating...");
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
          responseMimeType: "application/json",
          temperature: 0.0
      }
    });
    console.log("Results:", response.text);
  } catch(e) {
    console.error("Gen failed:", e);
  }
}
run();
