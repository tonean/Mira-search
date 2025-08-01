require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const https = require('https');

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

class LiveTwitterProfiler {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    if (!this.geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
  }

  // Collect recent tweets using snscrape
  async collectUserTweets(username, limit = 20) {
    return new Promise((resolve, reject) => {
              console.log(`🔍 Collecting recent tweets for @${username}...`);
      
      const command = `snscrape --jsonl --max-results ${limit} twitter-user ${username}`;
      
      exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          console.log(`❌ Error collecting @${username}: ${error.message}`);
          resolve({ tweets: [], error: error.message });
          return;
        }

        try {
          const lines = stdout.trim().split('\n').filter(line => line.trim());
          const tweets = lines.map(line => {
            try {
              return JSON.parse(line);
            } catch (e) {
              return null;
            }
          }).filter(tweet => tweet);

          console.log(`✅ Collected ${tweets.length} tweets for @${username}`);
          
          // Extract relevant data
          const tweetData = tweets.map(tweet => ({
            content: tweet.content || tweet.rawContent || '',
            date: tweet.date,
            replyCount: tweet.replyCount || 0,
            retweetCount: tweet.retweetCount || 0,
            likeCount: tweet.likeCount || 0,
            isRetweet: tweet.retweetedTweet ? true : false,
            originalTweet: tweet.retweetedTweet ? tweet.retweetedTweet.content : null
          }));

          resolve({ tweets: tweetData, error: null });
        } catch (parseError) {
          console.log(`❌ Error parsing collected tweets for @${username}: ${parseError.message}`);
          resolve({ tweets: [], error: parseError.message });
        }
      });
    });
  }

  // Call Gemini API to analyze tweets and create profile
  async callGeminiAPI(prompt, retries = 2) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(responseData);
            if (response.candidates && response.candidates[0] && response.candidates[0].content) {
              resolve(response.candidates[0].content.parts[0].text);
            } else {
              throw new Error('Invalid response structure');
            }
          } catch (error) {
            if (retries > 0) {
              console.log(`🔄 Retrying Gemini API call (${retries} retries left)...`);
              setTimeout(() => {
                this.callGeminiAPI(prompt, retries - 1).then(resolve).catch(reject);
              }, 2000);
            } else {
              reject(new Error(`Gemini API error: ${error.message}`));
            }
          }
        });
      });

      req.on('error', (error) => {
        if (retries > 0) {
          console.log(`🔄 Retrying Gemini API call due to network error (${retries} retries left)...`);
          setTimeout(() => {
            this.callGeminiAPI(prompt, retries - 1).then(resolve).catch(reject);
          }, 2000);
        } else {
          reject(error);
        }
      });

      req.write(data);
      req.end();
    });
  }

  // Parse JSON response with error handling
  parseJSONResponse(text) {
    try {
      // Remove markdown code blocks if present
      let cleanText = text.replace(/```json\s*|\s*```/g, '').trim();
      
      // Try to parse as-is first
      try {
        return JSON.parse(cleanText);
      } catch (e) {
        // Try to fix common issues
        cleanText = cleanText
          .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
          .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
          .replace(/\n/g, ' ')     // Replace newlines with spaces
          .replace(/\s+/g, ' ');   // Normalize whitespace
        
        return JSON.parse(cleanText);
      }
    } catch (error) {
      console.log(`❌ JSON parsing error: ${error.message}`);
      console.log('Raw text:', text.substring(0, 200) + '...');
      return null;
    }
  }

  // Analyze tweets with Gemini AI to create accurate profile
  async analyzeUserWithAI(username, tweetData) {
    console.log(`🤖 Analyzing @${username} with Gemini AI...`);
    
    // Prepare tweet content for analysis
    const tweetTexts = tweetData.tweets.map(tweet => tweet.content).filter(content => content.length > 10);
    const retweets = tweetData.tweets.filter(tweet => tweet.isRetweet).map(tweet => tweet.originalTweet).filter(content => content);
    
    const prompt = `Analyze this Twitter user's recent activity and create an accurate profile:

USERNAME: @${username}

RECENT TWEETS (${tweetTexts.length} tweets):
${tweetTexts.slice(0, 15).map((tweet, i) => `${i+1}. ${tweet}`).join('\n')}

RECENT RETWEETS (${retweets.length} retweets):
${retweets.slice(0, 10).map((rt, i) => `${i+1}. ${rt}`).join('\n')}

Based on this ACTUAL Twitter activity, create a comprehensive profile. Return ONLY valid JSON:

{
  "ai_profile_overview": "A detailed, accurate overview based on their actual tweets and interests (2-3 sentences)",
  "ai_expertise_areas": ["Area 1", "Area 2", "Area 3", "Area 4", "Area 5"],
  "ai_key_achievements": ["Achievement 1", "Achievement 2", "Achievement 3"],
  "ai_interests": ["Interest 1", "Interest 2", "Interest 3", "Interest 4"],
  "ai_personality_traits": ["Trait 1", "Trait 2", "Trait 3"],
  "recent_activity_summary": "Summary of their recent Twitter activity and what it reveals about them",
  "timeline_entries": [
    {
      "type": "tweet",
      "action": "${username} tweeted",
      "content": "Actual recent tweet content",
      "time": "2 days ago"
    },
    {
      "type": "retweet", 
      "action": "${username} retweeted @someone",
      "content": "Actual retweeted content",
      "time": "4 days ago"
    },
    {
      "type": "tweet",
      "action": "${username} tweeted", 
      "content": "Another actual tweet",
      "time": "1 week ago"
    }
  ]
}

Make everything based on their ACTUAL tweets and retweets. Be specific and accurate.`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const analysis = this.parseJSONResponse(response);
      
      if (analysis) {
        console.log(`✅ Successfully analyzed @${username}`);
        return analysis;
      } else {
        throw new Error('Failed to parse AI response');
      }
    } catch (error) {
      console.log(`❌ Error analyzing @${username}: ${error.message}`);
      return null;
    }
  }

  // Update user profile in database
  async updateUserProfile(username, analysis) {
    try {
      console.log(`💾 Updating database for @${username}...`);
      
      const { error } = await supabase
        .from('people')
        .update({
          ai_profile_overview: analysis.ai_profile_overview,
          ai_expertise_areas: analysis.ai_expertise_areas,
          ai_key_achievements: analysis.ai_key_achievements,
          ai_interests: analysis.ai_interests,
          ai_personality_traits: analysis.ai_personality_traits,
          // Store timeline and activity data as JSON
          ai_recent_activity: analysis.recent_activity_summary,
          ai_timeline_data: analysis.timeline_entries,
          last_updated: new Date().toISOString()
        })
        .eq('username', username);

      if (error) {
        console.log(`❌ Database error for @${username}: ${error.message}`);
        return false;
      }

      console.log(`✅ Updated profile for @${username}`);
      return true;
    } catch (error) {
      console.log(`❌ Error updating @${username}: ${error.message}`);
      return false;
    }
  }

  // Main function to collect and analyze a user
  async processUser(username) {
    console.log(`\n🚀 Processing @${username}...`);
    
    try {
      // Step 1: Collect recent tweets
      const tweetData = await this.collectUserTweets(username);
      
      if (tweetData.error || tweetData.tweets.length === 0) {
        console.log(`⚠️ No tweets found for @${username}, skipping...`);
        return false;
      }

      // Step 2: Analyze with AI
      const analysis = await this.analyzeUserWithAI(username, tweetData);
      
      if (!analysis) {
        console.log(`⚠️ AI analysis failed for @${username}, skipping...`);
        return false;
      }

      // Step 3: Update database
      const updated = await this.updateUserProfile(username, analysis);
      
      if (updated) {
        console.log(`🎉 Successfully processed @${username}`);
        return true;
      } else {
        console.log(`⚠️ Database update failed for @${username}`);
        return false;
      }

    } catch (error) {
      console.log(`❌ Error processing @${username}: ${error.message}`);
      return false;
    }
  }

  // Process multiple users
  async processMultipleUsers(usernames, delay = 5000) {
    console.log(`🎯 Processing ${usernames.length} users with live Twitter data...`);
    
    const results = {
      successful: [],
      failed: []
    };

    for (let i = 0; i < usernames.length; i++) {
      const username = usernames[i];
      console.log(`\n📊 Progress: ${i + 1}/${usernames.length}`);
      
      const success = await this.processUser(username);
      
      if (success) {
        results.successful.push(username);
      } else {
        results.failed.push(username);
      }

      // Delay between users to avoid rate limits
      if (i < usernames.length - 1) {
        console.log(`⏳ Waiting ${delay/1000}s before next user...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.log(`\n🎉 Processing complete!`);
    console.log(`✅ Successful: ${results.successful.length} users`);
    console.log(`❌ Failed: ${results.failed.length} users`);
    
    if (results.successful.length > 0) {
      console.log(`✅ Successfully processed: ${results.successful.join(', ')}`);
    }
    
    if (results.failed.length > 0) {
      console.log(`❌ Failed to process: ${results.failed.join(', ')}`);
    }

    return results;
  }
}

// Main execution
async function main() {
  try {
    const profiler = new LiveTwitterProfiler();
    
    // Key users to update with live data
    const targetUsers = [
      'FangSystems',
      'cneuralnetwork', 
      'deedydas',
      'chesterzelaya',
      'QVHenkel',
      'n0w00j',
      'robin7331',
      'teraytech',
      'ahmedshubber25'
    ];

    console.log('�� Starting Live Twitter Profile Update System');
    console.log('📡 This will collect real, current tweets and create accurate profiles');
    
    const results = await profiler.processMultipleUsers(targetUsers, 6000); // 6 second delay
    
    console.log('\n🏁 Live profiling complete!');
    console.log('🎯 User profiles are now based on actual, current Twitter activity');
    
  } catch (error) {
    console.log('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { LiveTwitterProfiler };
