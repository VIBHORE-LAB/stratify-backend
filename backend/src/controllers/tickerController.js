import axios from "axios";
import db from "../models/index.js";


const {Ticker} = db;
export const fetchTickers = async (req, res) => {
  try {
    let allTickers = [];
    let cursor = null;
    const limit = 500; 

    do {
      const resPolygon = await axios.get(
        "https://api.polygon.io/v3/reference/tickers",
        {
          params: {
            market: "stocks",
            active: true,
            apiKey: process.env.POLYGON_API_KEY,
            limit,
            cursor,
          },
        }
      );

      const tickers = resPolygon.data.results || [];
      allTickers = allTickers.concat(tickers);

      for (const t of tickers) {
        await Ticker.upsert({
          symbol: t.ticker,
          name: t.name,
          exchange: t.primary_exchange,
        });
      }

      cursor = resPolygon.data.next_page_token || null;
    } while (cursor);

    res.json({ message: `Refreshed ${allTickers.length} tickers` });
  } catch (error) {
    console.error("Error refreshing tickers:", error.message);
    res.status(500).json({ error: "Failed to refresh tickers" });
  }
};



export async function getTickers(req , res ) {
  try {
    const rows = await Ticker.findAll({
      attributes: [
        ["symbol", "value"],
        [Ticker.sequelize.literal(`name || ' (' || symbol || ')'`), "label"],
      ],
      order: [["symbol", "ASC"]],
    });

    res.json(rows);
  } catch (error) {
    console.error("Error fetching tickers:", error.message);
    res.status(500).json({ error: "Failed to fetch tickers" });
  }
}
