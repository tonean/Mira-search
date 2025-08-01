require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to call Gemini API for analysis
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
        maxOutputTokens: 800
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
            resolve(text);
          } else {
            reject(new Error('No content in Gemini response'));
          }
        } catch (error) {
          console.error('Error parsing Gemini response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Function to collect Twitter user data using snscrape
async function collectTwitterUser(username, tweetLimit = 50) {
  return new Promise((resolve, reject) => {
    console.log(`🔍 Collecting @${username} (last ${tweetLimit} tweets)...`);
    
    // Use snscrape to get user tweets
    const command = `snscrape --jsonl --max-results ${tweetLimit} twitter-user ${username}`;
    
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error collecting @${username}:`, error.message);
        resolve(null);
        return;
      }
      
      if (stderr) {
        console.warn(`⚠️ Warning for @${username}:`, stderr);
      }
      
      try {
        // Parse JSONL output (each line is a JSON object)
        const tweets = stdout.trim().split('\n')
          .filter(line => line.trim())
          .map(line => {
            try {
              return JSON.parse(line);
            } catch (e) {
              console.warn('Failed to parse tweet JSON:', line.substring(0, 100));
              return null;
            }
          })
          .filter(tweet => tweet !== null);
        
        console.log(`✅ Collected ${tweets.length} tweets from @${username}`);
        resolve(tweets);
        
      } catch (parseError) {
        console.error(`❌ Error parsing tweets for @${username}:`, parseError);
        resolve(null);
      }
    });
  });
}

// Function to collect user profile info using snscrape
async function collectTwitterProfile(username) {
  return new Promise((resolve, reject) => {
    console.log(`👤 Collecting profile info for @${username}...`);
    
    // Use snscrape to get user profile
    const command = `snscrape --jsonl twitter-user ${username}`;
    
    exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error collecting profile @${username}:`, error.message);
        resolve(null);
        return;
      }
      
      try {
        // Get the first line which should be the user profile
        const lines = stdout.trim().split('\n').filter(line => line.trim());
        if (lines.length === 0) {
          resolve(null);
          return;
        }
        
        // Look for the user object (not tweet objects)
        let userProfile = null;
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.username && !data.content) { // Profile object, not tweet
              userProfile = data;
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        console.log(`✅ Collected profile for @${username}`);
        resolve(userProfile);
        
      } catch (parseError) {
        console.error(`❌ Error parsing profile for @${username}:`, parseError);
        resolve(null);
      }
    });
  });
}

// Function to analyze tweets with AI and generate insights
async function analyzeTweetsWithAI(username, tweets) {
  if (!tweets || tweets.length === 0) {
    return null;
  }
  
  console.log(`🤖 Analyzing ${tweets.length} tweets from @${username} with AI...`);
  
  // Extract tweet content and metadata
  const tweetTexts = tweets
    .filter(tweet => tweet.content && !tweet.content.startsWith('RT @'))
    .slice(0, 30) // Limit to 30 most recent original tweets
    .map(tweet => tweet.content);
  
  const retweets = tweets
    .filter(tweet => tweet.content && tweet.content.startsWith('RT @'))
    .slice(0, 20) // Get some retweets too
    .map(tweet => tweet.content);
  
  if (tweetTexts.length === 0) {
    console.log(`⚠️ No original tweets found for @${username}`);
    return null;
  }
  
  const prompt = `Analyze this Twitter user's recent activity and create a comprehensive profile:

USERNAME: @${username}

RECENT TWEETS (${tweetTexts.length}):
${tweetTexts.join('\n---\n')}

${retweets.length > 0 ? `RECENT RETWEETS (${retweets.length}):
${retweets.slice(0, 10).join('\n---\n')}` : ''}

Based on this Twitter activity, provide a JSON response with:

{
  "profile_overview": "A 2-3 sentence professional overview based on their actual tweet content and interests",
  "expertise_areas": ["List of 3-5 specific skills/expertise areas they demonstrate"],
  "key_achievements": ["List of 3-4 achievements or notable work mentioned in tweets"],
  "predicted_interests": ["List of 4-6 interests based on tweet topics"],
  "personality_traits": ["List of 3-4 personality traits based on communication style"],
  "communication_style": "Brief description of how they communicate online",
  "main_topics": ["List of 4-6 main topics they tweet about"],
  "connection_message": "A personalized message someone could send to connect with them based on their interests"
}

Focus on:
- Actual topics they discuss
- Technical skills mentioned
- Projects or work they share
- Industries/fields they're involved in
- Communication tone and style
- Professional interests and expertise

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await callGeminiAPI(prompt);
    const analysis = JSON.parse(response);
    console.log(`✅ AI analysis complete for @${username}`);
    return analysis;
  } catch (error) {
    console.error(`❌ Error analyzing tweets for @${username}:`, error);
    return null;
  }
}

// Function to update user profile in database with live data
async function updateUserWithLiveData(username) {
  try {
    console.log(`\n🚀 Starting live data collection for @${username}...`);
    
    // First, collect profile info
    const profileData = await collectTwitterProfile(username);
    
    // Then collect recent tweets
    const tweets = await collectTwitterUser(username, 100);
    
    if (!tweets || tweets.length === 0) {
      console.log(`❌ No tweets found for @${username}, skipping...`);
      return false;
    }
    
    // Analyze tweets with AI
    const analysis = await analyzeTweetsWithAI(username, tweets);
    
    if (!analysis) {
      console.log(`❌ AI analysis failed for @${username}, skipping...`);
      return false;
    }
    
    // Prepare update data
    const updateData = {
      // Live collected profile data
      live_collected_at: new Date().toISOString(),
      live_tweet_count: tweets.length,
      
      // AI analysis results
      ai_profile_overview: analysis.profile_overview,
      ai_expertise_areas: analysis.expertise_areas,
      ai_key_achievements: analysis.key_achievements,
      ai_interests: analysis.predicted_interests,
      ai_personality_traits: analysis.personality_traits,
      ai_communication_style: analysis.communication_style,
      ai_main_topics: analysis.main_topics,
      ai_connection_message: analysis.connection_message,
      
      // Store recent tweets as quotes for search
      quotes: tweets
        .filter(tweet => tweet.content && !tweet.content.startsWith('RT @'))
        .slice(0, 20)
        .map(tweet => tweet.content)
    };
    
    // Add profile data if available
    if (profileData) {
      updateData.followers = profileData.followersCount || 0;
      updateData.following = profileData.friendsCount || 0;
      updateData.profile_picture_url = profileData.profileImageUrl || null;
      updateData.bio = profileData.description || null;
      updateData.location = profileData.location || null;
      updateData.verified = profileData.verified || false;
    }
    
    // Update in database
    const { error } = await supabase
      .from('people')
      .update(updateData)
      .eq('username', username);
    
    if (error) {
      console.error(`❌ Database update error for @${username}:`, error);
      return false;
    }
    
    console.log(`✅ Successfully updated @${username} with live data!`);
    console.log(`   - Profile: ${analysis.profile_overview.substring(0, 100)}...`);
    console.log(`   - Expertise: ${analysis.expertise_areas.join(', ')}`);
    console.log(`   - Topics: ${analysis.main_topics.join(', ')}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error updating @${username}:`, error);
    return false;
  }
}

// Function to update multiple users with live data
async function updateMultipleUsersWithLiveData(usernames, delayBetweenRequests = 5000) {
  console.log(`🚀 Starting live data collection for ${usernames.length} users...`);
  console.log(`⏱️ Delay between requests: ${delayBetweenRequests}ms`);
  
  const results = {
    success: [],
    failed: []
  };
  
  for (let i = 0; i < usernames.length; i++) {
    const username = usernames[i];
    console.log(`\n📊 Progress: ${i + 1}/${usernames.length}`);
    
    const success = await updateUserWithLiveData(username);
    
    if (success) {
      results.success.push(username);
    } else {
      results.failed.push(username);
    }
    
    // Add delay between requests to be respectful
    if (i < usernames.length - 1) {
      console.log(`⏳ Waiting ${delayBetweenRequests}ms before next user...`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
    }
  }
  
  console.log(`\n🎉 Live data collection complete!`);
  console.log(`✅ Successfully updated: ${results.success.length} users`);
  console.log(`❌ Failed to update: ${results.failed.length} users`);
  
  if (results.success.length > 0) {
    console.log(`✅ Success: ${results.success.join(', ')}`);
  }
  
  if (results.failed.length > 0) {
    console.log(`❌ Failed: ${results.failed.join(', ')}`);
  }
  
  return results;
}

// Main execution
async function main() {
  console.log('🐦 Twitter Live Data Collector Starting...');
  
  // Get users from database that need live updates
  const { data: users, error } = await supabase
    .from('people')
    .select('username')
    .not('username', 'is', null)
    .is('live_collected_at', null) // Only users not yet live collected
    .limit(10); // Start with 10 users
  
  if (error) {
    console.error('❌ Error fetching users:', error);
    return;
  }
  
  if (!users || users.length === 0) {
    console.log('ℹ️ No users found that need live data collection');
    return;
  }
  
  const usernames = users.map(user => user.username);
  console.log(`📋 Found ${usernames.length} users to update: ${usernames.join(', ')}`);
  
  await updateMultipleUsersWithLiveData(usernames, 3000); // 3 second delay between requests
}

// Export functions for use in other scripts
module.exports = {
  collectTwitterUser,
  collectTwitterProfile,
  analyzeTweetsWithAI,
  updateUserWithLiveData,
  updateMultipleUsersWithLiveData
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
} 