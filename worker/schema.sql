-- Drop existing tables if they exist
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS activity_log;
DROP TABLE IF EXISTS query_stats;

-- Documents table
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  chunks INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL,
  path TEXT NOT NULL CHECK (path IN ('cloud', 'local')),
  processing_details TEXT NOT NULL
);

-- Activity log table
CREATE TABLE activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TEXT NOT NULL
);

-- Query stats table
CREATE TABLE query_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL UNIQUE,
  hits INTEGER DEFAULT 0,
  last_used TEXT NOT NULL,
  path TEXT NOT NULL CHECK (path IN ('cloud', 'local', 'all'))
); 