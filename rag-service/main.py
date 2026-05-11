import os
import json
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from pinecone import Pinecone
import google.generativeai as genai

load_dotenv(dotenv_path="../.env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "bookeasy-listings"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="BookEasy RAG Engine")

try:
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(INDEX_NAME)
except Exception as e:
    logger.error(f"Failed to initialize Pinecone: {e}")
    index = None

class ChatRequest(BaseModel):
    query: str

SYSTEM_PROMPT = """You are BookEasy, a smart hotel booking assistant. 
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
"""

def embed_text(text_block: str):
    response = genai.embed_content(
        model="models/text-embedding-004",
        content=text_block,
        task_type="retrieval_document"
    )
    return response['embedding']

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    if not index:
        raise HTTPException(status_code=500, detail="Pinecone index not initialized.")
        
    try:
        query_embedding = embed_text(req.query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding error: {e}")
        
    try:
        search_results = index.query(
            vector=query_embedding,
            top_k=5,
            include_metadata=True
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pinecone query error: {e}")
        
    context_str = ""
    for match in search_results.get("matches", []):
        metadata = match.get("metadata", {})
        context_str += f"- ID: {match['id']}\n{metadata.get('text', '')}\n\n"
        
    # We construct the prompt as a string since this prompt format assumes a simple string context.
    # We will use Gemini's structured JSON output mode to guarantee the JSON shape.
    prompt = f"{SYSTEM_PROMPT}\n{context_str}\nUser: {req.query}"
    
    # We use genai structured JSON generation
    # It takes the schema implicitly via prompt but we can enforce it via 'response_mime_type'.
    model = genai.GenerativeModel("models/gemini-2.5-flash")
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.0
            )
        )
        response_json = json.loads(response.text)
        return response_json
    except Exception as e:
        logger.error(f"LLM Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating LLM response: {e}")
