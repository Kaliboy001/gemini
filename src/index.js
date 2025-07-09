// src/index.js (This is the code for your Cloudflare Worker: https://gemini.mr-shokrullah.workers.dev/)
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const message = url.searchParams.get("q");

    // --- START: CORS Handling Additions ---
    // Handle pre-flight OPTIONS requests (browsers send this before actual GET/POST)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204, // No content for pre-flight
        headers: {
          'Access-Control-Allow-Origin': '*', // Allows requests from any origin.
                                            // For production, consider replacing '*' with your specific Pages domain (e.g., 'https://your-chatbot-pages-domain.pages.dev')
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Methods allowed
          'Access-Control-Allow-Headers': 'Content-Type', // Headers allowed
          'Access-Control-Max-Age': '86400', // Cache preflight response for 24 hours
        },
      });
    }
    // --- END: CORS Handling Additions ---


    if (!message) {
      const errorResponse = new Response(JSON.stringify({
        error: "Missing query parameter 'q'",
        status: 400,
        successful: "failed"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
      // --- START: CORS Header for Error Responses ---
      errorResponse.headers.set('Access-Control-Allow-Origin', '*');
      // --- END: CORS Header for Error Responses ---
      return errorResponse;
    }

    const timestamp = Date.now();
    const sign = await generateSHA256(`${timestamp}:${message}:`);

    const data = {
      messages: [{ role: "user", content: message }],
      time: timestamp,
      pass: null,
      sign: sign,
    };

    const headers = {
      "User-Agent": getUserAgent(),
      "Content-Type": "application/json",
      "Accept": "application/json, text/plain, */*",
      "Referer": "https://www.google.com/",
      "Origin": "https://alynn-repo.tech/", // This 'Origin' header is for the upstream API, not for your browser's access.
      "Connection": "keep-alive",
    };

    try {
      const response = await fetch("https://chat10.free2gpt.xyz/api/generate", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });

      const textResponse = await response.text();

      let ashlynn;
      try {
        const jsonResponse = JSON.parse(textResponse);
        ashlynn = jsonResponse?.choices?.[0]?.message || textResponse;
      } catch (error) {
        ashlynn = textResponse;
      }

      const successResponse = new Response(JSON.stringify({
        "Join": "https://t.me/Ashlynn_Repository",
        "response": ashlynn,
        "status": 200,
        "successful": "success"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      // --- START: CORS Header for Success Responses ---
      successResponse.headers.set('Access-Control-Allow-Origin', '*');
      // --- END: CORS Header for Success Responses ---
      return successResponse;

    } catch (error) {
      console.error("[Worker Fetch Error]", error.message);
      const errorResponse = new Response(JSON.stringify({
        "Join": "https://t.me/Ashlynn_Repository",
        "response": `Worker failed to fetch from upstream API: ${error.message}`,
        "status": 500,
        "successful": "failed"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
      // --- START: CORS Header for Error Responses ---
      errorResponse.headers.set('Access-Control-Allow-Origin', '*');
      // --- END: CORS Header for Error Responses ---
      return errorResponse;
    }
  },
};

async function generateSHA256(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getUserAgent() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/537.36",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
        }
