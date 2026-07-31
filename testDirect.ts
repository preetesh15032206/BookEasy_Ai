import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

async function test() {
  const prompt = `You are BookEasy, a smart hotel booking assistant. 
Be helpful and friendly. 
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
}

Note: We current have a total of 10 hotels in our entire database.

Context (retrieved listings):
{"id": "1", "name": "Beachfront Paradise", "location": "Baga Beach, Goa", "price_per_night": 180, "amenities": ["Private Beach", "Pool", "Bar", "Seafood Restaurant"]}
{"id": "2", "name": "Goa Surf Shack", "location": "Anjuna Beach, Goa", "price_per_night": 40, "amenities": ["Surfboard Rentals", "Free WiFi", "Hammocks"]}

Conversation History:

User: I want to book a hotel in Goa`;
  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        temperature: 0.0
    }
  });
  console.log(response.text);
}
test();
