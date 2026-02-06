import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkSubscribers() {
    const { data: subscribers, error: sError } = await supabase
        .from('newsletter_subscribers')
        .select('*');

    if (sError) console.error('Subscribers error:', sError);
    else console.log('Subscribers:', subscribers);

    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('email, role, status');

    if (pError) console.error('Profiles error:', pError);
    else console.log('Profiles:', profiles);
}

checkSubscribers();
