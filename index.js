const BASE_URL = "http://4.224.186.213/evaluation-service";

// Set your auth token here or via environment variable
const AUTH_TOKEN = process.env.AUTH_TOKEN || "YOUR_AUTH_TOKEN_HERE";

const headers = {
  Authorization: `Bearer ${AUTH_TOKEN}`,
  "Content-Type": "application/json",
};

// ── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchDepots() {
  const res = await fetch(`${BASE_URL}/depots`, { headers });
  if (!res.ok) throw new Error(`Depots fetch failed: ${res.status}`);
  const data = await res.json();
  return data.depots; // [{ ID, MechanicHours }]
}

async function fetchVehicles() {
  const res = await fetch(`${BASE_URL}/vehicles`, { headers });
  if (!res.ok) throw new Error(`Vehicles fetch failed: ${res.status}`);
  const data = await res.json();
  return data.vehicles; // [{ TaskID, Duration, Impact }]
}

// ── Knapsack solver (0/1, DP) ────────────────────────────────────────────────

/**
 * Classic 0/1 knapsack.
 * @param {Array<{TaskID, Duration, Impact}>} tasks
 * @param {number} capacity  – mechanic-hours budget
 * @returns {{ selectedTasks: Array, totalImpact: number, totalDuration: number }}
 */
function knapsack(tasks, capacity) {
  const n = tasks.length;

  // dp[i][w] = max impact using first i tasks with capacity w
  // Use 1-D rolling array to save memory
  const dp = new Array(capacity + 1).fill(0);
  const keep = Array.from({ length: n }, () => new Array(capacity + 1).fill(false));

  for (let i = 0; i < n; i++) {
    const { Duration: w, Impact: v } = tasks[i];
    for (let c = capacity; c >= w; c--) {
      if (dp[c - w] + v > dp[c]) {
        dp[c] = dp[c - w] + v;
        keep[i][c] = true;
      }
    }
  }

  // Back-track to find selected items
  const selectedTasks = [];
  let c = capacity;
  for (let i = n - 1; i >= 0; i--) {
    if (keep[i][c]) {
      selectedTasks.push(tasks[i]);
      c -= tasks[i].Duration;
    }
  }

  const totalImpact = selectedTasks.reduce((s, t) => s + t.Impact, 0);
  const totalDuration = selectedTasks.reduce((s, t) => s + t.Duration, 0);

  return { selectedTasks, totalImpact, totalDuration };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Vehicle Maintenance Scheduler ===\n");

  const [depots, vehicles] = await Promise.all([fetchDepots(), fetchVehicles()]);

  console.log(`Fetched ${depots.length} depots and ${vehicles.length} vehicle tasks.\n`);

  const results = [];

  for (const depot of depots) {
    const { ID: depotId, MechanicHours: budget } = depot;
    console.log(`\n--- Depot ${depotId} | Budget: ${budget} mechanic-hours ---`);

    const { selectedTasks, totalImpact, totalDuration } = knapsack(vehicles, budget);

    console.log(`  Selected ${selectedTasks.length} tasks`);
    console.log(`  Total Duration : ${totalDuration} / ${budget} hours`);
    console.log(`  Total Impact   : ${totalImpact}`);
    console.log("  Tasks:");
    selectedTasks.forEach((t) =>
      console.log(`    [${t.TaskID}]  duration=${t.Duration}  impact=${t.Impact}`)
    );

    results.push({
      depotId,
      budget,
      totalDuration,
      totalImpact,
      selectedTaskIds: selectedTasks.map((t) => t.TaskID),
    });
  }

  console.log("\n=== Summary ===");
  results.forEach((r) => {
    console.log(
      `Depot ${r.depotId}: ${r.selectedTaskIds.length} tasks | ` +
        `${r.totalDuration}/${r.budget} hours | impact=${r.totalImpact}`
    );
  });

  return results;
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});