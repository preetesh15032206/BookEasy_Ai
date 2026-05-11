import os
import json
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from pinecone import Pinecone, ServerlessSpec
import google.generativeai as genai

load_dotenv(dotenv_path="../.env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_URL = os.getenv("DATABASE_URL")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "bookeasy-listings"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not all([DB_URL, PINECONE_API_KEY, GEMINI_API_KEY]):
    logger.error("Missing required environment variables (DATABASE_URL, PINECONE_API_KEY, GEMINI_API_KEY).")
    exit(1)

genai.configure(api_key=GEMINI_API_KEY)

def get_listings_from_db():
    engine = create_engine(DB_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT id, name, location, price_per_night, amenities FROM listings"))
        listings = [dict(row._mapping) for row in result]
    return listings

def embed_text(text_block: str):
    response = genai.embed_content(
        model="models/text-embedding-004",
        content=text_block,
        task_type="retrieval_document"
    )
    return response['embedding']

def main():
    logger.info("Initializing Pinecone...")
    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    if INDEX_NAME not in pc.list_indexes().names():
        logger.info(f"Creating Pinecone index '{INDEX_NAME}'...")
        pc.create_index(
            name=INDEX_NAME,
            dimension=768, # Gemini text-embedding-004 dimension is 768
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )
    
    index = pc.Index(INDEX_NAME)
    
    logger.info("Fetching listings from database...")
    listings = get_listings_from_db()
    
    logger.info(f"Found {len(listings)} listings. Embedding and upserting...")
    vectors = []
    
    for lst in listings:
        try:
            amenities_parsed = json.loads(lst["amenities"])
        except:
            amenities_parsed = lst["amenities"]
            
        amenities_str = ", ".join(amenities_parsed) if isinstance(amenities_parsed, list) else str(amenities_parsed)
        
        content = (
            f"Hotel Name: {lst['name']}\n"
            f"Location: {lst['location']}\n"
            f"Price per night: ${lst['price_per_night']}\n"
            f"Amenities: {amenities_str}"
        )
        
        embedding = embed_text(content)
        
        metadata = {
            "name": lst["name"],
            "location": lst["location"],
            "price_per_night": lst["price_per_night"],
            "amenities": amenities_str,
            "text": content 
        }
        
        vectors.append({
            "id": str(lst["id"]),
            "values": embedding,
            "metadata": metadata
        })
        
    logger.info("Upserting vectors into Pinecone...")
    index.upsert(vectors)
    logger.info("Ingestion complete!")

if __name__ == "__main__":
    main()
