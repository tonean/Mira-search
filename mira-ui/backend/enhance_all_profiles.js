require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class ProfileEnhancer {
  constructor() {
    this.successCount = 0;
    this.failureCount = 0;
    this.processed = [];
  }

  // Enhanced Gemini API call with retry logic
  async callGeminiAPI(prompt, retries = 2) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.makeGeminiRequest(prompt);
        return response;
      } catch (error) {
        console.log(`⚠️ Attempt ${attempt} failed: ${error.message}`);
        if (attempt === retries) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  async makeGeminiRequest(prompt) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 600
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
            reject(new Error(`JSON parse error: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request error: ${error.message}`));
      });

      req.write(data);
      req.end();
    });
  }

  // Robust JSON parsing
  parseEnhancedJSON(text) {
    try {
      // Clean the response
      let cleanText = text.trim();
      
      // Remove markdown code blocks
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      // Try direct parsing
      try {
        return JSON.parse(cleanText);
      } catch (e) {
        // Extract JSON object
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No valid JSON found');
      }
    } catch (error) {
      console.log(`❌ JSON parsing failed: ${error.message}`);
      console.log(`Raw response: ${text.substring(0, 200)}...`);
      return null;
    }
  }

  // Create enhanced profile based on actual tweets
  async enhanceUserFromTweets(username, tweets) {
    if (!tweets || tweets.length === 0) {
      console.log(`⚠️ No tweets for @${username}`);
      return null;
    }

    console.log(`🤖 Analyzing ${tweets.length} tweets for @${username}...`);

    // Create a focused prompt based on the actual tweet content
    const tweetContent = tweets.join('\n---\n');
    
    const prompt = `Analyze these Twitter posts and create a professional profile:

USERNAME: @${username}

ACTUAL TWEETS:
${tweetContent}

Based on these SPECIFIC tweets, create a JSON profile:

{
  "profile_overview": "2-3 sentences describing their expertise based on what they actually tweet about",
  "expertise_areas": ["3-5 specific technical skills they demonstrate in these tweets"],
  "key_achievements": ["3-4 accomplishments or projects mentioned in these tweets"],
  "interests": ["4-6 interests based on topics in these tweets"],
  "personality_traits": ["3-4 traits from their communication style"],
  "connection_message": "Personalized message referencing their actual work/interests"
}

IMPORTANT:
- Base everything on the actual tweet content above
- Use specific technical terms they mention
- Reference their actual projects/work
- Don't use generic terms like "social media" unless they actually discuss social media
- Focus on technical expertise they demonstrate

Return only valid JSON, no markdown.`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const analysis = this.parseEnhancedJSON(response);
      
      if (analysis && analysis.profile_overview) {
        console.log(`✅ Enhanced profile created for @${username}`);
        return analysis;
      } else {
        console.log(`❌ Invalid analysis for @${username}`);
        return null;
      }
    } catch (error) {
      console.log(`❌ AI analysis failed for @${username}: ${error.message}`);
      return null;
    }
  }

  // Update database with enhanced profile
  async updateUserProfile(username, enhancement) {
    if (!enhancement) return false;

    try {
      const updateData = {};

      if (enhancement.profile_overview && enhancement.profile_overview.length > 30) {
        updateData.ai_profile_overview = enhancement.profile_overview;
      }

      if (enhancement.expertise_areas && Array.isArray(enhancement.expertise_areas)) {
        updateData.ai_expertise_areas = enhancement.expertise_areas;
      }

      if (enhancement.key_achievements && Array.isArray(enhancement.key_achievements)) {
        updateData.ai_key_achievements = enhancement.key_achievements;
      }

      if (enhancement.interests && Array.isArray(enhancement.interests)) {
        updateData.ai_interests = enhancement.interests;
      }

      if (enhancement.personality_traits && Array.isArray(enhancement.personality_traits)) {
        updateData.ai_personality_traits = enhancement.personality_traits;
      }

      if (enhancement.connection_message && enhancement.connection_message.length > 20) {
        updateData.ai_connection_message = enhancement.connection_message;
      }

      if (Object.keys(updateData).length === 0) {
        console.log(`⚠️ No valid data to update for @${username}`);
        return false;
      }

      const { error } = await supabase
        .from('people')
        .update(updateData)
        .eq('username', username);

      if (error) {
        console.log(`❌ Database error for @${username}: ${error.message}`);
        return false;
      }

      console.log(`✅ Updated @${username} in database`);
      console.log(`   📝 Profile: ${enhancement.profile_overview.substring(0, 80)}...`);
      console.log(`   🎯 Expertise: ${enhancement.expertise_areas?.slice(0, 3).join(', ')}`);
      
      return true;

    } catch (error) {
      console.log(`❌ Update failed for @${username}: ${error.message}`);
      return false;
    }
  }

  // Process a single user
  async processUser(user) {
    const { username, quotes } = user;
    
    console.log(`\n🚀 Processing @${username}...`);
    
    if (!quotes || quotes.length === 0) {
      console.log(`⚠️ @${username} has no tweets to analyze`);
      this.processed.push({ username, status: 'no_tweets' });
      return false;
    }

    try {
      // Create enhancement based on actual tweets
      const enhancement = await this.enhanceUserFromTweets(username, quotes);
      
      if (!enhancement) {
        console.log(`❌ Failed to enhance @${username}`);
        this.failureCount++;
        this.processed.push({ username, status: 'enhancement_failed' });
        return false;
      }

      // Update database
      const success = await this.updateUserProfile(username, enhancement);
      
      if (success) {
        this.successCount++;
        this.processed.push({ username, status: 'success', enhancement });
        return true;
      } else {
        this.failureCount++;
        this.processed.push({ username, status: 'update_failed' });
        return false;
      }

    } catch (error) {
      console.log(`❌ Error processing @${username}: ${error.message}`);
      this.failureCount++;
      this.processed.push({ username, status: 'error', error: error.message });
      return false;
    }
  }

  // Main enhancement process
  async enhanceAllProfiles() {
    console.log('🚀 Starting comprehensive profile enhancement...');
    console.log('📊 Fetching users with Twitter data...\n');

    // Get users with quotes
    const { data: users, error } = await supabase
      .from('people')
      .select('username, quotes')
      .not('username', 'is', null)
      .not('quotes', 'is', null)
      .limit(20);

    if (error) {
      console.log('❌ Error fetching users:', error);
      return;
    }

    console.log(`📋 Found ${users.length} users with Twitter content`);

    // Process users one by one
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`\n📊 Progress: ${i + 1}/${users.length}`);
      
      await this.processUser(user);
      
      // Add delay between users to avoid rate limits
      if (i < users.length - 1) {
        console.log('⏳ Waiting 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Final summary
    console.log('\n🎉 Enhancement complete!');
    console.log(`✅ Successfully enhanced: ${this.successCount} users`);
    console.log(`❌ Failed to enhance: ${this.failureCount} users`);

    const successful = this.processed.filter(p => p.status === 'success');
    if (successful.length > 0) {
      console.log('\n✅ Successfully enhanced users:');
      successful.forEach(p => {
        console.log(`   @${p.username}: ${p.enhancement?.expertise_areas?.slice(0, 2).join(', ') || 'Enhanced'}`);
      });
    }

    const failed = this.processed.filter(p => p.status !== 'success');
    if (failed.length > 0) {
      console.log('\n❌ Issues encountered:');
      failed.forEach(p => {
        console.log(`   @${p.username}: ${p.status}`);
      });
    }

    console.log('\n🎯 All enhanced profiles are now available on the frontend!');
    console.log('   Search for users to see their enhanced profiles based on actual tweets.');
  }
}

// Main execution
async function main() {
  const enhancer = new ProfileEnhancer();
  await enhancer.enhanceAllProfiles();
}

// Export for use in other scripts
module.exports = { ProfileEnhancer };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
} 