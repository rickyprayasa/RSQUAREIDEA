const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Fetching template_requests...');
    const { data: requests, error: fetchError } = await supabase
        .from('template_requests')
        .select('*');

    if (fetchError) {
        console.error('Error fetching requests:', fetchError);
        return;
    }

    if (!requests || requests.length === 0) {
        console.log('No requests found.');
        return;
    }

    console.log(`Found ${requests.length} requests. Syncing...`);
    
    for (const req of requests) {
        const { data: existing } = await supabase
            .from('projects')
            .select('id')
            .eq('source_type', 'template_requests')
            .eq('source_id', req.id)
            .single();
            
        if (!existing) {
            const { error: insertError } = await supabase
                .from('projects')
                .insert({
                    name: 'Project: ' + (req.company || req.name),
                    description: req.description || '-',
                    client_name: req.name,
                    client_email: req.email,
                    client_phone: req.phone || '',
                    source_type: 'template_requests',
                    source_id: req.id,
                    status: 'active',
                    created_at: req.created_at
                });
            if (insertError) {
                console.error('Failed to insert project for request', req.id, insertError);
            } else {
                console.log('Inserted project for request', req.id);
            }
        } else {
            console.log('Project already exists for request', req.id);
        }
    }
    console.log('Done!');
}

run();
