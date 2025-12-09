-- Add invite token column for feedback campaign
ALTER TABLE customers ADD COLUMN IF NOT EXISTS feedback_invite_token TEXT;

-- Create unique index for faster lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_feedback_invite_token 
ON customers(feedback_invite_token) WHERE feedback_invite_token IS NOT NULL;
