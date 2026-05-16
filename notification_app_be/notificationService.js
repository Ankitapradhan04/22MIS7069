/**
 * notificationService.js
 * Fetches notifications from the evaluation API.
 * Auth token must be set via AUTH_TOKEN env variable.
 */

const BASE_URL = "http://4.224.186.213/evaluation-service";
const AUTH_TOKEN = process.env.AUTH_TOKEN || "YOUR_AUTH_TOKEN_HERE";

const headers = {
  Authorization: `Bearer ${AUTH_TOKEN}`,
  "Content-Type": "application/json",
};

/**
 * Fetches all notifications from the API.
 * @returns {Promise<Array<{ID, Type, Message, Timestamp}>>}
 */
async function fetchNotifications() {
  const res = await fetch(`${BASE_URL}/notifications`, { headers });

  if (!res.ok) {
    throw new Error(`Notifications API failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.notifications; // [{ ID, Type, Message, Timestamp }]
}

module.exports = { fetchNotifications };
