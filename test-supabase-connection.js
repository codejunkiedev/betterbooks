// Simple test script to verify Supabase connection
// Run with: node test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');

// Use the same environment variables as the app
const supabaseUrl = 'https://bfmmxsrzuzklexrfrqwb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmbW14c3J6dXprbGV4cmZycXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1Mzc1NTQsImV4cCI6MjA2MjExMzU1NH0.9_tiPZwB2YkGjhcpQlIYhmAu3eil_4mvhB3QOaqfVBw';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey.length);

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});

async function testConnection() {
    try {
        console.log('\n1. Testing basic connection...');
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error('❌ Auth error:', error);
        } else {
            console.log('✅ Auth connection successful');
            console.log('Session:', data.session ? 'Active' : 'None');
        }

        console.log('\n2. Testing API endpoint...');
        const { data: apiData, error: apiError } = await supabase
            .from('companies')
            .select('count')
            .limit(1);

        if (apiError) {
            console.error('❌ API error:', apiError);
        } else {
            console.log('✅ API connection successful');
            console.log('Data:', apiData);
        }

    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
    }
}

testConnection(); 