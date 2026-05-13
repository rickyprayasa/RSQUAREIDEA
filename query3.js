const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
if(urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  async function run() {
    let { data: inv } = await supabase.from('request_invoices').select('*').eq('invoice_number', 'INV-20260429-002');
    console.log("Invoice 002:", JSON.stringify(inv, null, 2));
    if (inv && inv[0]) {
      let { data: req } = await supabase.from('template_requests').select('*').eq('id', inv[0].request_id);
      console.log("Request for 002:", JSON.stringify(req, null, 2));
    }
  }
  run();
}
