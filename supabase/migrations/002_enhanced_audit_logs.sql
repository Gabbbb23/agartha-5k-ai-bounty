-- Enhanced audit_logs table with comprehensive medical compliance fields
-- Run this AFTER 001_create_audit_logs.sql or as a replacement

-- Drop existing table if you want to start fresh (comment out if migrating)
-- DROP TABLE IF EXISTS audit_logs;

-- Add new columns to existing table (migration approach)
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS risk_level TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS risk_score INTEGER;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS treatment_medication TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS treatment_dosage TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS analysis_id TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS patient_data_hash TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS modifications_json JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS analysis_snapshot JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS patient_snapshot JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS drug_interactions_count INTEGER DEFAULT 0;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS contraindications_count INTEGER DEFAULT 0;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS confidence_score INTEGER;

-- Create additional indexes for new columns
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON audit_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_analysis_id ON audit_logs(analysis_id);

-- OR: Create fresh table with all fields (use this for new setup)
-- Uncomment below if starting fresh:

/*
CREATE TABLE IF NOT EXISTS audit_logs_v2 (
  -- Core identification
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  session_id TEXT,
  
  -- Action details
  action TEXT NOT NULL CHECK (action IN ('created', 'viewed', 'approved', 'modified', 'rejected')),
  details TEXT NOT NULL,
  
  -- User information
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Patient reference
  patient_id TEXT NOT NULL,
  patient_data_hash TEXT,
  patient_snapshot JSONB,
  
  -- Analysis context
  analysis_id TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  drug_interactions_count INTEGER DEFAULT 0,
  contraindications_count INTEGER DEFAULT 0,
  analysis_snapshot JSONB,
  
  -- Treatment details
  treatment_medication TEXT,
  treatment_dosage TEXT,
  
  -- Change tracking
  previous_value TEXT,
  new_value TEXT,
  modifications_json JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_logs_v2 ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations on audit_logs_v2" ON audit_logs_v2
  FOR ALL  USING (true)
  WITH CHECK (true);

-- Grant access
GRANT ALL ON audit_logs_v2 TO anon;
GRANT ALL ON audit_logs_v2 TO authenticated;
*/

-- Useful view for compliance reports
CREATE OR REPLACE VIEW audit_compliance_report AS
SELECT 
  DATE(timestamp) as date,
  patient_id,
  COUNT(*) as total_actions,
  COUNT(CASE WHEN action = 'approved' THEN 1 END) as approvals,
  COUNT(CASE WHEN action = 'rejected' THEN 1 END) as rejections,
  COUNT(CASE WHEN action = 'modified' THEN 1 END) as modifications,
  MAX(risk_level) as highest_risk_level,
  array_agg(DISTINCT user_name) as involved_users
FROM audit_logs
GROUP BY DATE(timestamp), patient_id
ORDER BY DATE(timestamp) DESC;

GRANT SELECT ON audit_compliance_report TO anon;
GRANT SELECT ON audit_compliance_report TO authenticated;

