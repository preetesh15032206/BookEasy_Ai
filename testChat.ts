import { getRagResponse } from './server.ts';
async function run() {
  try {
    const res = await getRagResponse("I want to book a hotel in Goa", []);
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}
run();
