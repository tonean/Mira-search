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
        maxOutputTokens: 800
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

// Function to analyze user's social media behavior and generate insights
async function analyzeUserBehavior(userData) {
  // Check if we have comprehensive Twitter data
  const comprehensiveData = userData.comprehensive_twitter_data;
  const quotes = userData.quotes || [];
  const aiProfile = userData.ai_profile || {};
  
  if (comprehensiveData) {
    // Use comprehensive data if available
    const tweets = comprehensiveData.tweets || [];
    const retweets = comprehensiveData.retweets || [];
    const likes = comprehensiveData.likes || [];
    
    // Analyze posting frequency
    const totalPosts = tweets.length + retweets.length;
    const avgLikes = tweets.length > 0 ? tweets.reduce((sum, t) => sum + (t.favorite_count || 0), 0) / tweets.length : 0;
    const avgRetweets = tweets.length > 0 ? tweets.reduce((sum, t) => sum + (t.retweet_count || 0), 0) / tweets.length : 0;
    
    // Analyze content themes
    const hashtags = tweets.flatMap(t => t.hashtags || []);
    const hashtagCounts = {};
    hashtags.forEach(tag => {
      hashtagCounts[tag.toLowerCase()] = (hashtagCounts[tag.toLowerCase()] || 0) + 1;
    });
    
    const topHashtags = Object.entries(hashtagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
    
    // Analyze engagement patterns
    const engagementRate = comprehensiveData.followers_count > 0 ? (avgLikes + avgRetweets) / comprehensiveData.followers_count : 0;
    
    return {
      totalPosts,
      avgLikes: Math.round(avgLikes),
      avgRetweets: Math.round(avgRetweets),
      engagementRate: (engagementRate * 100).toFixed(2),
      topHashtags,
      isActive: totalPosts > 50,
      isEngaged: engagementRate > 0.01,
      isInfluential: avgLikes > 100 || avgRetweets > 20
    };
  } else {
    // Fallback to basic analysis using available data
    const totalPosts = quotes.length;
    const hasContent = quotes.length > 0;
    const hasAIProfile = aiProfile && Object.keys(aiProfile).length > 0;
    
    return {
      totalPosts,
      avgLikes: 0,
      avgRetweets: 0,
      engagementRate: '0.00',
      topHashtags: [],
      isActive: hasContent,
      isEngaged: hasContent,
      isInfluential: false,
      hasAIProfile
    };
  }
}

// Function to generate highly personalized overview
async function generatePersonalizedOverview(username, userData, behaviorAnalysis) {
  const prompt = `
Generate a highly personalized and specific professional overview for this Twitter user based on their complete social media presence and behavior analysis.

USER DATA:
Name: ${userData.name}
Username: @${username}
Description: ${userData.description || 'No description available'}
Location: ${userData.location || 'Not specified'}
Followers: ${userData.followers_count}
Following: ${userData.following_count}
Tweets Count: ${userData.tweets_count}
Verified: ${userData.verified ? 'Yes' : 'No'}

BEHAVIOR ANALYSIS:
Total Posts: ${behaviorAnalysis.totalPosts}
Average Likes: ${behaviorAnalysis.avgLikes}
Average Retweets: ${behaviorAnalysis.avgRetweets}
Engagement Rate: ${behaviorAnalysis.engagementRate}%
Top Hashtags: ${behaviorAnalysis.topHashtags.join(', ')}
Peak Activity Hour: ${behaviorAnalysis.peakHour}
Is Highly Active: ${behaviorAnalysis.isActive}
Is Highly Engaged: ${behaviorAnalysis.isEngaged}
Is Influential: ${behaviorAnalysis.isInfluential}

RECENT TWEETS (${userData.tweets.length} total):
${userData.tweets.slice(0, 15).map(t => `- "${t.text}" (${t.retweet_count} RTs, ${t.favorite_count} likes)`).join('\n')}

RECENT RETWEETS (${userData.retweets.length} total):
${userData.retweets.slice(0, 10).map(t => `- "${t.text}"`).join('\n')}

TASK: Create a highly personalized 2-3 sentence professional overview that:
1. Uses their actual name and specific details from their profile
2. Mentions their follower count and engagement level
3. References their location if available
4. Highlights their verification status if verified
5. Mentions their posting activity level and engagement patterns
6. References their top hashtags/interests if relevant
7. Sounds natural and conversational, not generic

Make it specific to their actual behavior and content. Avoid generic statements like "professional in their field" unless absolutely necessary.

OUTPUT: Just the overview text, no additional formatting.
`;

  try {
    const response = await callGeminiAPI(prompt);
    return response;
  } catch (error) {
    console.error(`Error generating personalized overview for ${username}:`, error);
    return generateFallbackOverview(userData, behaviorAnalysis);
  }
}

// Function to generate fallback overview
function generateFallbackOverview(userData, behaviorAnalysis) {
  const comprehensiveData = userData.comprehensive_twitter_data;
  const aiProfile = userData.ai_profile || {};
  
  let overview = `${userData.name}`;
  
  // Check if we have comprehensive data
  if (comprehensiveData) {
    if (comprehensiveData.verified) {
      overview += ` is a verified professional`;
    } else {
      overview += ` is a professional`;
    }
    
    if (comprehensiveData.location) {
      overview += ` based in ${comprehensiveData.location}`;
    }
    
    if (comprehensiveData.followers_count > 10000) {
      overview += ` with a substantial following of ${(comprehensiveData.followers_count/1000).toFixed(1)}K followers`;
    } else if (comprehensiveData.followers_count > 1000) {
      overview += ` with ${(comprehensiveData.followers_count/1000).toFixed(1)}K followers`;
    }
    
    if (comprehensiveData.description) {
      overview += `. ${comprehensiveData.description.substring(0, 100)}${comprehensiveData.description.length > 100 ? '...' : ''}`;
    }
  } else {
    // Use basic data
    overview += ` is a professional`;
    
    if (userData.type) {
      overview += ` in the ${userData.type} category`;
    }
    
    if (behaviorAnalysis.isActive) {
      overview += ` with an active social media presence`;
    }
    
    // Use AI profile data if available
    if (aiProfile.overview) {
      overview += `. ${aiProfile.overview.substring(0, 100)}${aiProfile.overview.length > 100 ? '...' : ''}`;
    }
  }
  
  overview += '.';
  return overview;
}

// Function to generate personalized match reasons
async function generatePersonalizedMatchReasons(username, userData, behaviorAnalysis) {
  const prompt = `
Generate 3 highly personalized reasons why this Twitter user would be a good professional match, based on their social media presence and behavior.

USER DATA:
Name: ${userData.name}
Username: @${username}
Followers: ${userData.followers_count}
Following: ${userData.following_count}
Tweets Count: ${userData.tweets_count}
Verified: ${userData.verified ? 'Yes' : 'No'}
Location: ${userData.location || 'Not specified'}

BEHAVIOR ANALYSIS:
Total Posts: ${behaviorAnalysis.totalPosts}
Average Likes: ${behaviorAnalysis.avgLikes}
Average Retweets: ${behaviorAnalysis.avgRetweets}
Engagement Rate: ${behaviorAnalysis.engagementRate}%
Top Hashtags: ${behaviorAnalysis.topHashtags.join(', ')}
Is Highly Active: ${behaviorAnalysis.isActive}
Is Highly Engaged: ${behaviorAnalysis.isEngaged}
Is Influential: ${behaviorAnalysis.isInfluential}

RECENT TWEETS:
${userData.tweets.slice(0, 10).map(t => `- "${t.text}"`).join('\n')}

TASK: Generate 3 specific reasons why this person would be a good professional match. Each reason should:
1. Be based on their actual behavior and data
2. Include specific numbers (follower count, engagement rate, etc.)
3. Explain why this makes them a good match
4. Be different from each other (network size, activity level, expertise, etc.)

OUTPUT FORMAT (JSON only):
{
  "reasons": [
    {
      "text": "Reason title with specific data",
      "description": "Detailed explanation of why this makes them a good match"
    },
    {
      "text": "Reason title with specific data", 
      "description": "Detailed explanation of why this makes them a good match"
    },
    {
      "text": "Reason title with specific data",
      "description": "Detailed explanation of why this makes them a good match"
    }
  ]
}

Make each reason specific and data-driven. Avoid generic statements.
`;

  try {
    const response = await callGeminiAPI(prompt);
    const parsed = JSON.parse(response);
    return parsed.reasons || generateFallbackMatchReasons(userData, behaviorAnalysis);
  } catch (error) {
    console.error(`Error generating match reasons for ${username}:`, error);
    return generateFallbackMatchReasons(userData, behaviorAnalysis);
  }
}

// Function to generate fallback match reasons
function generateFallbackMatchReasons(userData, behaviorAnalysis) {
  const reasons = [];
  const comprehensiveData = userData.comprehensive_twitter_data;
  const aiProfile = userData.ai_profile || {};
  
  // Reason 1: Network size (if comprehensive data available)
  if (comprehensiveData && comprehensiveData.followers_count > 1000) {
    reasons.push({
      text: `Strong Network (${(comprehensiveData.followers_count/1000).toFixed(1)}K followers)`,
      description: `Large professional network indicates influence and credibility in their field`
    });
  } else if (comprehensiveData && comprehensiveData.followers_count > 100) {
    reasons.push({
      text: `Growing Network (${comprehensiveData.followers_count} followers)`,
      description: `Active community member with expanding professional connections`
    });
  }
  
  // Reason 2: Activity level
  if (behaviorAnalysis.isActive) {
    reasons.push({
      text: `Active Social Media Presence`,
      description: `Consistent online activity shows ongoing engagement and thought leadership`
    });
  }
  
  // Reason 3: Content quality
  if (userData.quotes && userData.quotes.length > 0) {
    reasons.push({
      text: `Content Creator`,
      description: `Shares valuable insights and contributes to professional discussions`
    });
  }
  
  // Reason 4: Verification (if comprehensive data available)
  if (comprehensiveData && comprehensiveData.verified) {
    reasons.push({
      text: `Verified Professional`,
      description: `Official verification confirms their professional status and credibility`
    });
  }
  
  // Reason 5: AI Profile insights
  if (aiProfile.predictedInterests && aiProfile.predictedInterests.length > 0) {
    const interests = aiProfile.predictedInterests.slice(0, 2).join(' and ');
    reasons.push({
      text: `Expertise in ${interests}`,
      description: `Specialized knowledge in areas that align with your professional interests`
    });
  }
  
  // Fill up to 3 reasons
  while (reasons.length < 3) {
    reasons.push({
      text: `Professional Background`,
      description: `Based on their social media presence and network connections`
    });
  }
  
  return reasons.slice(0, 3);
}

// Main function to enhance profiles with personalization
async function enhanceProfilePersonalization() {
  console.log('🎯 Enhancing profile personalization...');
  
  try {
    // Get all profiles from the database
    const { data: profiles, error } = await supabase
      .from('people')
      .select('*')
      .limit(50); // Process in batches
    
    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }
    
    console.log(`📊 Processing ${profiles.length} profiles for personalization...`);
    
    for (const profile of profiles) {
      try {
        console.log(`\n🔄 Processing ${profile.name} (@${profile.username})...`);
        
        // Analyze user behavior
        const behaviorAnalysis = await analyzeUserBehavior(profile);
        console.log(`   📈 Behavior analysis: ${behaviorAnalysis.totalPosts} posts, ${behaviorAnalysis.engagementRate}% engagement`);
        
        // Generate personalized overview
        let personalizedOverview;
        try {
          personalizedOverview = await generatePersonalizedOverview(profile.username, profile, behaviorAnalysis);
        } catch (error) {
          console.log(`   ⚠️ Using fallback overview for ${profile.username}`);
          personalizedOverview = generateFallbackOverview(profile, behaviorAnalysis);
        }
        console.log(`   📝 Personalized overview: "${personalizedOverview.substring(0, 100)}..."`);
        
        // Generate personalized match reasons
        let matchReasons;
        try {
          matchReasons = await generatePersonalizedMatchReasons(profile.username, profile, behaviorAnalysis);
        } catch (error) {
          console.log(`   ⚠️ Using fallback match reasons for ${profile.username}`);
          matchReasons = generateFallbackMatchReasons(profile, behaviorAnalysis);
        }
        console.log(`   🎯 Generated ${matchReasons.length} personalized match reasons`);
        
        // Update the database with enhanced data (only fields that exist)
        const { error: updateError } = await supabase
          .from('people')
          .update({
            ai_profile_overview: personalizedOverview,
            updated_at: new Date()
          })
          .eq('username', profile.username);
        
        if (updateError) {
          console.error(`   ❌ Error updating ${profile.username}:`, updateError);
        } else {
          console.log(`   ✅ Successfully enhanced ${profile.username}`);
        }
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (profileError) {
        console.error(`   ❌ Error processing ${profile.username}:`, profileError);
      }
    }
    
    console.log('\n🎉 Profile personalization enhancement completed!');
    
  } catch (error) {
    console.error('Error in profile personalization:', error);
  }
}

// Run the enhancement if called directly
if (require.main === module) {
  enhanceProfilePersonalization();
}

module.exports = {
  enhanceProfilePersonalization,
  analyzeUserBehavior,
  generatePersonalizedOverview,
  generatePersonalizedMatchReasons
}; 