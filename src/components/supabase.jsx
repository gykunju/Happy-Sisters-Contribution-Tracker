import { createClient } from "@supabase/supabase-js";

// Use Vite env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

// Example async fetch function (use in a React component or hook)
//
// import supabase from './supabase';
//
// async function fetchTransactions() {
//   const { data, error } = await supabase.from('transaction').select();
//   return { data, error };
// }
