import { spwan } from "child_process";
import { EventEmitter } from "events";
import path from "path";
import { fileURLToPath } from "url";
import { parseLine } from "../utils/resultParser.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Runs the C++ backtester and streams events.
 * @param {string} dataPath
 * @param {string} strategyName - e.g., "momentum", "meanrev", "sma_cross", "rsi"
 * @param {object} params - key/value map (e.g., { threshold: 0.02, qty: 10 })
 * @returns {EventEmitter} emits: 'line', 'trade', 'order', 'done', 'error'
 */

export function runBacktest(dataPath, strategyName, params = {}) {
  const emitter = new EventEmitter();
  const bin = path.resolve(
    process.cwd(),
    process.env.CENGINE_BIN || "./bin/backtester"
  );
  const args = [dataPath, strategyName];

  Object.entries(params).forEach(([k, v]) => {
    args.push(`--${k}`, String(v));
  });
}
