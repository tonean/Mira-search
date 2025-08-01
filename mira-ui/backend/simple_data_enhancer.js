require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Simple data enhancer that works with existing database structure
class SimpleDataEnhancer {
  // Call Gemini API with better JSON parsing
  async callGeminiAPI(prompt) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.5,
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

  // Parse JSON with fallback handling
  parseJSONResponse(text) {
    try {
      // Remove markdown code blocks if present
      let cleanText = text.replace(/```json\s*/, '').replace(/```\s*$/, '');
      
      // Try to parse as-is first
      return JSON.parse(cleanText);
    } catch (error) {
      try {
        // Try to extract JSON from the response
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No JSON found in response');
      } catch (error2) {
        console.error('JSON parsing failed:', error2.message);
        console.error('Raw response:', text.substring(0, 200));
        return null;
      }
    }
  }

  // Enhanced AI analysis of existing data
  async enhanceUserProfile(username, existingQuotes) {
    if (!existingQuotes || existingQuotes.length === 0) {
      console.log(`⚠️ No existing quotes for @${username}`);
      return null;
    }

    console.log(`🤖 Enhancing profile for @${username} with ${existingQuotes.length} quotes...`);

    const prompt = `Analyze this Twitter user's content and create an enhanced professional profile.

USERNAME: @${username}

TWEETS/QUOTES (${existingQuotes.length}):
${existingQuotes.slice(0, 15).join('\n---\n')}

Create a JSON response with enhanced profile data:

{
  "profile_overview": "A professional 2-3 sentence overview based on their actual content",
  "expertise_areas": ["4-5 specific skills they demonstrate"],
  "key_achievements": ["3-4 achievements mentioned or implied"],
  "interests": ["5-6 interests from their topics"],
  "personality_traits": ["4 traits from communication style"],
  "connection_message": "Personalized message for connecting with them"
}

Focus on:
- Technical skills and expertise they mention
- Industries and fields they discuss
- Projects or work they reference  
- Communication style and tone
- Professional interests

Return ONLY the JSON object, no markdown formatting.`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const analysis = this.parseJSONResponse(response);
      
      if (analysis) {
        console.log(`✅ Enhanced analysis complete for @${username}`);
        return analysis;
      } else {
        console.log(`❌ Failed to parse analysis for @${username}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ AI analysis failed for @${username}:`, error.message);
      return null;
    }
  }

  // Update user in database with enhanced data
  async updateUserProfile(username, enhancement) {
    if (!enhancement) {
      console.log(`⚠️ No enhancement data for @${username}`);
      return false;
    }

    try {
      console.log(`💾 Updating @${username} with enhanced profile...`);

      const updateData = {};

      // Only update if we have good data
      if (enhancement.profile_overview && enhancement.profile_overview.length > 50) {
        updateData.ai_profile_overview = enhancement.profile_overview;
      }

      if (enhancement.expertise_areas && enhancement.expertise_areas.length > 0) {
        updateData.ai_expertise_areas = enhancement.expertise_areas;
      }

      if (enhancement.key_achievements && enhancement.key_achievements.length > 0) {
        updateData.ai_key_achievements = enhancement.key_achievements;
      }

      if (enhancement.interests && enhancement.interests.length > 0) {
        updateData.ai_interests = enhancement.interests;
      }

      if (enhancement.personality_traits && enhancement.personality_traits.length > 0) {
        updateData.ai_personality_traits = enhancement.personality_traits;
      }

      if (enhancement.connection_message && enhancement.connection_message.length > 30) {
        updateData.ai_connection_message = enhancement.connection_message;
      }

      // Only update if we have meaningful data
      if (Object.keys(updateData).length === 0) {
        console.log(`⚠️ No meaningful enhancement data for @${username}`);
        return false;
      }

      const { error } = await supabase
        .from('people')
        .update(updateData)
        .eq('username', username);

      if (error) {
        console.error(`❌ Database error for @${username}:`, error);
        return false;
      }

      console.log(`✅ Successfully enhanced @${username}!`);
      console.log(`   📝 Profile: ${enhancement.profile_overview?.substring(0, 80)}...`);
      console.log(`   🎯 Expertise: ${enhancement.expertise_areas?.slice(0, 3).join(', ')}`);
      
      return true;

    } catch (error) {
      console.error(`❌ Update failed for @${username}:`, error);
      return false;
    }
  }

  // Main enhancement process
  async enhanceUser(username) {
    try {
      console.log(`\n🚀 Enhancing @${username}...`);

      // Get existing user data
      const { data: user, error } = await supabase
        .from('people')
        .select('quotes, ai_profile_overview')
        .eq('username', username)
        .single();

      if (error || !user) {
        console.log(`❌ User @${username} not found in database`);
        return false;
      }

      // Skip if already has a good profile
      if (user.ai_profile_overview && 
          user.ai_profile_overview.length > 100 && 
          !user.ai_profile_overview.includes('professional with expertise')) {
        console.log(`✅ @${username} already has enhanced profile, skipping...`);
        return true;
      }

      // Check if user has quotes to work with
      if (!user.quotes || user.quotes.length === 0) {
        console.log(`⚠️ @${username} has no quotes to analyze`);
        return false;
      }

      // Enhance the profile
      const enhancement = await this.enhanceUserProfile(username, user.quotes);
      
      if (!enhancement) {
        console.log(`❌ Enhancement failed for @${username}`);
        return false;
      }

      // Update database
      const success = await this.updateUserProfile(username, enhancement);
      return success;

    } catch (error) {
      console.error(`❌ Enhancement error for @${username}:`, error);
      return false;
    }
  }
}

// Main execution
async function main() {
  console.log('🔧 Simple Twitter Data Enhancer');
  console.log('📊 Enhancing existing user profiles with better AI analysis...\n');

  const enhancer = new SimpleDataEnhancer();

  // Get users that need enhancement (have quotes but generic profiles)
  const { data: users, error } = await supabase
    .from('people')
    .select('username, ai_profile_overview')
    .not('username', 'is', null)
    .not('quotes', 'is', null)
    .limit(10);

  if (error) {
    console.error('❌ Error fetching users:', error);
    return;
  }

  if (!users || users.length === 0) {
    console.log('ℹ️ No users found for enhancement');
    return;
  }

  // Filter users that need enhancement
  const usersToEnhance = users.filter(user => 
    !user.ai_profile_overview || 
    user.ai_profile_overview.length < 100 ||
    user.ai_profile_overview.includes('professional with expertise')
  );

  console.log(`📋 Found ${usersToEnhance.length} users that need enhancement`);

  const results = { success: [], failed: [] };

  for (const user of usersToEnhance) {
    const success = await enhancer.enhanceUser(user.username);
    
    if (success) {
      results.success.push(user.username);
    } else {
      results.failed.push(user.username);
    }

    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n🎉 Enhancement complete!`);
  console.log(`✅ Successfully enhanced: ${results.success.length} users`);
  console.log(`❌ Failed to enhance: ${results.failed.length} users`);

  if (results.success.length > 0) {
    console.log(`✅ Enhanced: ${results.success.join(', ')}`);
  }

  if (results.failed.length > 0) {
    console.log(`❌ Failed: ${results.failed.join(', ')}`);
  }
}

// Export for use in other scripts
module.exports = { SimpleDataEnhancer };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
} 