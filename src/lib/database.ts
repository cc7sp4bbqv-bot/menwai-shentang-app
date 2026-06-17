// SQLite database layer - uses Tauri invoke when available, falls back to in-memory for dev
// This abstraction allows the frontend to work in both Tauri and browser environments

export interface DatabaseConfig {
  dbName: string;
}

// SQL Schema for all 11 tables
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS user_project_context (
  id TEXT PRIMARY KEY DEFAULT 'active',
  project_name TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  pain_point TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS daily_progress (
  id TEXT PRIMARY KEY,
  day_num INTEGER NOT NULL,
  reading_completed INTEGER NOT NULL DEFAULT 0,
  discussion_completed INTEGER NOT NULL DEFAULT 0,
  reflection_completed INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS term_learning_record (
  id TEXT PRIMARY KEY,
  term_id TEXT NOT NULL,
  term_name TEXT NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  bookmarked INTEGER NOT NULL DEFAULT 0,
  mastered INTEGER NOT NULL DEFAULT 0,
  last_viewed TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS conversation (
  id TEXT PRIMARY KEY,
  day_num INTEGER NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'mentor')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK(operation IN ('create', 'update', 'delete')),
  payload TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'syncing', 'completed', 'failed')),
  next_retry_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notification (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('mentor_reply', 'daily_reminder', 'streak_warning')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  related_entity_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reading_content (
  id TEXT PRIMARY KEY,
  day_num INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_book TEXT,
  source_chapter TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS term_dictionary (
  id TEXT PRIMARY KEY,
  term TEXT NOT NULL,
  english TEXT,
  definition TEXT NOT NULL,
  example TEXT,
  related_terms TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS daily_discussion (
  id TEXT PRIMARY KEY,
  day_num INTEGER NOT NULL,
  questions TEXT NOT NULL,
  mentor_reply TEXT,
  scores TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'submitted', 'replied', 'review_error')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS daily_reflection (
  id TEXT PRIMARY KEY,
  day_num INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  user_answer TEXT,
  mentor_feedback TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS error_log (
  id TEXT PRIMARY KEY,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  context TEXT,
  resolved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_progress_day ON daily_progress(day_num);
CREATE INDEX IF NOT EXISTS idx_term_learning_term ON term_learning_record(term_id);
CREATE INDEX IF NOT EXISTS idx_conversation_day ON conversation(day_num);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_read ON notification(read);
CREATE INDEX IF NOT EXISTS idx_reading_day ON reading_content(day_num);
CREATE INDEX IF NOT EXISTS idx_discussion_day ON daily_discussion(day_num);
`;

// In-memory database for browser dev mode
class InMemoryDB {
  private tables: Map<string, any[]> = new Map();

  constructor() {
    // Initialize empty tables
    const tableNames = [
      "user_project_context", "daily_progress", "term_learning_record",
      "conversation", "sync_queue", "notification", "reading_content",
      "term_dictionary", "daily_discussion", "daily_reflection", "error_log"
    ];
    tableNames.forEach(name => this.tables.set(name, []));
  }

  insert(table: string, row: any): void {
    const rows = this.tables.get(table) || [];
    rows.push({ ...row });
    this.tables.set(table, rows);
  }

  select(table: string, where?: Record<string, any>): any[] {
    const rows = this.tables.get(table) || [];
    if (!where) return [...rows];
    return rows.filter(row =>
      Object.entries(where).every(([k, v]) => row[k] === v)
    );
  }

  update(table: string, where: Record<string, any>, updates: Record<string, any>): number {
    const rows = this.tables.get(table) || [];
    let count = 0;
    rows.forEach((row, idx) => {
      if (Object.entries(where).every(([k, v]) => row[k] === v)) {
        rows[idx] = { ...row, ...updates };
        count++;
      }
    });
    return count;
  }

  delete(table: string, where: Record<string, any>): number {
    const rows = this.tables.get(table) || [];
    const before = rows.length;
    const filtered = rows.filter(row =>
      !Object.entries(where).every(([k, v]) => row[k] === v)
    );
    this.tables.set(table, filtered);
    return before - filtered.length;
  }
}

// Singleton database instance
let dbInstance: InMemoryDB | null = null;

export function getDatabase(): InMemoryDB {
  if (!dbInstance) {
    dbInstance = new InMemoryDB();
  }
  return dbInstance;
}

// Helper: generate UUID
export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

// Helper: current timestamp
export function now(): string {
  return new Date().toISOString();
}
