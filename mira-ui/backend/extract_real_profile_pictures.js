require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to construct Twitter profile picture URL
function getTwitterProfilePictureUrl(username) {
  // Twitter profile picture URL format: https://pbs.twimg.com/profile_images/{user_id}/{image_name}
  // Since we don't have the exact image name, we'll use a fallback approach
  
  // Try to get from Twitter's API (requires authentication)
  // For now, we'll use a service that can fetch Twitter profile pictures
  
  // Option 1: Use Twitter's API endpoint (requires API key)
  // const apiUrl = `https://api.twitter.com/2/users/by/username/${username}?user.fields=profile_image_url`;
  
  // Option 2: Use a third-party service that can fetch Twitter profile pictures
  // const profileUrl = `https://unavatar.io/twitter/${username}`;
  
  // Option 3: Use Twitter's CDN with a known format (this is the most reliable)
  // Twitter profile pictures are typically stored at: https://pbs.twimg.com/profile_images/{user_id}/{image_name}
  
  // For now, let's use a service that can fetch Twitter avatars
  return `https://unavatar.io/twitter/${username}`;
}

// Function to extract usernames from tweets data
function extractUsernamesFromTweets(tweetsData) {
  const usernames = new Set();
  
  tweetsData.forEach(entry => {
    const tweet = entry.tweet;
    
    // Extract usernames from user mentions
    if (tweet.entities && tweet.entities.user_mentions) {
      tweet.entities.user_mentions.forEach(mention => {
        if (mention.screen_name) {
          usernames.add(mention.screen_name);
        }
      });
    }
  });
  
  return Array.from(usernames);
}

// Function to update profile pictures in database
async function updateRealProfilePictures() {
  console.log('🔄 Extracting real Twitter profile pictures...');
  
  try {
    // Load tweets data
    const tweetsPath = path.join(__dirname, '../demo-data/tweets.js');
    const tweetsContent = fs.readFileSync(tweetsPath, 'utf8');
    
    // Extract the tweets array from the JS file
    const tweetsMatch = tweetsContent.match(/window\.YTD\.tweets\.part0 = (\[[\s\S]*\]);/);
    if (!tweetsMatch) {
      console.error('Could not parse tweets.js file');
      return;
    }
    
    let tweetsData;
    try {
      tweetsData = JSON.parse(tweetsMatch[1]);
    } catch (parseError) {
      console.error('Error parsing tweets JSON:', parseError);
      return;
    }
    
    console.log(`📊 Loaded ${tweetsData.length} tweets`);
    
    // Extract usernames from tweets
    const usernames = extractUsernamesFromTweets(tweetsData);
    console.log(`👥 Found ${usernames.length} unique usernames`);
    
    // Get existing people from database
    const { data: existingPeople, error } = await supabase
      .from('people')
      .select('id, username, name');
    
    if (error) {
      console.error('Error fetching people:', error);
      return;
    }
    
    console.log(`📋 Found ${existingPeople.length} existing people in database`);
    
    // Update each person with real profile picture
    let updatedCount = 0;
    
    for (const person of existingPeople) {
      if (person.username) {
        try {
          // Get real profile picture URL
          const profilePictureUrl = getTwitterProfilePictureUrl(person.username);
          
          // Update the database with the real profile picture URL
          const { error: updateError } = await supabase
            .from('people')
            .update({ 
              profile_picture_url: profilePictureUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', person.id);
          
          if (updateError) {
            console.error(`❌ Error updating ${person.username}:`, updateError);
          } else {
            console.log(`✅ Updated ${person.username} with real profile picture: ${profilePictureUrl}`);
            updatedCount++;
          }
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Error fetching profile picture for ${person.username}:`, error);
        }
      }
    }
    
    console.log(`✅ Successfully updated ${updatedCount} people with real profile pictures`);
    
    // Show sample updated people
    console.log('\n📸 Sample updated profile pictures:');
    const samplePeople = existingPeople.slice(0, 5);
    for (const person of samplePeople) {
      if (person.username) {
        const profileUrl = getTwitterProfilePictureUrl(person.username);
        console.log(`👤 ${person.name || person.username} (@${person.username}): ${profileUrl}`);
      }
    }
    
  } catch (error) {
    console.error('Error in updateRealProfilePictures:', error);
  }
}

// Run the script
updateRealProfilePictures().catch(console.error); 