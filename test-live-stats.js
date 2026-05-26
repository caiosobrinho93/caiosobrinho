async function test() {
  console.log("Attempting login to Vercel production...");
  const loginRes = await fetch("https://caioegiselle.vercel.app/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "caio29382" }),
  });

  console.log("Login status:", loginRes.status);
  const loginResult = await loginRes.json();
  console.log("Login body:", loginResult);

  if (!loginRes.ok) {
    console.error("Login failed!");
    return;
  }

  // Get cookie header
  const setCookie = loginRes.headers.get("set-cookie");
  if (!setCookie) {
    console.error("No set-cookie header found!");
    return;
  }
  console.log("Cookie found!");

  console.log("Attempting fetch stats from Vercel production...");
  const statsRes = await fetch("https://caioegiselle.vercel.app/api/dashboard/stats", {
    method: "GET",
    headers: {
      "Cookie": setCookie
    }
  });

  console.log("Stats status:", statsRes.status);
  const statsText = await statsRes.text();
  console.log("Stats response body:", statsText);
}

test().catch(err => console.error("Test execution failed:", err));
