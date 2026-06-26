require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
    const { data: users, error } = await supabase.auth.admin.listUsers()
    if (error) console.error(error)
    else console.log("AUTH USERS:", users.users.map(u => u.email))

    const { data: profiles } = await supabase.from('users').select('email, role')
    console.log("PROFILES:", profiles)
}

check()
