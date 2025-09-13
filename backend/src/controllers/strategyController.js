import { runStrategyForUser } from "../services/strategyService.js";
import { fetchAndSavePolygonData } from "../utils/polygonFetcher.js";

export const runStrategy = async (req, res) => {
  const userId = req.user.id;
  const { strategyName, params, ticker, startDate, endDate } = req.body;

  let dataPath = req.file ? req.file.path : req.body.dataPath;

  try {
    if (ticker && startDate && endDate) {
      dataPath = await fetchAndSavePolygonData({ ticker, startDate, endDate });
    }

    if (!strategyName || !params || !dataPath) {
      return res.status(400).json({
        success: false,
        message: "Strategy Name, Params, and Data Path are required",
      });
    }

    const companyName = ticker || "unknown";
    const io = req.app.get("io");

    // Respond immediately so client knows backtest started
    res.json({ success: true, message: "Backtest started" });

    // Run the strategy asynchronously
    runStrategyForUser({ userId, strategyName, params, dataPath, io, companyName })
      .then((result) => {
        // Emit result to the user via socket
        io.to(userId).emit("backtest_complete", { message: "Backtest completed", result });
      })
      .catch((err) => {
        console.error(`Backtest failed for user ${userId}:`, err.message);
        io.to(userId).emit("backtest_error", { message: err.message });
      });
  } catch (e) {
    console.error("Controller error:", e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};
