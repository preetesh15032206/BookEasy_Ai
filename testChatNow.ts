import { getRagResponse } from './server.ts';
async function test() {
    try {
        const res = await getRagResponse("hello", []);
        console.log(res);
    } catch(e) {
        console.error(e);
    }
}
test();
