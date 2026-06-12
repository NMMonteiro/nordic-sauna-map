
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hgpcpontdxjsbqsjiech.supabase.co';
const supabaseAnonKey = 'sb_publishable_2FsR0yjkb0MFJIQGSrmYBw_NoVaFlJN';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function dump() {
    const { data: materials } = await supabase.from('learning_materials').select('*');
    console.log('--- Material 1 ---');
    console.log(JSON.stringify(materials?.[0], null, 2));

    const { data: posts } = await supabase.from('blog_posts').select('*');
    console.log('--- Post 1 ---');
    console.log(JSON.stringify(posts?.[0], null, 2));
}

dump();
