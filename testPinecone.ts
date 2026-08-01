import { Pinecone } from '@pinecone-database/pinecone';
async function run() {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  console.log(await pc.listIndexes());
}
run();
