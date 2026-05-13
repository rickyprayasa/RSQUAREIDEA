const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
if(urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  async function run() {
    let { data: prods } = await supabase.from('products').select('*').limit(1);
    if(prods && prods.length > 0) {
      console.log("Product Columns:", Object.keys(prods[0]));
    }
  }
  run();
}
