const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicUrl = process.env.R2_PUBLIC_URL || 'https://cdn.rsquareidea.my.id';

const oldPrefix = `${supabaseUrl}/storage/v1/object/public/`;
const newPrefix = publicUrl.endsWith('/') ? publicUrl : publicUrl + '/';

async function updateVideoTutorials() {
    console.log('Fetching video tutorials...');
    const res = await fetch(`${supabaseUrl}/rest/v1/video_tutorials?select=id,thumbnail_url`, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });
    
    if (!res.ok) {
        console.error('Failed to fetch:', await res.text());
        return;
    }
    
    const videos = await res.json();
    let updatedCount = 0;
    
    for (const video of videos) {
        if (!video.thumbnail_url || typeof video.thumbnail_url !== 'string') continue;
        
        let newUrl = video.thumbnail_url;
        let needsUpdate = false;
        
        if (newUrl.includes(oldPrefix)) {
            newUrl = newUrl.replace(oldPrefix, newPrefix);
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            console.log(`Updating video tutorial ${video.id}...`);
            const updateRes = await fetch(`${supabaseUrl}/rest/v1/video_tutorials?id=eq.${video.id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ thumbnail_url: newUrl })
            });
            
            if (updateRes.ok) {
                updatedCount++;
            } else {
                console.error(`Failed to update video ${video.id}:`, await updateRes.text());
            }
        }
    }
    
    console.log(`Successfully updated ${updatedCount} video tutorials.`);
}

updateVideoTutorials();
