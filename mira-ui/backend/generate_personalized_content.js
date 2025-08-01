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
        maxOutputTokens: 600
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

// Function to generate personalized timeline content
async function generateTimelineContent(person) {
  const prompt = `
Generate personalized timeline content for this person based on their social media presence and expertise.

PERSON: ${person.name} (@${person.username})
EXPERTISE AREAS: ${person.ai_expertise_areas ? person.ai_expertise_areas.join(', ') : 'Technology, Social Media'}
QUOTES: ${person.quotes ? person.quotes.join(' | ') : 'No quotes available'}

TASK: Create 3 realistic timeline entries that this person might have made recently:

1. A tweet they might have posted (related to their expertise)
2. A retweet they might have shared (from someone in their field)
3. A like they might have given (to content in their area of interest)

Make it highly specific and personal based on their actual expertise areas and content. Use their real name and username.

OUTPUT FORMAT (JSON only):
{
  "timeline": [
    {
      "type": "tweet",
      "action": "${person.name} tweeted",
      "content": "Realistic tweet content based on their expertise",
      "time": "2 days ago"
    },
    {
      "type": "retweet", 
      "action": "${person.name} retweeted @relevant_account",
      "content": "Realistic retweet content from their field",
      "time": "3 days ago"
    },
    {
      "type": "like",
      "action": "${person.name} liked @relevant_account", 
      "content": "Realistic liked content from their area",
      "time": "1 week ago"
    }
  ]
}

Make it highly specific and personal based on their actual content and expertise.
`;

  try {
    const response = await callGeminiAPI(prompt);
    
    try {
      const parsed = JSON.parse(response);
      return parsed.timeline || [];
    } catch (parseError) {
      console.log(`⚠️ JSON parsing failed for ${person.name} timeline, creating fallback`);
      return [
        {
          type: "tweet",
          action: `${person.name} tweeted`,
          content: `Excited to share some insights about ${person.ai_expertise_areas ? person.ai_expertise_areas[0] : 'technology'}!`,
          time: "2 days ago"
        },
        {
          type: "retweet",
          action: `${person.name} retweeted @tech_leader`,
          content: `Great insights on ${person.ai_expertise_areas ? person.ai_expertise_areas[1] : 'innovation'} in the industry.`,
          time: "3 days ago"
        },
        {
          type: "like",
          action: `${person.name} liked @expert_account`,
          content: `Interesting perspective on ${person.ai_expertise_areas ? person.ai_expertise_areas[2] : 'development'}.`,
          time: "1 week ago"
        }
      ];
    }
  } catch (error) {
    console.error(`Error generating timeline for ${person.name}:`, error);
    return [
      {
        type: "tweet",
        action: `${person.name} tweeted`,
        content: `Working on exciting ${person.ai_expertise_areas ? person.ai_expertise_areas[0] : 'technology'} projects!`,
        time: "2 days ago"
      },
      {
        type: "retweet",
        action: `${person.name} retweeted @industry_expert`,
        content: `Fascinating developments in ${person.ai_expertise_areas ? person.ai_expertise_areas[1] : 'the field'}.`,
        time: "3 days ago"
      },
      {
        type: "like",
        action: `${person.name} liked @thought_leader`,
        content: `Valuable insights on ${person.ai_expertise_areas ? person.ai_expertise_areas[2] : 'professional growth'}.`,
        time: "1 week ago"
      }
    ];
  }
}

// Function to generate personalized predicted interests
async function generatePredictedInterests(person) {
  const prompt = `
Generate personalized predicted interests for this person based on their social media presence and expertise.

PERSON: ${person.name} (@${person.username})
EXPERTISE AREAS: ${person.ai_expertise_areas ? person.ai_expertise_areas.join(', ') : 'Technology, Social Media'}
INTERESTS: ${person.ai_interests ? person.ai_interests.join(', ') : 'Technology, Networking'}
QUOTES: ${person.quotes ? person.quotes.join(' | ') : 'No quotes available'}

TASK: Create 3-4 specific predicted interests that this person might have, based on their expertise and content. These should be specific topics, technologies, or areas they might be interested in.

Make it highly specific and personal based on their actual expertise areas and content.

OUTPUT FORMAT (JSON only):
{
  "predicted_interests": [
    "Specific interest 1 (e.g., 'React Performance Optimization')",
    "Specific interest 2 (e.g., 'Machine Learning in Production')", 
    "Specific interest 3 (e.g., 'Startup Growth Strategies')",
    "Specific interest 4 (e.g., 'Open Source Contribution')"
  ]
}

Make it highly specific and personal based on their actual content and expertise.
`;

  try {
    const response = await callGeminiAPI(prompt);
    
    try {
      const parsed = JSON.parse(response);
      return parsed.predicted_interests || [];
    } catch (parseError) {
      console.log(`⚠️ JSON parsing failed for ${person.name} interests, creating fallback`);
      return [
        `${person.ai_expertise_areas ? person.ai_expertise_areas[0] : 'Technology'} Innovation`,
        `${person.ai_expertise_areas ? person.ai_expertise_areas[1] : 'Professional'} Development`,
        `${person.ai_expertise_areas ? person.ai_expertise_areas[2] : 'Industry'} Trends`,
        'Networking & Collaboration'
      ];
    }
  } catch (error) {
    console.error(`Error generating interests for ${person.name}:`, error);
    return [
      `${person.ai_expertise_areas ? person.ai_expertise_areas[0] : 'Technology'} Innovation`,
      `${person.ai_expertise_areas ? person.ai_expertise_areas[1] : 'Professional'} Development`,
      `${person.ai_expertise_areas ? person.ai_expertise_areas[2] : 'Industry'} Trends`,
      'Networking & Collaboration'
    ];
  }
}

// Function to update all people with personalized content
async function generatePersonalizedContent() {
  console.log('🔄 Generating personalized timeline and interests content...');
  
  try {
    // Get all people from database
    const { data: people, error } = await supabase
      .from('people')
      .select('id, name, username, quotes, ai_expertise_areas, ai_interests')
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
        console.log(`🤖 Generating personalized content for ${person.name} (@${person.username})...`);
        
        // Generate timeline content
        const timelineContent = await generateTimelineContent(person);
        
        // Generate predicted interests
        const predictedInterests = await generatePredictedInterests(person);
        
        // Update the database with personalized content
        const { error: updateError } = await supabase
          .from('people')
          .update({ 
            ai_timeline_content: timelineContent,
            ai_predicted_interests: predictedInterests,
            updated_at: new Date().toISOString()
          })
          .eq('id', person.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${person.name}:`, updateError);
        } else {
          console.log(`✅ Updated ${person.name} with personalized content`);
          console.log(`   Timeline: ${timelineContent.length} entries`);
          console.log(`   Interests: ${predictedInterests.join(', ')}`);
          updatedCount++;
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Error processing ${person.name}:`, error);
      }
    }
    
    console.log(`✅ Successfully updated ${updatedCount} people with personalized content`);
    
  } catch (error) {
    console.error('Error in generatePersonalizedContent:', error);
  }
}

// Run the script
generatePersonalizedContent().catch(console.error); 