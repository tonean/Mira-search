require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkPolicies() {
  console.log('Checking RLS policies...');
  
  try {
    // Try to query the people table to see if RLS is blocking us
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying people table:', error);
    } else {
      console.log('✅ Successfully queried people table');
      console.log('Current data count:', data.length);
    }

    // Try to insert a test record
    const testData = {
      user_email: 'demo@mira.com',
      account_id: 'test-123',
      name: 'Test User',
      type: 'test',
      source: 'test',
      quotes: [],
      following: false
    };

    const { data: insertData, error: insertError } = await supabase
      .from('people')
      .insert(testData)
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      console.log('\n💡 Try these solutions:');
      console.log('1. Disable RLS completely on the people table');
      console.log('2. Or add a policy that allows all operations for all users');
    } else {
      console.log('✅ Successfully inserted test record');
      
      // Clean up test record
      await supabase
        .from('people')
        .delete()
        .eq('account_id', 'test-123');
      console.log('🧹 Cleaned up test record');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkPolicies().catch(console.error); 