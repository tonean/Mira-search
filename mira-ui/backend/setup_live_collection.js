require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to execute shell commands
function execCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Running: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.warn(`⚠️ Warning: ${stderr}`);
      }
      console.log(`✅ Output: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Function to add database columns for live data collection
async function addLiveDataCollectionColumns() {
  console.log('🗄️ Adding live data collection columns to database...');
  
  const columns = [
    'live_collected_at TIMESTAMP',
    'live_tweet_count INTEGER DEFAULT 0',
    'ai_communication_style TEXT',
    'ai_main_topics TEXT[]',
    'bio TEXT',
    'location TEXT',
    'verified BOOLEAN DEFAULT false'
  ];
  
  for (const column of columns) {
    try {
      const { error } = await supabase.rpc('add_column_if_not_exists', {
        table_name: 'people',
        column_definition: column
      });
      
      if (error) {
        console.log(`⚠️ Column might already exist: ${column.split(' ')[0]}`);
      } else {
        console.log(`✅ Added column: ${column.split(' ')[0]}`);
      }
    } catch (err) {
      console.log(`⚠️ Error adding column ${column.split(' ')[0]}:`, err.message);
    }
  }
}

// Function to install snscrape
async function installSnscrape() {
  console.log('📦 Installing snscrape...');
  
  try {
    // Check if snscrape is already installed
    await execCommand('snscrape --version');
    console.log('✅ snscrape is already installed!');
    return true;
  } catch (error) {
    console.log('📥 snscrape not found, installing...');
  }
  
  try {
    // Try installing with pip3 first
    await execCommand('pip3 install snscrape');
    console.log('✅ snscrape installed successfully with pip3!');
    return true;
  } catch (error) {
    console.log('⚠️ pip3 failed, trying pip...');
    
    try {
      await execCommand('pip install snscrape');
      console.log('✅ snscrape installed successfully with pip!');
      return true;
    } catch (error2) {
      console.error('❌ Failed to install snscrape with both pip3 and pip');
      console.error('Please install manually with: pip3 install snscrape');
      return false;
    }
  }
}

// Function to test snscrape installation
async function testSnscrape() {
  console.log('🧪 Testing snscrape installation...');
  
  try {
    const output = await execCommand('snscrape --help');
    console.log('✅ snscrape is working correctly!');
    return true;
  } catch (error) {
    console.error('❌ snscrape test failed:', error.message);
    return false;
  }
}

// Function to create SQL function for adding columns safely
async function createAddColumnFunction() {
  console.log('🔧 Creating add_column_if_not_exists function...');
  
  const functionSQL = `
    CREATE OR REPLACE FUNCTION add_column_if_not_exists(
      table_name TEXT,
      column_definition TEXT
    ) RETURNS VOID AS $$
    DECLARE
      column_name TEXT;
    BEGIN
      column_name := split_part(column_definition, ' ', 1);
      
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = column_name
      ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN %s', table_name, column_definition);
      END IF;
    END;
    $$ LANGUAGE plpgsql;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: functionSQL });
    if (error) {
      console.log('⚠️ Function might already exist or need manual creation');
    } else {
      console.log('✅ Created add_column_if_not_exists function');
    }
  } catch (err) {
    console.log('⚠️ Will try adding columns directly...');
  }
}

// Main setup function
async function main() {
  console.log('🚀 Setting up live Twitter data collection...\n');
  
  try {
    // Step 1: Install snscrape
    const snscrapeInstalled = await installSnscrape();
    if (!snscrapeInstalled) {
      console.error('❌ Setup failed: snscrape installation failed');
      return;
    }
    
    // Step 2: Test snscrape
    const snscrapeWorking = await testSnscrape();
    if (!snscrapeWorking) {
      console.error('❌ Setup failed: snscrape not working correctly');
      return;
    }
    
    // Step 3: Create database function
    await createAddColumnFunction();
    
    // Step 4: Add database columns
    await addLiveDataCollectionColumns();
    
    console.log('\n🎉 Live data collection setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run: node live_twitter_collector.js');
    console.log('2. Or import and use the functions in your own scripts');
    console.log('\nExample usage:');
    console.log('const { updateUserWithLiveData } = require("./live_twitter_collector");');
    console.log('await updateUserWithLiveData("username");');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run setup
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  installSnscrape,
  testSnscrape,
  addLiveDataCollectionColumns
}; 