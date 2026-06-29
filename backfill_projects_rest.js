const supabaseUrl = 'https://nagujrwbifmpcwhotzut.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
    if (!supabaseKey) {
        console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
        return;
    }

    console.log('Fetching template_requests...');
    const reqRes = await fetch(`${supabaseUrl}/rest/v1/template_requests`, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });
    const requests = await reqRes.json();
    if (requests.error) {
        console.error('Error fetching template_requests:', requests.error);
        return;
    }

    console.log('Fetching projects...');
    const projRes = await fetch(`${supabaseUrl}/rest/v1/projects`, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });
    const projects = await projRes.json();
    if (projects.error) {
        console.error('Error fetching projects:', projects.error);
        return;
    }

    console.log(`Found ${requests.length} requests and ${projects.length} projects.`);

    const existingSourceIds = new Set(
        projects
            .filter(p => p.source_type === 'template_requests')
            .map(p => p.source_id)
    );

    for (const req of requests) {
        if (!existingSourceIds.has(String(req.id))) {
            console.log(`Inserting project for request: ${req.id} - ${req.name}`);
            const insertRes = await fetch(`${supabaseUrl}/rest/v1/projects`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    name: 'Project: ' + (req.company || req.name),
                    description: req.description || '-',
                    client_name: req.name,
                    client_email: req.email,
                    client_phone: req.phone || '',
                    source_type: 'template_requests',
                    source_id: String(req.id),
                    status: 'active',
                    created_at: req.created_at
                })
            });
            const insertData = await insertRes.json();
            if (insertData.error) {
                console.error(`Failed to insert project for request ${req.id}:`, insertData.error);
            } else {
                console.log(`Successfully inserted project for request ${req.id}`);
            }
        } else {
            console.log(`Project already exists for request ${req.id}`);
        }
    }
    console.log('Done!');
}

run();
