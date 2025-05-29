
// Configuration values loaded from environment variables (.env.local)
// Make sure to create a .env.local file with the following variables:
// VITE_SUPABASE_URL=your-supabase-url
// VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
// VITE_ADMIN_EMAILS=email1,email2,email3

// Supabase connection details
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Admin emails for access control
export const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'familia@shareni.com').split(',');

// Define the name of your Supabase table for tickets
export const SUPABASE_TICKETS_TABLE = import.meta.env.VITE_SUPABASE_TICKETS_TABLE || 'tickets';

// Define the name of your Supabase Storage bucket for payment proofs
export const SUPABASE_STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'payment-proofs';