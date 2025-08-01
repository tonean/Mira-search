require('dotenv').config();
const { updateUserWithLiveData, collectTwitterUser, analyzeTweetsWithAI } = require('./live_twitter_collector');

// Function to test data collection for a specific user
async function testSpecificUser(username) {
  console.log(`🧪 Testing live data collection for @${username}...\n`);
  
  try {
    // Test just the collection part first
    console.log('Step 1: Testing tweet collection...');
    const tweets = await collectTwitterUser(username, 20);
    
    if (!tweets || tweets.length === 0) {
      console.log(`❌ No tweets found for @${username}`);
      return;
    }
    
    console.log(`✅ Found ${tweets.length} tweets`);
    console.log('Sample tweets:');
    tweets.slice(0, 3).forEach((tweet, i) => {
      console.log(`${i + 1}. ${tweet.content?.substring(0, 100)}...`);
    });
    
    // Test AI analysis
    console.log('\nStep 2: Testing AI analysis...');
    const analysis = await analyzeTweetsWithAI(username, tweets);
    
    if (analysis) {
      console.log('✅ AI Analysis Results:');
      console.log(`Profile: ${analysis.profile_overview}`);
      console.log(`Expertise: ${analysis.expertise_areas?.join(', ')}`);
      console.log(`Topics: ${analysis.main_topics?.join(', ')}`);
      console.log(`Connection Message: ${analysis.connection_message}`);
    } else {
      console.log('❌ AI analysis failed');
    }
    
    // Test full database update
    console.log('\nStep 3: Testing database update...');
    const success = await updateUserWithLiveData(username);
    
    if (success) {
      console.log(`✅ Successfully updated @${username} in database!`);
    } else {
      console.log(`❌ Failed to update @${username} in database`);
    }
    
  } catch (error) {
    console.error(`❌ Test failed for @${username}:`, error);
  }
}

// Main function
async function main() {
  const testUsername = process.argv[2] || 'elonmusk'; // Default test user
  
  console.log('🐦 Live Twitter Data Collection Test\n');
  console.log(`Testing with username: @${testUsername}`);
  console.log('Usage: node test_live_collection.js <username>\n');
  
  await testSpecificUser(testUsername);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
} 