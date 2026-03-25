const fs = require("fs");

const API_KEY = process.env.ASTHA_API_KEY;
const COLLECTION = process.env.ENCODED_COLLECTION_TOKEN;

const BASE_URL = `https://api.asthalavista.com/v1/collection_api/${COLLECTION}`;

async function fetchStage1(cutoff) {
  const res = await fetch(`${BASE_URL}?cutoff=${cutoff}`, {
    headers: { "X-API-Key": API_KEY },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Stage 1 Error:", data);
    process.exit(1);
  }

  return data.sources || [];
}

async function fetchStage2(link) {
  const res = await fetch(link, {
    headers: { "X-API-Key": API_KEY },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Stage 2 Error:", data);
    return null;
  }

  return data;
}

async function fetchFeed(cutoff) {
  console.log(`\n=== Fetching cutoff: ${cutoff} ===`);

  const sources = await fetchStage1(cutoff);

  const result = {
    cutoff,
    timestamp: new Date().toISOString(),
    categories: {},
  };

  for (const source of sources) {
    console.log("Fetching category:", source.category);

    const data = await fetchStage2(source.link);

    if (!data || !data.data) continue;

    result.categories[source.category] = {
      count: data.meta?.document_count || 0,
      items: data.data,
    };
  }

  return result;
}

async function main() {
  if (!API_KEY || !COLLECTION) {
    console.error("Missing env variables");
    process.exit(1);
  }

  const cutoff = "7d";

  const feed = await fetchFeed(cutoff);

  fs.writeFileSync(
    `data/ai_feed_${cutoff}.json`,
    JSON.stringify(feed, null, 2)
  );

  console.log("Saved successfully");
}

main();
