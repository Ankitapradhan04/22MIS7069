
const http = require("http");
const { fetchNotifications } = require("./notificationService");
const { getTopN } = require("./priorityQueue");

const PORT = process.env.PORT || 3000;
const DEFAULT_TOP_N = parseInt(process.env.TOP_N || "10", 10);

// ── Router ────────────────────────────────────────────────────────────────────

function parseUrl(url) {
  const [path, qs = ""] = url.split("?");
  const params = Object.fromEntries(new URLSearchParams(qs));
  return { path, params };
}

async function router(req, res) {
  const { path, params } = parseUrl(req.url);

  res.setHeader("Content-Type", "application/json");

  try {
    // Health check
    if (req.method === "GET" && path === "/health") {
      return send(res, 200, { status: "ok" });
    }

    // Top-N priority notifications
    if (req.method === "GET" && path === "/notifications/top") {
      const n = parseInt(params.n || DEFAULT_TOP_N, 10);
      if (isNaN(n) || n < 1) return send(res, 400, { error: "Invalid n parameter" });

      const notifications = await fetchNotifications();
      const topN = getTopN(notifications, n);

      return send(res, 200, {
        success: true,
        n,
        total_fetched: notifications.length,
        data: topN,
      });
    }

    // All notifications (raw, for debugging)
    if (req.method === "GET" && path === "/notifications/all") {
      const notifications = await fetchNotifications();
      return send(res, 200, { success: true, total: notifications.length, data: notifications });
    }

    return send(res, 404, { error: "Not found" });
  } catch (err) {
    console.error("Error:", err.message);
    return send(res, 500, { error: err.message });
  }
}

function send(res, status, body) {
  res.statusCode = status;
  res.end(JSON.stringify(body, null, 2));
}

// ── Start server ──────────────────────────────────────────────────────────────

const server = http.createServer(router);
server.listen(PORT, () => {
  console.log(`\n🔔 Campus Notifications Service running on http://localhost:${PORT}`);
  console.log(`   GET /notifications/top?n=10  – Priority inbox`);
  console.log(`   GET /notifications/all        – All raw notifications`);
  console.log(`   GET /health                   – Health check\n`);
});