async function test() {
   const res = await fetch('http://localhost:3000/api/ingest', { method: 'POST' });
   console.log(await res.json());
}
test();
