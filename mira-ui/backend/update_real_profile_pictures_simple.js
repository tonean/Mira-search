require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to get real Twitter profile picture URL
function getTwitterProfilePictureUrl(username) {
  // Use unavatar.io service to fetch Twitter profile pictures
  // This service can fetch real Twitter avatars without API keys
  return `https://unavatar.io/twitter/${username}`;
}

// Function to update profile pictures in database
async function updateRealProfilePictures() {
  console.log('🔄 Updating with real Twitter profile pictures...');
  
  try {
    // Get existing people from database
    const { data: existingPeople, error } = await supabase
      .from('people')
      .select('id, username, name')
      .not('username', 'is', null);
    
    if (error) {
      console.error('Error fetching people:', error);
      return;
    }
    
    console.log(`📋 Found ${existingPeople.length} people with usernames`);
    
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
          console.error(`❌ Error updating ${person.username}:`, error);
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