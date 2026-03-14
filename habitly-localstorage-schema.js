// ============================================================
//  Habitly — localStorage Backend Schema
//  All data is stored in the browser's localStorage.
//  Each key is prefixed to avoid collisions with other apps.
// ============================================================


// ─────────────────────────────────────────────────────────────
// KEY STRUCTURE
// ─────────────────────────────────────────────────────────────
//
//  hl_users                  → all registered user accounts
//  hl_session                → currently logged-in username
//  hl_<username>_habits      → habits for a specific user
//  hl_<username>_events      → events for a specific user
//
// Example for user "john":
//   hl_users
//   hl_session
//   hl_john_habits
//   hl_john_events
// ─────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
// 1. USERS  →  key: "hl_users"
// ─────────────────────────────────────────────────────────────
//  A plain object mapping username → hashed password.
//  Stored as JSON string in localStorage.
//
const USERS_SCHEMA = {
  "john_doe": "3q4r5s",       // hashed password (djb2 hash → base36)
  "jane_smith": "7t8u9v",
  // ... more users
};

// localStorage entry:
//   Key:   "hl_users"
//   Value: JSON.stringify(USERS_SCHEMA)


// ─────────────────────────────────────────────────────────────
// 2. SESSION  →  key: "hl_session"
// ─────────────────────────────────────────────────────────────
//  A plain string — the username of the currently logged-in user.
//  Cleared on logout.
//
const SESSION_SCHEMA = "john_doe";

// localStorage entry:
//   Key:   "hl_session"
//   Value: JSON.stringify("john_doe")   →  "\"john_doe\""


// ─────────────────────────────────────────────────────────────
// 3. HABITS  →  key: "hl_<username>_habits"
// ─────────────────────────────────────────────────────────────
//  An array of habit objects. Each habit tracks:
//    - id          : unique string ID (timestamp-based)
//    - name        : habit label entered by the user
//    - freq        : "daily" | "weekly"
//    - streak      : integer — current consecutive day streak
//    - completions : object mapping date strings → true
//                    Date format: "YYYY-MM-DD"
//
const HABITS_SCHEMA = [
  {
    id: "h_1710000000000",           // "h_" + Date.now()
    name: "Morning meditation",
    freq: "daily",                   // "daily" | "weekly"
    streak: 7,                       // consecutive days completed
    completions: {
      "2026-03-08": true,
      "2026-03-09": true,
      "2026-03-10": true,
      "2026-03-11": true,
      "2026-03-12": true,
      "2026-03-13": true,
      "2026-03-14": true,
      // key = date string, value always true
    }
  },
  {
    id: "h_1710000000001",
    name: "Read 20 pages",
    freq: "daily",
    streak: 3,
    completions: {
      "2026-03-12": true,
      "2026-03-13": true,
      "2026-03-14": true,
    }
  },
  {
    id: "h_1710000000002",
    name: "Weekly gym",
    freq: "weekly",
    streak: 2,
    completions: {
      "2026-03-07": true,
      "2026-03-14": true,
    }
  }
];

// localStorage entry:
//   Key:   "hl_john_doe_habits"
//   Value: JSON.stringify(HABITS_SCHEMA)


// ─────────────────────────────────────────────────────────────
// 4. EVENTS  →  key: "hl_<username>_events"
// ─────────────────────────────────────────────────────────────
//  An array of event objects. Each event has:
//    - id    : unique string ID (timestamp-based)
//    - title : event label entered by the user
//    - date  : "YYYY-MM-DD" string
//    - color : hex color string chosen by the user
//
const EVENTS_SCHEMA = [
  {
    id: "e_1710000000100",           // "e_" + Date.now()
    title: "Team standup",
    date: "2026-03-14",             // YYYY-MM-DD
    color: "#534AB7"                // Purple | #1D9E75 Green | #D85A30 Coral | #BA7517 Amber
  },
  {
    id: "e_1710000000101",
    title: "Doctor appointment",
    date: "2026-03-17",
    color: "#D85A30"
  },
  {
    id: "e_1710000000102",
    title: "Project deadline",
    date: "2026-03-21",
    color: "#BA7517"
  }
];

// localStorage entry:
//   Key:   "hl_john_doe_events"
//   Value: JSON.stringify(EVENTS_SCHEMA)


// ─────────────────────────────────────────────────────────────
// STORAGE HELPER — read/write utility used by the app
// ─────────────────────────────────────────────────────────────

const Storage = {
  /**
   * Read a value from localStorage and parse it as JSON.
   * Returns null if the key doesn't exist or parsing fails.
   */
  get(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      console.error("Storage.get failed for key:", key, e);
      return null;
    }
  },

  /**
   * Serialize a value as JSON and write it to localStorage.
   * Returns true on success, false on failure (e.g. storage full).
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Storage.set failed for key:", key, e);
      return false;
    }
  },

  /**
   * Remove a key from localStorage.
   */
  delete(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Storage.delete failed for key:", key, e);
    }
  }
};


// ─────────────────────────────────────────────────────────────
// USER-SCOPED KEY HELPERS
// ─────────────────────────────────────────────────────────────

function userKey(username, type) {
  // type: "habits" | "events"
  return `hl_${username}_${type}`;
}

// Examples:
//   userKey("john_doe", "habits")  →  "hl_john_doe_habits"
//   userKey("john_doe", "events")  →  "hl_john_doe_events"


// ─────────────────────────────────────────────────────────────
// CRUD OPERATIONS — how the app reads and writes data
// ─────────────────────────────────────────────────────────────

// --- Users ---
const getUsers  = ()      => Storage.get("hl_users") || {};
const saveUsers = (users) => Storage.set("hl_users", users);

// --- Session ---
const getSession    = ()       => Storage.get("hl_session");
const saveSession   = (uname)  => Storage.set("hl_session", uname);
const clearSession  = ()       => Storage.delete("hl_session");

// --- Habits (per user) ---
const getHabits  = (uname)         => Storage.get(userKey(uname, "habits")) || [];
const saveHabits = (uname, habits) => Storage.set(userKey(uname, "habits"), habits);

// --- Events (per user) ---
const getEvents  = (uname)         => Storage.get(userKey(uname, "events")) || [];
const saveEvents = (uname, events) => Storage.set(userKey(uname, "events"), events);


// ─────────────────────────────────────────────────────────────
// PASSWORD HASHING  (djb2 algorithm, base36 encoded)
// ─────────────────────────────────────────────────────────────
//  Not cryptographic — suitable only for a localStorage demo.
//  For real apps, use bcrypt on a server.

function hashPassword(password) {
  let h = 5381;
  for (let i = 0; i < password.length; i++) {
    h = ((h << 5) + h) + password.charCodeAt(i); // h * 33 + char
  }
  return (h >>> 0).toString(36); // unsigned 32-bit → base36 string
}

// Example:
//   hashPassword("mypassword")  →  "3q4r5s"  (varies by input)


// ─────────────────────────────────────────────────────────────
// DATE FORMAT
// ─────────────────────────────────────────────────────────────
//  All dates stored as "YYYY-MM-DD" strings.
//  This format sorts correctly as a plain string comparison.

function todayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;  // e.g. "2026-03-14"
}


// ─────────────────────────────────────────────────────────────
// FULL localStorage STATE EXAMPLE (as it appears in DevTools)
// ─────────────────────────────────────────────────────────────
//
//  Open Chrome DevTools → Application → Local Storage to see:
//
//  Key                        Value (JSON string)
//  ─────────────────────────  ───────────────────────────────────────────
//  hl_users                   {"john_doe":"3q4r5s","jane_smith":"7t8u9v"}
//  hl_session                 "john_doe"
//  hl_john_doe_habits         [{"id":"h_171...","name":"Morning meditation",...}]
//  hl_john_doe_events         [{"id":"e_171...","title":"Team standup",...}]
//  hl_jane_smith_habits       [...]
//  hl_jane_smith_events       [...]
//
// ─────────────────────────────────────────────────────────────
