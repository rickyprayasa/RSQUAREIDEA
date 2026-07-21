const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicUrl = process.env.R2_PUBLIC_URL || 'https://cdn.rsquareidea.my.id';

const oldPrefix = `${supabaseUrl}/storage/v1/object/public/`;
const oldR2Prefix = 'https://pub-8f2c427036524f5f91c24176f710ea27.r2.dev/';
const newPrefix = publicUrl.endsWith('/') ? publicUrl : publicUrl + '/';

async function updateProducts() {
    console.log('Fetching products...');
    const res = await fetch(`${supabaseUrl}/rest/v1/products?select=id,images`, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });
    
    if (!res.ok) {
        console.error('Failed to fetch:', await res.text());
        return;
    }
    
    const products = await res.json();
    let updatedCount = 0;
    
    for (const product of products) {
        if (!product.images || !Array.isArray(product.images)) continue;
        
        let needsUpdate = false;
        const newImages = product.images.map(url => {
            if (typeof url === 'string') {
                if (url.includes(oldPrefix)) {
                    needsUpdate = true;
                    return url.replace(oldPrefix, newPrefix);
                } else if (url.includes(oldR2Prefix)) {
                    needsUpdate = true;
                    return url.replace(oldR2Prefix, newPrefix);
                }
            }
            return url;
        });
        
        if (needsUpdate) {
            console.log(`Updating product ${product.id}...`);
            const updateRes = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${product.id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ images: newImages })
            });
            
            if (updateRes.ok) {
                updatedCount++;
            } else {
                console.error(`Failed to update product ${product.id}:`, await updateRes.text());
            }
        }
    }
    
    console.log(`Successfully updated ${updatedCount} products.`);
}

updateProducts();
