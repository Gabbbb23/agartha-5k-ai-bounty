-- Create audit_logs table for storing clinical decision audit trail
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'viewed', 'approved', 'modified', 'rejected')),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  details TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_patient_id ON audit_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production)
-- For hackathon purposes, we allow full access
CREATE POLICY "Allow all operations on audit_logs" ON audit_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant access to anon and authenticated users
GRANT ALL ON audit_logs TO anon;
GRANT ALL ON audit_logs TO authenticated;

-- Optional: Create a view for recent audit entries
CREATE OR REPLACE VIEW recent_audit_logs AS
SELECT * FROM audit_logs
ORDER BY timestamp DESC
LIMIT 100;

GRANT SELECT ON recent_audit_logs TO anon;
GRANT SELECT ON recent_audit_logs TO authenticated;

