
const fs = require("fs");
const path = require("path");

// Log to file and stdout
const LOG_FILE = process.env.LOG_FILE || path.join(__dirname, "app.log");

function writeLog(line) {
  const entry = `${line}\n`;
  process.stdout.write(entry);
  fs.appendFileSync(LOG_FILE, entry);
}

function formatTimestamp() {
  return new Date().toISOString();
}

/**
 * Creates a logging middleware function.
 * @returns {(req, res, next: Function) => void}
 */
function createLoggingMiddleware() {
  return function loggingMiddleware(req, res, next) {
    const start = Date.now();
    const ts = formatTimestamp();

    writeLog(`→ [${ts}] ${req.method} ${req.url}`);

    // Intercept res.end to log response
    const originalEnd = res.end.bind(res);
    res.end = function (...args) {
      const duration = Date.now() - start;
      writeLog(`← [${formatTimestamp()}] ${res.statusCode} ${req.method} ${req.url} (${duration}ms)`);
      return originalEnd(...args);
    };

    if (typeof next === "function") next();
  };
}

function expressLogger() {
  const middleware = createLoggingMiddleware();
  return (req, res, next) => middleware(req, res, next);
}

module.exports = { createLoggingMiddleware, expressLogger, writeLog };