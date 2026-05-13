const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
if(urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  async function run() {
    let { data: reqs } = await supabase.from('template_requests').select('*');
    console.log("Requests:", JSON.stringify(reqs, null, 2));
    let { data: indevs } = await supabase.from('template_requests').select('*').eq('status', 'completed');
    console.log("Completed Requests:", JSON.stringify(indevs, null, 2));
    let { data: custom_showcase } = await supabase.from('products').select('*').eq('is_custom_showcase', true);
    console.log("Custom Showcases:", JSON.stringify(custom_showcase, null, 2));
    let { data: invs } = await supabase.from('request_invoices').select('*');
    console.log("Invoices:", JSON.stringify(invs, null, 2));
  }
  run();
}
