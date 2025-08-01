require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addComprehensiveProfileColumns() {
  console.log('🔄 Adding comprehensive profile columns to database...');
  
  try {
    // Add new columns for comprehensive profile data
    const columns = [
      'ai_expertise_areas JSONB DEFAULT \'[]\'',
      'ai_key_achievements JSONB DEFAULT \'[]\'',
      'ai_interests JSONB DEFAULT \'[]\'',
      'ai_personality_traits JSONB DEFAULT \'[]\'',
      'ai_connection_message TEXT',
      'comprehensive_twitter_data JSONB'
    ];
    
    for (const column of columns) {
      const [columnName, columnDef] = column.split(' ');
      console.log(`📝 Adding column: ${columnName}`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE people ADD COLUMN IF NOT EXISTS ${columnName} ${columnDef};`
        });
        
        if (error) {
          console.log(`⚠️ Column ${columnName} might already exist or needs manual creation`);
          console.log(`   Please run this SQL manually in Supabase: ALTER TABLE people ADD COLUMN IF NOT EXISTS ${columnName} ${columnDef};`);
        } else {
          console.log(`✅ Added column: ${columnName}`);
        }
      } catch (err) {
        console.log(`⚠️ Column ${columnName} might already exist or needs manual creation`);
        console.log(`   Please run this SQL manually in Supabase: ALTER TABLE people ADD COLUMN IF NOT EXISTS ${columnName} ${columnDef};`);
      }
    }
    
    console.log('✅ Database columns setup complete!');
    console.log('\n📋 Manual SQL commands if needed:');
    console.log('ALTER TABLE people ADD COLUMN IF NOT EXISTS ai_expertise_areas JSONB DEFAULT \'[]\';');
    console.log('ALTER TABLE people ADD COLUMN IF NOT EXISTS ai_key_achievements JSONB DEFAULT \'[]\';');
    console.log('ALTER TABLE people ADD COLUMN IF NOT EXISTS ai_interests JSONB DEFAULT \'[]\';');
    console.log('ALTER TABLE people ADD COLUMN IF NOT EXISTS ai_personality_traits JSONB DEFAULT \'[]\';');
    console.log('ALTER TABLE people ADD COLUMN IF NOT EXISTS ai_connection_message TEXT;');
    console.log('ALTER TABLE people ADD COLUMN IF NOT EXISTS comprehensive_twitter_data JSONB;');
    
  } catch (error) {
    console.error('Error adding columns:', error);
  }
}

addComprehensiveProfileColumns().catch(console.error); 