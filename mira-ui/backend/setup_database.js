require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupDatabase() {
  console.log('Setting up Supabase database...');
  
  try {
    // Create the people table using SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS people (
          id SERIAL PRIMARY KEY,
          user_email TEXT NOT NULL,
          account_id TEXT NOT NULL,
          name TEXT,
          type TEXT,
          source TEXT,
          quotes JSONB DEFAULT '[]',
          following BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_email, account_id)
        );
        
        -- Create index for faster queries
        CREATE INDEX IF NOT EXISTS idx_people_user_email ON people(user_email);
        CREATE INDEX IF NOT EXISTS idx_people_account_id ON people(account_id);
      `
    });

    if (error) {
      console.log('Note: Using direct table creation method...');
      // If RPC doesn't work, we'll create the table through the Supabase dashboard
      console.log('\n📋 Please create the table manually in your Supabase dashboard:');
      console.log('\n1. Go to your Supabase project dashboard');
      console.log('2. Click on "Table Editor" in the left sidebar');
      console.log('3. Click "New Table"');
      console.log('4. Use these settings:');
      console.log('   - Name: people');
      console.log('   - Columns:');
      console.log('     * id (int8, primary key, identity)');
      console.log('     * user_email (text, not null)');
      console.log('     * account_id (text, not null)');
      console.log('     * name (text)');
      console.log('     * type (text)');
      console.log('     * source (text)');
      console.log('     * quotes (jsonb, default: [])');
      console.log('     * following (bool, default: false)');
      console.log('     * created_at (timestamptz, default: now())');
      console.log('     * updated_at (timestamptz, default: now())');
      console.log('5. Add a unique constraint on (user_email, account_id)');
      console.log('\nAfter creating the table, run the ingestion script again.');
    } else {
      console.log('✅ Database table created successfully!');
    }
  } catch (error) {
    console.error('Error setting up database:', error);
    console.log('\n📋 Please create the table manually in your Supabase dashboard as shown above.');
  }
}

setupDatabase().catch(console.error); 