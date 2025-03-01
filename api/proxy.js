export default async function handler(req, res) {
  const targetDomain = "https://fajar.laravel.cloud"; // Target domain

  // Tangani preflight request (OPTIONS)
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(204).end();
    return;
  }

  try {
    console.log("Request URL:", req.url);

    const targetURL = `${targetDomain}${req.url}`;

    // Forward request ke server tujuan
    const response = await fetch(targetURL, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(targetDomain).hostname, // Pastikan Host sesuai target
      },
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    console.log("Response from target:", response.status);

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Stream response untuk performa lebih baik
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Baca response sebagai buffer dan kirim ke client
    const data = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(data));

  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

