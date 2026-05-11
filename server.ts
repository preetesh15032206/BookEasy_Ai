import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { Listing, Booking, User } from './src/db/models.ts';
import path from 'path';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';

// Polyfill for RAG since Python won't run natively in this sandbox container.
// This allows you to have a fully working preview right within AI Studio!
const pc = (process.env.PINECONE_API_KEY && process.env.PINECONE_API_KEY !== 'MY_PINECONE_API_KEY') 
  ? new Pinecone({ apiKey: process.env.PINECONE_API_KEY }) 
  : null;
const ai = (process.env.APP_GEMINI_API_KEY && process.env.APP_GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') 
  ? new GoogleGenAI({ apiKey: process.env.APP_GEMINI_API_KEY }) 
  : null;

const SYSTEM_PROMPT = `You are BookEasy, a smart hotel booking assistant. 
Answer ONLY using the context below. If no context matches, say so honestly.
Always respond in this strictly formatted JSON object:
{
  "reply": "<your response>",
  "intent": "search" | "book" | "cancel" | "info",
  "listing_id": "<id or null>",
  "check_in": "<YYYY-MM-DD or null>",
  "check_out": "<YYYY-MM-DD or null>"
}

Context (retrieved listings):
`;

async function getRagResponse(query: string) {
  try {
    // Try hitting the local Python service first (if user runs it locally)
    const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });
    if (res.ok) {
        return await res.json();
    }
  } catch(e) {
    // Python service not reachable, fall back to Node.js polyfill below
  }

  if (!pc || !ai) {
     return { reply: "Missing configuration. Please trigger data ingestion or ensure Pinecone/Gemini API keys are set.", intent: "info" };
  }

  const index = pc.Index('bookeasy-listings');
  const embedRes = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: query,
  });
  
  const vector = embedRes.embeddings[0].values;
  const searchResults = await (index as any).query({
    vector,
    topK: 5,
    includeMetadata: true
  });
  
  let contextStr = '';
  for (const match of searchResults.matches) {
     contextStr += `- ID: ${match.id}\n${match.metadata!.text}\n\n`;
  }
  
  const prompt = `${SYSTEM_PROMPT}\n${contextStr}\nUser: ${query}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        temperature: 0.0
    }
  });
  
  return JSON.parse(response.text);
}

import { sequelize } from './src/db/database.ts';

async function startServer() {
  try {
    await sequelize.sync();
    console.log('Database synced');
  } catch (err) {
    console.error('Failed to sync database on startup:', err);
  }

  const app = express();
  app.use(express.json());
  
  // ==========================================
  // STEP 4: BOOKING MICROSERVICE REST ENDPOINTS
  // ==========================================
  app.get('/api/listings', async (req, res) => {
    try {
        const listings = await Listing.findAll({ where: { available: true } });
        res.json(listings);
    } catch(e: any) {
        res.status(500).json({error: e.message});
    }
  });

  app.post('/api/bookings', async (req, res) => {
    const { user_id, listing_id, check_in, check_out } = req.body;
    try {
      const booking = await Booking.create({ user_id, listing_id, check_in, check_out });
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/bookings/:userId', async (req, res) => {
    try {
        const bookings = await Booking.findAll({ where: { user_id: req.params.userId }, include: [Listing] });
        res.json(bookings);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/bookings/:id', async (req, res) => {
    try {
        await Booking.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  });

  // Polyfill script to ingest items to Pinecone from UI directly
  app.post('/api/ingest', async (req, res) => {
    if (!pc || !ai) return res.status(500).json({ error: "Missing or invalid API keys. Please set PINECONE_API_KEY and APP_GEMINI_API_KEY." });
    try {
        const indexName = 'bookeasy-listings';
        
        // ensure index exists
        const existingIndexes = (await pc.listIndexes()).indexes;
        if (!existingIndexes?.find(i => i.name === indexName)) {
           await pc.createIndex({
              name: indexName,
              dimension: 3072,
              metric: 'cosine',
              spec: { serverless: { cloud: 'aws', region: 'us-east-1' } }
           });
        }
        
        const index = pc.Index(indexName);
        const listings = await Listing.findAll();
        const vectors = [];
        for (const lst of listings) {
            const amenitiesStr = typeof lst.amenities === 'string' ? lst.amenities : JSON.stringify(lst.amenities);
            const content = `Hotel Name: ${lst.name}\nLocation: ${lst.location}\nPrice per night: $${lst.price_per_night}\nAmenities: ${amenitiesStr}`;
            
            const embedRes = await ai.models.embedContent({
                model: 'gemini-embedding-2',
                contents: content,
            });
            
            vectors.push({
                id: String(lst.id),
                values: embedRes.embeddings[0].values,
                metadata: {
                    name: lst.name,
                    location: lst.location,
                    price_per_night: lst.price_per_night,
                    amenities: amenitiesStr,
                    text: content
                }
            });
        }
        if (vectors.length > 0) {
            console.log('Upserting vectors:', vectors.length);
            await index.upsert({ records: vectors });
        } else {
            console.log('No vectors to upsert');
        }
        res.json({ success: true, count: vectors.length });
    } catch(e: any) {
        console.error(e.stack || e);
        res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // ==========================================
  // STEP 5: CHAT GATEWAY (Node.js + WebSockets) 
  // ==========================================
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    socket.on('chat message', async (msg) => {
      try {
        const aiResponse = await getRagResponse(msg.text);
        
        // Handle Action based on Intent
        if (aiResponse.intent === 'book' && aiResponse.listing_id && aiResponse.check_in && aiResponse.check_out) {
            try {
               await Booking.create({
                   user_id: msg.user_id,
                   listing_id: aiResponse.listing_id,
                   check_in: new Date(aiResponse.check_in),
                   check_out: new Date(aiResponse.check_out),
                   status: 'confirmed'
               });
               aiResponse.reply += '\n\n✅ Your booking has been successfully created!';
            } catch(e: any) {
               aiResponse.reply += '\n\n❌ Failed to create booking: ' + e.message;
            }
        } else if (aiResponse.intent === 'cancel' && aiResponse.listing_id) {
            try {
               const b = await Booking.findOne({ where: { user_id: msg.user_id, listing_id: aiResponse.listing_id }});
               if(b) {
                   await b.destroy();
                   aiResponse.reply += '\n\n✅ Your booking has been cancelled.';
               } else {
                   aiResponse.reply += '\n\n❌ Could not find a booking to cancel.';
               }
            } catch(e: any) {
               aiResponse.reply += '\n\n❌ Failed to cancel booking: ' + e.message;
            }
        }

        socket.emit('chat response', aiResponse);
      } catch (err: any) {
        console.error(err);
        socket.emit('chat response', { reply: 'Oops, encountered an error processing your request.', intent: 'error' });
      }
    });
  });

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
