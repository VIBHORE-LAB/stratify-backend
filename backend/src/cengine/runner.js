import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseLine } from '../utils/resultParser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Runs the C++ backtester and streams events.
 * @param {string} dataPath - absolute path to CSV
 * @param {string} strategyName - e.g., "momentum", "meanrev", "sma_cross", "rsi"
 * @param {object} params - key/value map (e.g., { threshold: 0.02, qty: 10 })
 * @returns {EventEmitter} emits: 'line', 'trade', 'order', 'done', 'error'
 */
export function runBacktest(dataPath, strategyName, params = {}) {
  const emitter = new EventEmitter();

  // Resolve binary relative to repo root
  const bin = path.resolve(__dirname, "../../..", process.env.CENGINE_BIN);
  const absDataPath = path.resolve(dataPath);

  const args = [absDataPath, strategyName];
  Object.entries(params).forEach(([k, v]) => {
    args.push(`--${k}`, String(v));
  });

  console.log("Spawning C++:", bin, args.join(" "));

  const child = spawn(bin, args, { cwd: process.cwd() });

  let buffer = '';
  child.stdout.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';

    for (const l of lines) {
      const obj = parseLine(l);
      if (!obj) continue;

      emitter.emit('line', obj);

      if (obj.event === 'trade_executed') emitter.emit('trade', obj);
      if (obj.event === 'order_submitted') emitter.emit('order', obj);
      if (obj.event === 'run_complete') emitter.emit('done', obj);
    }
  });

  child.stderr.on('data', (d) => console.error('C++ stderr:', d.toString()));

  child.on('close', (code) => {
    if (code !== 0) {
      emitter.emit('error', new Error(`C++ exited with code ${code}`));
    }
  });

  emitter.kill = () => child.kill();

  return emitter;
}
