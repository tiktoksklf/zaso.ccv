const SUPABASE_URL='https://taisoikscxytvgmcgjgr.supabase.co';
const SUPABASE_KEY='sb_publishable_5ETcjuL2nxe5J-GapmbQ0w_unVKAavU';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const validUsername=u=>/^[a-z0-9_]{3,20}$/.test(u);
