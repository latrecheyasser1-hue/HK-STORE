import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase public credentials missing in environment variables.");
}

// Client-side Supabase instance (Subject to Row Level Security)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
