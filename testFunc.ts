import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { Listing } from './src/db/models.ts';
import 'dotenv/config';

const pc = (process.env.PINECONE_API_KEY && process.env.PINECONE_API_KEY !== 'MY_PINECONE_API_KEY')
   ? new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
   : null;
const ai = (process.env.APP_GEMINI_API_KEY && process.env.APP_GEMINI_API_KEY !== 'MY_GEMINI_API_KEY')
   ? new GoogleGenAI({ apiKey: process.env.APP_GEMINI_API_KEY })
   : null;
const SYSTEM_PROMPT = `You are BookEasy, a smart hotel booking assistant. Be helpful and friendly. 
If the user asks a general conversational question (like "hello", "how are you", "who are you"), reply naturally and politely.
If the user asks about hotels, search, or booking, answer using ONLY the context provided below. If no context matches their hotel query, say so honestly.
DO NOT use Markdown formatting (like **bolding** or *bullets*) in your reply. Use plain text only.
Always respond in this strictly formatted JSON object:
{
  "reply": "<your response in plain text>",
  "intent": "search" | "book" | "cancel" | "info" | "greeting",
  "listing_id": "<id or null>",
  "check_in": "<YYYY-MM-DD or null>",
  "check_out": "<YYYY-MM-DD or null>"
}`;

async function getRagResponse(query: string, history: Array<{role: string, text: string}> = []) {
  if (!pc || !ai) {
     return { reply: "Missing configuration.", intent: "info" };
  }
  const index = pc.Index('bookeasy-listings').namespace('listings_v2');
  const embedRes = await ai.models.embedContent({
    model: 'gemini-embedding-2-preview',
    contents: query,
  });
  
  const vector = embedRes.embeddings[0].values;
  const searchResults = await (index as any).query({
    vector,
    topK: 20,
    includeMetadata: true
  });
  
  let contextStr = '';
  for (const match of searchResults.matches) {
     contextStr += `- ID: ${match.id}\n${match.metadata!.text}\n\n`;
  }
  
  const totalHotels = await Listing.count();
  
  let historyStr = history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
  
  const prompt = `Note: We current have a total of ${totalHotels} hotels in our entire database.

Context (retrieved listings):
${contextStr}

Conversation History:
${historyStr}

User: ${query}`;
  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: prompt,
    config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.0
    }
  });
  
  return JSON.parse(response.text);
}

getRagResponse("hello").then(console.log).catch(console.error);
