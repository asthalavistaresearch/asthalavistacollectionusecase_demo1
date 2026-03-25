const fs = require("fs");

const API_KEY = process.env.ASTHA_API_KEY;
const COLLECTION = process.env.ENCODED_COLLECTION_TOKEN;

console.log("API_KEY exists:", !!API_KEY);
console.log("COLLECTION exists:", !!COLLECTION);

const BASE_URL = `https://api.asthalavista.com/v1/collection_api/${COLLECTION}`;

async function fetchFeed(cutoff) {
  console.log("Calling:", `${BASE_URL}?cutoff=${cutoff}`);

  const res = await fetch(`${BASE_URL}?cutoff=${cutoff}`, {
    headers: {
      "X-API-Key": API_KEY,
    },
  });

  console.log("Status:", res.status);

  const text = await res.text();
  console.log("Raw response:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("JSON parse failed");
    process.exit(1);
  }

  if (!res.ok) {
    console.error("API ERROR:", data);
    process.exit(1);
  }

  return data;
}

async function main() {
  if (!API_KEY || !COLLECTION) {
    console.error("Missing env variables");
    process.exit(1);
  }

  await fetchFeed("7d");
}

main();
