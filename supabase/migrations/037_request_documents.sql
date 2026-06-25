-- Add columns for storing AI generated documents
ALTER TABLE public.template_requests
ADD COLUMN prd_content TEXT DEFAULT NULL,
ADD COLUMN proposal_content TEXT DEFAULT NULL;
