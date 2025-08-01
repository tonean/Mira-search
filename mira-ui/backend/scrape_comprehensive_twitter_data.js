require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to call Gemini API
async function callGeminiAPI(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          
          if (response.error) {
            console.error('Gemini API error:', response.error);
            reject(new Error(`Gemini API error: ${response.error.message}`));
            return;
          }
          
          if (response.candidates && response.candidates[0] && response.candidates[0].content) {
            const text = response.candidates[0].content.parts[0].text;
            resolve(text.trim());
          } else {
            reject(new Error('Invalid response format from Gemini API'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Function to extract comprehensive Twitter data from the demo-data folder
async function extractComprehensiveTwitterData() {
  const fs = require('fs');
  const path = require('path');
  
  console.log('📂 Extracting comprehensive Twitter data...');
  
  const demoDataPath = path.join(__dirname, '..', 'demo-data');
  const twitterData = {};
  
  try {
    // Read followers data
    const followersPath = path.join(demoDataPath, 'follower.js');
    if (fs.existsSync(followersPath)) {
      const followersContent = fs.readFileSync(followersPath, 'utf8');
      // Extract JSON from the file (remove the window.YTD.follower.part0 = part)
      const followersMatch = followersContent.match(/window\.YTD\.follower\.part0\s*=\s*(\[.*?\]);/s);
      if (followersMatch) {
        const followers = JSON.parse(followersMatch[1]);
        followers.forEach(follower => {
          const username = follower.follower?.screen_name;
          if (username) {
            twitterData[username] = {
              ...twitterData[username],
              username: username,
              name: follower.follower?.name || username,
              description: follower.follower?.description || '',
              followers_count: follower.follower?.followers_count || 0,
              following_count: follower.follower?.friends_count || 0,
              tweets_count: follower.follower?.statuses_count || 0,
              created_at: follower.follower?.created_at || '',
              location: follower.follower?.location || '',
              verified: follower.follower?.verified || false,
              profile_image_url: follower.follower?.profile_image_url_https || '',
              profile_banner_url: follower.follower?.profile_banner_url || '',
              tweets: [],
              retweets: [],
              likes: [],
              mentions: []
            };
          }
        });
      }
    }
    
    // Read following data
    const followingPath = path.join(demoDataPath, 'following.js');
    if (fs.existsSync(followingPath)) {
      const followingContent = fs.readFileSync(followingPath, 'utf8');
      const followingMatch = followingContent.match(/window\.YTD\.following\.part0\s*=\s*(\[.*?\]);/s);
      if (followingMatch) {
        const following = JSON.parse(followingMatch[1]);
        following.forEach(followed => {
          const username = followed.following?.screen_name;
          if (username) {
            twitterData[username] = {
              ...twitterData[username],
              username: username,
              name: followed.following?.name || username,
              description: followed.following?.description || '',
              followers_count: followed.following?.followers_count || 0,
              following_count: followed.following?.friends_count || 0,
              tweets_count: followed.following?.statuses_count || 0,
              created_at: followed.following?.created_at || '',
              location: followed.following?.location || '',
              verified: followed.following?.verified || false,
              profile_image_url: followed.following?.profile_image_url_https || '',
              profile_banner_url: followed.following?.profile_banner_url || '',
              tweets: [],
              retweets: [],
              likes: [],
              mentions: []
            };
          }
        });
      }
    }
    
    // Read tweets data (this might be large, so we'll process it in chunks)
    const tweetsPath = path.join(demoDataPath, 'tweets.js');
    if (fs.existsSync(tweetsPath)) {
      console.log('📝 Processing tweets data (this may take a while)...');
      const tweetsContent = fs.readFileSync(tweetsPath, 'utf8');
      const tweetsMatch = tweetsContent.match(/window\.YTD\.tweets\.part0\s*=\s*(\[.*?\]);/s);
      if (tweetsMatch) {
        const tweets = JSON.parse(tweetsMatch[1]);
        tweets.forEach(tweet => {
          const tweetData = tweet.tweet;
          const username = tweetData.user?.screen_name;
          
          if (username && twitterData[username]) {
            const tweetText = tweetData.full_text || tweetData.text || '';
            const isRetweet = tweetText.startsWith('RT @');
            const isReply = tweetData.in_reply_to_screen_name;
            const isQuote = tweetData.quoted_status;
            
            const tweetInfo = {
              id: tweetData.id_str,
              text: tweetText,
              created_at: tweetData.created_at,
              retweet_count: tweetData.retweet_count || 0,
              favorite_count: tweetData.favorite_count || 0,
              is_retweet: isRetweet,
              is_reply: !!isReply,
              is_quote: !!isQuote,
              hashtags: tweetData.entities?.hashtags?.map(h => h.text) || [],
              urls: tweetData.entities?.urls?.map(u => u.expanded_url) || [],
              mentions: tweetData.entities?.user_mentions?.map(u => u.screen_name) || []
            };
            
            if (isRetweet) {
              twitterData[username].retweets.push(tweetInfo);
            } else {
              twitterData[username].tweets.push(tweetInfo);
            }
          }
        });
      }
    }
    
    // Read likes data (if exists)
    const likesPath = path.join(demoDataPath, 'like.js');
    if (fs.existsSync(likesPath)) {
      const likesContent = fs.readFileSync(likesPath, 'utf8');
      const likesMatch = likesContent.match(/window\.YTD\.like\.part0\s*=\s*(\[.*?\]);/s);
      if (likesMatch) {
        const likes = JSON.parse(likesMatch[1]);
        likes.forEach(like => {
          const tweetData = like.like;
          const username = tweetData.user?.screen_name;
          
          if (username && twitterData[username]) {
            twitterData[username].likes.push({
              id: tweetData.id_str,
              text: tweetData.full_text || tweetData.text || '',
              created_at: tweetData.created_at,
              retweet_count: tweetData.retweet_count || 0,
              favorite_count: tweetData.favorite_count || 0
            });
          }
        });
      }
    } else {
      console.log('⚠️ No likes.js file found, skipping likes data');
    }
    
    console.log(`✅ Extracted data for ${Object.keys(twitterData).length} Twitter users`);
    return twitterData;
    
  } catch (error) {
    console.error('Error extracting Twitter data:', error);
    return {};
  }
}

// Function to generate comprehensive AI profile
async function generateComprehensiveProfile(username, userData) {
  const prompt = `
Generate a comprehensive professional profile for this Twitter user based on their complete social media presence.

USER: ${userData.name} (@${username})
DESCRIPTION: ${userData.description || 'No description available'}
LOCATION: ${userData.location || 'Not specified'}
FOLLOWERS: ${userData.followers_count}
FOLLOWING: ${userData.following_count}
TWEETS COUNT: ${userData.tweets_count}
VERIFIED: ${userData.verified ? 'Yes' : 'No'}

TWEETS (${userData.tweets.length} total):
${userData.tweets.slice(0, 20).map(t => `- "${t.text}" (${t.retweet_count} RTs, ${t.favorite_count} likes)`).join('\n')}

RETWEETS (${userData.retweets.length} total):
${userData.retweets.slice(0, 10).map(t => `- "${t.text}"`).join('\n')}

LIKES (${userData.likes.length} total):
${userData.likes.slice(0, 10).map(t => `- "${t.text}"`).join('\n')}

TASK: Create a comprehensive professional profile that includes:

1. OVERVIEW: A 2-3 sentence professional overview (100-150 words)
2. EXPERTISE AREAS: 3-4 specific areas of expertise based on their content
3. KEY ACHIEVEMENTS: 2-3 notable achievements or contributions
4. INTERESTS: 2-3 current interests or focus areas
5. PERSONALITY TRAITS: 2-3 professional personality traits
6. CONNECTION MESSAGE: A personalized message to connect with them

OUTPUT FORMAT (JSON only):
{
  "overview": "Professional overview text",
  "expertise_areas": ["area1", "area2", "area3"],
  "key_achievements": ["achievement1", "achievement2"],
  "interests": ["interest1", "interest2"],
  "personality_traits": ["trait1", "trait2"],
  "connection_message": "Personalized connection message"
}

Make it highly specific and personal based on their actual content. Avoid generic statements.
`;

  try {
    const response = await callGeminiAPI(prompt);
    
    // Try to parse JSON response
    try {
      const parsed = JSON.parse(response);
      return parsed;
    } catch (parseError) {
      // If JSON parsing fails, create a structured response from the text
      const lines = response.split('\n').filter(line => line.trim());
      return {
        overview: lines[0] || `${userData.name} is a professional in their field with experience shared through their social media presence.`,
        expertise_areas: ['Technology', 'Social Media', 'Professional Development'],
        key_achievements: ['Active social media presence', 'Professional networking'],
        interests: ['Technology', 'Networking', 'Professional growth'],
        personality_traits: ['Engaged', 'Professional', 'Connected'],
        connection_message: `Hi ${userData.name}! I was impressed by your professional presence and would love to connect and discuss potential collaboration opportunities.`
      };
    }
  } catch (error) {
    console.error(`Error generating profile for ${username}:`, error);
    return {
      overview: `${userData.name} is a professional in their field with experience shared through their social media presence.`,
      expertise_areas: ['Technology', 'Social Media', 'Professional Development'],
      key_achievements: ['Active social media presence', 'Professional networking'],
      interests: ['Technology', 'Networking', 'Professional growth'],
      personality_traits: ['Engaged', 'Professional', 'Connected'],
      connection_message: `Hi ${userData.name}! I was impressed by your professional presence and would love to connect and discuss potential collaboration opportunities.`
    };
  }
}

// Function to update database with comprehensive profiles
async function updateComprehensiveProfiles() {
  console.log('🔄 Generating comprehensive AI-powered profiles...');
  
  try {
    // Extract comprehensive Twitter data
    const twitterData = await extractComprehensiveTwitterData();
    
    // Get existing people from database
    const { data: people, error } = await supabase
      .from('people')
      .select('id, name, username, account_id')
      .not('username', 'is', null);
    
    if (error) {
      console.error('Error fetching people:', error);
      return;
    }
    
    console.log(`📋 Found ${people.length} people to update`);
    
    // Process each person
    let updatedCount = 0;
    
    for (const person of people) {
      try {
        const username = person.username;
        const userData = twitterData[username];
        
        if (!userData) {
          console.log(`⚠️ No Twitter data found for ${username}, skipping...`);
          continue;
        }
        
        console.log(`🤖 Generating comprehensive profile for ${person.name} (@${username})...`);
        
        // Generate comprehensive AI profile
        const comprehensiveProfile = await generateComprehensiveProfile(username, userData);
        
        // Update the database with comprehensive profile data
        const { error: updateError } = await supabase
          .from('people')
          .update({ 
            ai_profile_overview: comprehensiveProfile.overview,
            ai_expertise_areas: comprehensiveProfile.expertise_areas,
            ai_key_achievements: comprehensiveProfile.key_achievements,
            ai_interests: comprehensiveProfile.interests,
            ai_personality_traits: comprehensiveProfile.personality_traits,
            ai_connection_message: comprehensiveProfile.connection_message,
            comprehensive_twitter_data: userData,
            updated_at: new Date().toISOString()
          })
          .eq('id', person.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${person.name}:`, updateError);
        } else {
          console.log(`✅ Updated ${person.name} with comprehensive profile`);
          console.log(`   Overview: "${comprehensiveProfile.overview.substring(0, 100)}..."`);
          console.log(`   Expertise: ${comprehensiveProfile.expertise_areas.join(', ')}`);
          updatedCount++;
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Error processing ${person.name}:`, error);
      }
    }
    
    console.log(`✅ Successfully updated ${updatedCount} people with comprehensive profiles`);
    
  } catch (error) {
    console.error('Error in updateComprehensiveProfiles:', error);
  }
}

// Run the script
updateComprehensiveProfiles().catch(console.error); 