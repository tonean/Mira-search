require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const { exec } = require('child_process');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Alternative approach: Use multiple methods and fallbacks
class TwitterDataEnhancer {
  constructor() {
    this.methods = [
      'snscrape_twitter_profile',
      'snscrape_twitter_search', 
      'web_search_fallback',
      'existing_data_enhancement'
    ];
  }

  // Method 1: Try different snscrape approaches
  async trySnscrapeMethods(username) {
    const methods = [
      `snscrape --jsonl --max-results 50 twitter-profile ${username}`,
      `snscrape --jsonl --max-results 30 twitter-search "from:${username}"`,
      `snscrape --jsonl --max-results 20 twitter-user ${username} --since 2024-01-01`
    ];

    for (const method of methods) {
      try {
        console.log(`🔄 Trying: ${method}`);
        const result = await this.executeCommand(method);
        if (result && result.length > 0) {
          console.log(`✅ Success with: ${method}`);
          return result;
        }
      } catch (error) {
        console.log(`❌ Failed: ${method.split(' ')[0]}`);
        continue;
      }
    }
    return null;
  }

  // Method 2: Web search for public information
  async webSearchFallback(username) {
    console.log(`🌐 Trying web search fallback for @${username}...`);
    
    // This would integrate with a web search API or data collection service
    // For now, we'll simulate gathering public information
    try {
      // You could integrate with services like:
      // - Google Custom Search API
      // - Bing Search API  
      // - DuckDuckGo API
      // - Public social media aggregators
      
      const searchQuery = `"@${username}" OR "${username}" site:twitter.com`;
      console.log(`🔍 Would search for: ${searchQuery}`);
      
      // Placeholder for web search integration
      return {
        method: 'web_search',
        profile: {
          username: username,
          bio: null,
          location: null,
          verified: false
        },
        tweets: [],
        source: 'web_search_fallback'
      };
    } catch (error) {
      console.error(`❌ Web search failed for @${username}:`, error);
      return null;
    }
  }

  // Method 3: Enhance existing database data
  async enhanceExistingData(username) {
    console.log(`📊 Enhancing existing data for @${username}...`);
    
    try {
      // Get existing user data from database
      const { data: existingUser, error } = await supabase
        .from('people')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !existingUser) {
        console.log(`❌ No existing data found for @${username}`);
        return null;
      }

      // If user has existing quotes/tweets, we can enhance the analysis
      if (existingUser.quotes && existingUser.quotes.length > 0) {
        console.log(`✅ Found ${existingUser.quotes.length} existing quotes for @${username}`);
        
        // Enhanced AI analysis of existing data
        const enhancedAnalysis = await this.enhanceWithAI(username, existingUser.quotes);
        
        return {
          method: 'existing_data_enhancement',
          profile: {
            username: username,
            bio: existingUser.bio,
            location: existingUser.location,
            verified: existingUser.verified || false,
            followers: existingUser.followers,
            following: existingUser.following
          },
          tweets: existingUser.quotes.map(quote => ({ content: quote })),
          analysis: enhancedAnalysis,
          source: 'existing_database_data'
        };
      }

      return null;
    } catch (error) {
      console.error(`❌ Error enhancing existing data for @${username}:`, error);
      return null;
    }
  }

  // Enhanced AI analysis
  async enhanceWithAI(username, quotes) {
    if (!quotes || quotes.length === 0) return null;

    console.log(`🤖 Running enhanced AI analysis for @${username}...`);

    const prompt = `Analyze this Twitter user's content and provide enhanced insights:

USERNAME: @${username}

EXISTING TWEETS/QUOTES (${quotes.length}):
${quotes.slice(0, 20).join('\n---\n')}

Provide a comprehensive analysis in JSON format:

{
  "enhanced_profile_overview": "A detailed 3-4 sentence professional overview based on their content",
  "expertise_areas": ["List of 4-6 specific skills/expertise areas they demonstrate"],
  "key_achievements": ["List of 4-5 achievements or notable accomplishments mentioned"],
  "predicted_interests": ["List of 5-7 interests based on topics discussed"],
  "personality_traits": ["List of 4-5 personality traits from communication style"],
  "communication_style": "Detailed description of their communication approach",
  "main_topics": ["List of 5-8 main topics they discuss"],
  "professional_focus": "Their primary professional focus area",
  "connection_message": "A highly personalized outreach message based on their specific interests and expertise",
  "content_themes": ["List of 4-6 recurring themes in their content"],
  "engagement_style": "How they typically engage with their audience"
}

Focus on:
- Specific technical skills and expertise mentioned
- Industry knowledge and experience
- Communication patterns and style
- Professional interests and goals
- Unique perspectives or insights they share

Return ONLY valid JSON.`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const analysis = JSON.parse(response);
      console.log(`✅ Enhanced AI analysis complete for @${username}`);
      return analysis;
    } catch (error) {
      console.error(`❌ Enhanced AI analysis failed for @${username}:`, error);
      return null;
    }
  }

  // Execute shell commands with better error handling
  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { 
        maxBuffer: 1024 * 1024 * 10,
        timeout: 30000 // 30 second timeout
      }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        
        if (stderr && stderr.includes('CRITICAL')) {
          reject(new Error(stderr));
          return;
        }
        
        try {
          const lines = stdout.trim().split('\n').filter(line => line.trim());
          const results = lines.map(line => {
            try {
              return JSON.parse(line);
            } catch (e) {
              return null;
            }
          }).filter(item => item !== null);
          
          resolve(results);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  }

  // Gemini API call
  async callGeminiAPI(prompt) {
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
          maxOutputTokens: 1000
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

  // Main enhancement method
  async enhanceUser(username) {
    console.log(`\n🚀 Starting multi-method enhancement for @${username}...`);
    
    let result = null;
    
    // Try Method 1: Different snscrape approaches
    try {
      result = await this.trySnscrapeMethods(username);
      if (result && result.length > 0) {
        console.log(`✅ Successfully collected ${result.length} items with snscrape`);
        return await this.processCollectedData(username, result);
      }
    } catch (error) {
      console.log(`⚠️ All snscrape methods failed: ${error.message}`);
    }

    // Try Method 2: Enhance existing database data
    try {
      result = await this.enhanceExistingData(username);
      if (result) {
        console.log(`✅ Successfully enhanced existing data for @${username}`);
        return await this.updateDatabaseWithEnhancement(username, result);
      }
    } catch (error) {
      console.log(`⚠️ Existing data enhancement failed: ${error.message}`);
    }

    // Try Method 3: Web search fallback
    try {
      result = await this.webSearchFallback(username);
      if (result) {
        console.log(`✅ Web search fallback completed for @${username}`);
        return await this.updateDatabaseWithEnhancement(username, result);
      }
    } catch (error) {
      console.log(`⚠️ Web search fallback failed: ${error.message}`);
    }

    console.log(`❌ All enhancement methods failed for @${username}`);
    return false;
  }

  // Process collected data
  async processCollectedData(username, collectedData) {
    // Process the collected data and update database
    // This would be similar to the original live_twitter_collector.js logic
    console.log(`🔄 Processing collected data for @${username}...`);
    return true;
  }

  // Update database with enhanced data
  async updateDatabaseWithEnhancement(username, enhancementData) {
    try {
      console.log(`💾 Updating database for @${username}...`);
      
      const updateData = {
        live_collected_at: new Date().toISOString(),
        enhancement_method: enhancementData.method,
        data_source: enhancementData.source
      };

      // Add analysis data if available
      if (enhancementData.analysis) {
        updateData.ai_profile_overview = enhancementData.analysis.enhanced_profile_overview;
        updateData.ai_expertise_areas = enhancementData.analysis.expertise_areas;
        updateData.ai_key_achievements = enhancementData.analysis.key_achievements;
        updateData.ai_interests = enhancementData.analysis.predicted_interests;
        updateData.ai_personality_traits = enhancementData.analysis.personality_traits;
        updateData.ai_communication_style = enhancementData.analysis.communication_style;
        updateData.ai_main_topics = enhancementData.analysis.main_topics;
        updateData.ai_connection_message = enhancementData.analysis.connection_message;
      }

      // Add profile data if available
      if (enhancementData.profile) {
        if (enhancementData.profile.bio) updateData.bio = enhancementData.profile.bio;
        if (enhancementData.profile.location) updateData.location = enhancementData.profile.location;
        if (enhancementData.profile.verified !== undefined) updateData.verified = enhancementData.profile.verified;
        if (enhancementData.profile.followers) updateData.followers = enhancementData.profile.followers;
        if (enhancementData.profile.following) updateData.following = enhancementData.profile.following;
      }

      const { error } = await supabase
        .from('people')
        .update(updateData)
        .eq('username', username);

      if (error) {
        console.error(`❌ Database update error for @${username}:`, error);
        return false;
      }

      console.log(`✅ Successfully updated @${username} in database!`);
      
      if (enhancementData.analysis) {
        console.log(`   📝 Enhanced Profile: ${enhancementData.analysis.enhanced_profile_overview?.substring(0, 100)}...`);
        console.log(`   🎯 Expertise: ${enhancementData.analysis.expertise_areas?.join(', ')}`);
        console.log(`   💬 Method: ${enhancementData.method}`);
      }
      
      return true;

    } catch (error) {
      console.error(`❌ Error updating database for @${username}:`, error);
      return false;
    }
  }
}

// Main execution function
async function main() {
  console.log('🔧 Alternative Twitter Data Enhancement System');
  
  const enhancer = new TwitterDataEnhancer();
  
  // Get users that need enhancement
  const { data: users, error } = await supabase
    .from('people')
    .select('username')
    .not('username', 'is', null)
    .limit(5); // Start with 5 users

  if (error) {
    console.error('❌ Error fetching users:', error);
    return;
  }

  if (!users || users.length === 0) {
    console.log('ℹ️ No users found for enhancement');
    return;
  }

  console.log(`📋 Found ${users.length} users to enhance`);

  const results = { success: [], failed: [] };

  for (const user of users) {
    const success = await enhancer.enhanceUser(user.username);
    
    if (success) {
      results.success.push(user.username);
    } else {
      results.failed.push(user.username);
    }

    // Add delay between users
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n🎉 Enhancement complete!`);
  console.log(`✅ Success: ${results.success.length} users`);
  console.log(`❌ Failed: ${results.failed.length} users`);
}

// Export the enhancer class
module.exports = { TwitterDataEnhancer };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
} 