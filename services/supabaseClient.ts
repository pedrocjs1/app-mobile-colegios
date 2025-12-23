// Supabase Client Configuration
// This file initializes the Supabase client with AsyncStorage for session persistence

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables!');
    console.error('Please create a .env file with:');
    console.error('EXPO_PUBLIC_SUPABASE_URL=your_project_url');
    console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
}

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    }
);

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
    return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url');
};

// Export types for TypeScript
export type { Session, User } from '@supabase/supabase-js';
