import { getRagResponse } from './server.ts';
import { Listing } from './src/db/models.ts';
import 'dotenv/config';

async function test() {
  try {
     const res = await getRagResponse("hello", []);
     console.log(res);
  } catch(e) {
     console.error(e);
  }
}
test();
