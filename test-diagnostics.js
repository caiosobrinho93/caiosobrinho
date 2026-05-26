async function run() {
  console.log("Fetching diagnostics from Vercel production...");
  const res = await fetch("https://caioegiselle.vercel.app/api/dev/diagnostics");
  console.log("Status:", res.status);
  const json = await res.json();
  console.log("Response JSON:", JSON.stringify(json, null, 2));
}

run().catch(err => console.error("Diagnostics request failed:", err));
