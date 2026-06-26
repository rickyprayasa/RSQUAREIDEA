-- Backfill existing template_requests into projects table
INSERT INTO projects (name, description, client_name, client_email, client_phone, source_type, source_id, status, created_at)
SELECT 
    'Project: ' || COALESCE(company, name),
    COALESCE(description, '-'),
    name,
    email,
    phone,
    'template_requests',
    id,
    'active',
    created_at
FROM template_requests
WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE source_type = 'template_requests' AND source_id = template_requests.id
);
