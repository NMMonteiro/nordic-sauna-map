import { createClient } from '@supabase/supabase-js';

// Hardcoded for absolute reliability to break the cycle of environment errors
const supabaseUrl = 'https://hgpcpontdxjsbqsjiech.supabase.co';
export const supabaseAnonKey = 'sb_publishable_2FsR0yjkb0MFJIQGSrmYBw_NoVaFlJN';

console.log('Supabase client hard-initialized for project: hgpcpontdxjsbqsjiech');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
