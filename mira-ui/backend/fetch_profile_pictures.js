require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to fetch profile picture URL from Twitter
async function fetchProfilePicture(username) {
  return new Promise((resolve) => {
    // Twitter profile picture URL format
    const profileUrl = `https://pbs.twimg.com/profile_images/`;
    
    // Try to get the profile picture using Twitter's API endpoint
    const apiUrl = `https://api.twitter.com/2/users/by/username/${username}?user.fields=profile_image_url`;
    
    // For now, we'll use a placeholder approach since we don't have Twitter API access
    // In a real implementation, you'd need Twitter API credentials
    
    // Use a service like Gravatar or generate a consistent placeholder
    const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=200&bold=true`;
    
    resolve(placeholderUrl);
  });
}

// Function to update profile pictures in database
async function updateProfilePictures() {
  console.log('🔄 Fetching profile pictures...');
  
  try {
    // Get all people with usernames
    const { data: people, error } = await supabase
      .from('people')
      .select('id, username, name')
      .not('username', 'is', null);
    
    if (error) {
      console.error('Error fetching people:', error);
      return;
    }
    
    console.log(`📊 Found ${people.length} people with usernames`);
    
    // Process each person
    for (const person of people) {
      if (person.username) {
        try {
          const profilePictureUrl = await fetchProfilePicture(person.username);
          
          // Update the database with the profile picture URL
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
            console.log(`✅ Updated ${person.username} with profile picture`);
          }
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Error fetching profile picture for ${person.username}:`, error);
        }
      }
    }
    
    console.log('✅ Profile picture update completed');
    
  } catch (error) {
    console.error('Error in updateProfilePictures:', error);
  }
}

// Run the script
updateProfilePictures().catch(console.error); 