## Repository Structure

```
.
├── logging_middleware/              ← Reusable request logger
│   ├── logger.js
│   └── README.md
│
├── vehicle_maintenance_scheduler/   ← Task 1: Knapsack optimizer
│   ├── index.js
│   └── README.md
│
├── notification_app_be/             ← Task 2 Stage 6: Priority inbox server
│   ├── index.js
│   ├── notificationService.js
│   ├── priorityQueue.js
│   ├── cli.js
│   └── README.md
│
├── notification_system_design.md    ← Task 2 Stages 1–6: Design document
└── .gitignore
```

---

## Prerequisites

- **Node.js 18+** (uses native `fetch` — no `node-fetch` needed)
- Your **AUTH_TOKEN** from the evaluation platform

---

## Quick Start

### 1. Vehicle Maintenance Scheduler

```bash
cd vehicle_maintenance_scheduler
AUTH_TOKEN=<your_token> node index.js
```

Solves the 0/1 knapsack problem for each depot and prints optimal task selection.

### 2. Campus Notifications — Priority Inbox (Stage 6)

**CLI mode** (just print top-10):
```bash
cd notification_app_be
AUTH_TOKEN=<your_token> node cli.js 10
```

**Server mode**:
```bash
AUTH_TOKEN=<your_token> node index.js
# Server starts at http://localhost:3000

# Test it:
curl "http://localhost:3000/notifications/top?n=10"
curl "http://localhost:3000/health"
```

### 3. Notification System Design (Stages 1–5)

See `notification_system_design.md` — covers:
- Stage 1: REST API design + WebSocket contract
- Stage 2: PostgreSQL schema + query examples
- Stage 3: Query optimization analysis
- Stage 4: Redis caching strategy
- Stage 5: Message queue redesign for notify_all
- Stage 6: Priority inbox algorithm explanation

---
