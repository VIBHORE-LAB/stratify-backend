import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

export async function fetchAndSavePolygonData({ ticker, startDate, endDate }) {

  try{
 const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/minute/${startDate}/${endDate}?adjusted=true&sort=asc&limit=50000&apiKey=${POLYGON_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("No Data found from polygon");
  }

  const dir = path.join(__dirname, "..", "cppEngine", "data");
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${ticker}_${Date.now()}.csv`);

  const header = "timestamp,price,volume\n";
  const rows = data.results.map(r => {
    const ts = new Date(r.t).toISOString().replace("T", " ").slice(0, 19);
    return `${ts},${r.c},${r.v}`;
  });

  fs.writeFileSync(filePath, header + rows.join("\n"));

  return filePath;
  }
 
  catch(err){
    console.error("Polygon fetching error", err.message);
  }
}
