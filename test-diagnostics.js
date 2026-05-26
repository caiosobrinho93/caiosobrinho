async function run() {
  console.log("Fetching diagnostics from Vercel production with cache bypass...");
  const res = await fetch("https://caioegiselle.vercel.app/api/dev/diagnostics?t=" + Date.now());
  console.log("Status:", res.status);
  const json = await res.json();
  console.log("Response JSON:", JSON.stringify(json, null, 2));
}

run().catch(err => console.error("Diagnostics request failed:", err));
