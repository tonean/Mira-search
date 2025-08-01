require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addTimelineInterestsColumns() {
  console.log('🔄 Adding timeline and interests columns to database...');
  
  try {
    // Add new columns for timeline and interests data
    const columns = [
      'ai_timeline_content JSONB DEFAULT \'[]\'',
      'ai_predicted_interests JSONB DEFAULT \'[]\''
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
    console.log('ALTER TABLE people ADD COLUMN IF NOT EXISTS ai_timeline_content JSONB DEFAULT \'[]\';');
    console.log('ALTER TABLE people ADD COLUMN IF NOT EXISTS ai_predicted_interests JSONB DEFAULT \'[]\';');
    
  } catch (error) {
    console.error('Error adding columns:', error);
  }
}

addTimelineInterestsColumns().catch(console.error); 