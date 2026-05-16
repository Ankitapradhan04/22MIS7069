/**
 * priorityQueue.js
 * 
 * Computes priority score for each notification and returns the top-N
 * using a min-heap of size N — O(M log N) time complexity.
 *
 * Priority formula:
 *   score = typeWeight + recencyScore
 *
 *   typeWeight:
 *     Placement → 3  (highest priority)
 *     Result    → 2
 *     Event     → 1
 *
 *   recencyScore = 1 / (1 + hoursElapsed)
 *     Ranges from ~1.0 (just now) to ~0.0 (very old).
 *     Ensures newer notifications of the same type rank higher.
 */

// ── Type weights ──────────────────────────────────────────────────────────────

const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

/**
 * Compute priority score for a notification.
 * @param {{ Type: string, Timestamp: string }} notification
 * @returns {number}
 */
function computeScore(notification) {
  const typeWeight = TYPE_WEIGHT[notification.Type] ?? 0;

  const ts = new Date(notification.Timestamp);
  const hoursElapsed = (Date.now() - ts.getTime()) / (1000 * 60 * 60);
  const recencyScore = 1 / (1 + hoursElapsed);

  return typeWeight + recencyScore;
}

// ── Min-Heap (keyed by score) ─────────────────────────────────────────────────

class MinHeap {
  constructor() {
    this._heap = []; // [{ score, notification }]
  }

  get size() {
    return this._heap.length;
  }

  peek() {
    return this._heap[0];
  }

  push(item) {
    this._heap.push(item);
    this._bubbleUp(this._heap.length - 1);
  }

  pop() {
    const top = this._heap[0];
    const last = this._heap.pop();
    if (this._heap.length > 0) {
      this._heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this._heap[parent].score <= this._heap[i].score) break;
      [this._heap[parent], this._heap[i]] = [this._heap[i], this._heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this._heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this._heap[l].score < this._heap[smallest].score) smallest = l;
      if (r < n && this._heap[r].score < this._heap[smallest].score) smallest = r;
      if (smallest === i) break;
      [this._heap[smallest], this._heap[i]] = [this._heap[i], this._heap[smallest]];
      i = smallest;
    }
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Returns the top-N notifications sorted by priority (highest first).
 * Efficiently handles new notifications: call getTopN again or extend
 * with the streaming variant below.
 *
 * @param {Array<{ID, Type, Message, Timestamp}>} notifications
 * @param {number} n
 * @returns {Array<{rank, score, ID, Type, Message, Timestamp}>}
 */
function getTopN(notifications, n) {
  const heap = new MinHeap();

  for (const notif of notifications) {
    const score = computeScore(notif);

    if (heap.size < n) {
      heap.push({ score, notif });
    } else if (score > heap.peek().score) {
      heap.pop();
      heap.push({ score, notif });
    }
  }

  // Extract and sort descending
  const result = [];
  while (heap.size > 0) result.push(heap.pop());
  result.sort((a, b) => b.score - a.score);

  return result.map(({ score, notif }, idx) => ({
    rank: idx + 1,
    priority_score: parseFloat(score.toFixed(4)),
    ID: notif.ID,
    Type: notif.Type,
    Message: notif.Message,
    Timestamp: notif.Timestamp,
  }));
}

/**
 * Streaming variant: maintain a persistent top-N heap.
 * Call `addNotification` for each new incoming notification.
 * This runs in O(log N) per new notification.
 */
class PriorityInbox {
  constructor(n) {
    this.n = n;
    this._heap = new MinHeap();
  }

  addNotification(notif) {
    const score = computeScore(notif);
    if (this._heap.size < this.n) {
      this._heap.push({ score, notif });
    } else if (score > this._heap.peek().score) {
      this._heap.pop();
      this._heap.push({ score, notif });
    }
  }

  getTop() {
    const result = [...this._heap._heap];
    result.sort((a, b) => b.score - a.score);
    return result.map(({ score, notif }, idx) => ({
      rank: idx + 1,
      priority_score: parseFloat(score.toFixed(4)),
      ...notif,
    }));
  }
}

module.exports = { getTopN, PriorityInbox, computeScore };