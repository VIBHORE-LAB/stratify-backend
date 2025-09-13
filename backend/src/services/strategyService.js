import db from "../models/index.js";
import { runBacktest } from "../cengine/runner.js";
import { computePctChange } from "../utils/resultParser.js";
import { computeWinLoss } from "../utils/computeWinLoss.js";

const { Strategy, BackTestResult, Trade } = db;

export async function runStrategyForUser({ userId, strategyName, params, dataPath, io, companyName = "unknown" }) {
  const strat = await Strategy.create({
    userId,
    name: strategyName,
    params: JSON.stringify(params),
  });

  const tradesBuffer = [];
  const seenTradeKeys = new Set();
  let cash = 100000;
  let position = 0;
  function makeTradeObj(raw) {
    const orderId = raw.orderId || raw.order_id || raw.id || null;
    const qty = Number(raw.qty ?? raw.quantity ?? 0);
    const price = Number(raw.price ?? 0);
    const side = (raw.side || "").toUpperCase() || "BUY";
    const timestamp = raw.timestamp || new Date().toISOString();
    return { orderId, side, price, qty, timestamp, _raw: raw };
  }

  function isMeaningfulTrade(raw, trade) {
    if (!trade.orderId) return false;
    if (!trade.qty || trade.qty <= 0) return false;
    if (!trade.price || trade.price <= 0) return false;

    const status = (raw.status || raw.type || "").toString().toLowerCase();
    if (status) {
      return status.includes("fill") || status.includes("trade") || status.includes("filled");
    }
    return true;
  }

  const emitter = runBacktest(dataPath, strategyName, params);

  emitter.on("trade", (raw) => {
    try {
      const trade = makeTradeObj(raw);
      if (!isMeaningfulTrade(raw, trade)) return;

      const dedupeKey = `${trade.orderId}::${trade.timestamp}::${trade.side}::${trade.qty}::${trade.price}`;
      if (seenTradeKeys.has(dedupeKey)) return;
      seenTradeKeys.add(dedupeKey);
      if (trade.side === "BUY") {
        cash -= trade.qty * trade.price;
        position += trade.qty;
      } else {
        cash += trade.qty * trade.price;
        position -= trade.qty;
      }
      const nav = cash + position * trade.price;

      tradesBuffer.push({
        order_id: trade.orderId,
        side: trade.side,
        price: trade.price,
        qty: trade.qty,
        timestamp: trade.timestamp,
        nav,
      });

      io.to(userId).emit("trade", {
        orderId: trade.orderId,
        side: trade.side,
        price: trade.price,
        qty: trade.qty,
        timestamp: trade.timestamp,
        nav,
      });

    } catch (err) {
      console.error("Error handling trade event:", err);
    }
  });

  emitter.on("order", (rawOrder) => {
    const order = {
      orderId: rawOrder.orderId || rawOrder.order_id || rawOrder.id,
      status: rawOrder.status,
      price: rawOrder.price,
      qty: rawOrder.qty ?? rawOrder.quantity,
      timestamp: rawOrder.timestamp || new Date().toISOString(),
    };
    io.to(userId).emit("order", order);
  });

  emitter.on("error", (err) => {
    console.error("Backtest process error:", err);
    io.to(userId).emit("backtest_error", { message: err.message ?? String(err) });
  });

  return new Promise((resolve, reject) => {
    emitter.on("done", async (final) => {
      try {
        const startingNav = 100000;
        const finalNav = cash + position * (final.final_price ?? 0);
        const pctChange = computePctChange(finalNav, startingNav);
        const {wins , losses, winRate } = computeWinLoss(tradesBuffer);
        const result = await BackTestResult.create({
          userId,
          strategyId: strat.id,
          finalNav,
          pctChange,
          cash: final.cash,
          winRate,
          position: final.position,
          navFile: "out_nav.csv",
          tradesFile: "out_trades.csv",
          wins,
          losses,
        });

        if (tradesBuffer.length) {
          const uniqueMap = new Map();
          for (const tr of tradesBuffer) {
            const key = `${tr.order_id}::${tr.timestamp}::${tr.side}::${tr.qty}::${tr.price}`;
            if (!uniqueMap.has(key)) uniqueMap.set(key, tr);
          }
          const uniqueTrades = Array.from(uniqueMap.values());

          await Trade.bulkCreate(
            uniqueTrades.map((tr) => ({
              resultId: result.id,
              orderId: tr.order_id,
              side: tr.side,
              price: tr.price,
              qty: tr.qty,
              timestamp: tr.timestamp,
              nav: tr.nav,

            }))
          );
        }

        io.to(userId).emit("backtest_complete", {
          resultId: result.id,
          finalNav,
          pctChange,
          Trades: tradesBuffer, 
          wins,
          losses,
          winRate,
        });

        emitter.removeAllListeners("trade");
        emitter.removeAllListeners("order");
        emitter.removeAllListeners("error");
        emitter.removeAllListeners("done");

        resolve(result);
      } catch (err) {
        console.error("Backtest done handler error:", err);
        io.to(userId).emit("backtest_error", { message: err.message ?? String(err) });
        reject(err);
      }
    });
  });
}


export async function listResults(userId, { limit = 50, offset = 0 } = {}) {
  return db.BackTestResult.findAndCountAll({
    where: { userId },
    include: [{ model: db.Strategy, attributes: ["name", "params"] }],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
}

export async function getResultDetail(userId, resultId) {
  const result = await db.BackTestResult.findOne({
    where: { id: resultId, userId },
    include: [
      { model: db.Strategy, attributes: ["name", "params"] },
      { model: db.Trade, order: [["timestamp", "ASC"]] },
    ],
  });
  return result;
}

export async function getTotalCount(userId) {
  const result = await db.BackTestResult.count({
    where: { userId },
  });

  return result;
}




export async function getLatest(userId)  {
  const result = await db.BackTestResult.findOne({
    where: { userId },
       include: [
      { model: db.Strategy, attributes: ["name", "params"] },
      { model: db.Trade, order: [["timestamp", "ASC"]] },
    ],
    order: [["created_at", "DESC"]],

  })
}