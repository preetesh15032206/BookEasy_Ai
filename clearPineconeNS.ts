import { Pinecone } from '@pinecone-database/pinecone';
async function run() {
  const pc = new Pinecone();
  const index = pc.Index('bookeasy-listings').namespace('listings_v2');
  await index.deleteAll();
  console.log("Success");
}
run();
