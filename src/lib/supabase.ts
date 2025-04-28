
import { createClient } from '@supabase/supabase-js';

// Use the hardcoded values from the auto-generated client
const SUPABASE_URL = "https://fktsblchzslffbykmvcq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrdHNibGNoenNsZmZieWttdmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MTMwMzEsImV4cCI6MjA2MTM4OTAzMX0.FyyQxMqlbp-WSCg486BgV4tkXZ_XbolMAKsmIQekeXM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
