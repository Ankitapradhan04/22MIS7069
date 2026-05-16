/**
 * cli.js  – Run directly to print top-N notifications to stdout.
 *
 * Usage:
 *   AUTH_TOKEN=<token> node cli.js [n]
 *   e.g.  AUTH_TOKEN=abc123 node cli.js 10
 */

const { fetchNotifications } = require("./notificationService");
const { getTopN } = require("./priorityQueue");

async function main() {
  const n = parseInt(process.argv[2] || process.env.TOP_N || "10", 10);
  console.log(`\n📬 Fetching top ${n} priority notifications...\n`);

  const notifications = await fetchNotifications();
  console.log(`Total notifications fetched: ${notifications.length}`);

  const topN = getTopN(notifications, n);

  console.log(`\n🏆 Top ${n} Notifications (by Priority)\n`);
  console.log("Rank | Score  | Type      | Message                        | Timestamp");
  console.log("-----|--------|-----------|--------------------------------|-------------------");

  topN.forEach(({ rank, priority_score, Type, Message, Timestamp }) => {
    console.log(
      `  ${String(rank).padEnd(3)} | ${String(priority_score).padEnd(6)} | ${Type.padEnd(9)} | ${Message.padEnd(30)} | ${Timestamp}`
    );
  });

  console.log("\n✅ Done.\n");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});