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
        maxOutputTokens: 200
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

// Function to generate AI profile overview
async function generateProfileOverview(person) {
  const prompt = `
Generate a professional profile overview for this person based on their Twitter content. 

PERSON: ${person.name} (@${person.username})
TWITTER CONTENT: ${person.quotes ? person.quotes.join(' ') : 'No content available'}

Create a 2-3 sentence professional overview that:
- Describes their expertise and background based on their tweets
- Mentions their key interests or focus areas
- Uses a professional, third-person tone
- Is approximately 100-150 words
- Focuses on their professional identity and contributions

Format: Just return the overview text, no additional formatting or quotes.
`;

  try {
    const overview = await callGeminiAPI(prompt);
    return overview;
  } catch (error) {
    console.error(`Error generating profile for ${person.name}:`, error);
    // Return a fallback overview
    return `${person.name} is a professional in their field with experience shared through their social media presence. They engage with topics related to their expertise and contribute to discussions in their domain.`;
  }
}

// Function to update all people with AI-generated profiles
async function updateAllProfiles() {
  console.log('🔄 Generating AI-powered profile overviews...');
  
  try {
    // Get all people from database
    const { data: people, error } = await supabase
      .from('people')
      .select('id, name, username, quotes')
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
        console.log(`🤖 Generating profile for ${person.name} (@${person.username})...`);
        
        // Generate AI profile overview
        const aiOverview = await generateProfileOverview(person);
        
        // Update the database with the AI-generated overview
        const { error: updateError } = await supabase
          .from('people')
          .update({ 
            ai_profile_overview: aiOverview,
            updated_at: new Date().toISOString()
          })
          .eq('id', person.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${person.name}:`, updateError);
        } else {
          console.log(`✅ Updated ${person.name} with AI profile: "${aiOverview.substring(0, 100)}..."`);
          updatedCount++;
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing ${person.name}:`, error);
      }
    }
    
    console.log(`✅ Successfully updated ${updatedCount} people with AI-generated profiles`);
    
    // Show sample generated profiles
    console.log('\n📝 Sample AI-generated profiles:');
    const samplePeople = people.slice(0, 3);
    for (const person of samplePeople) {
      const { data: updatedPerson } = await supabase
        .from('people')
        .select('ai_profile_overview')
        .eq('id', person.id)
        .single();
      
      if (updatedPerson && updatedPerson.ai_profile_overview) {
        console.log(`\n👤 ${person.name} (@${person.username}):`);
        console.log(`   "${updatedPerson.ai_profile_overview}"`);
      }
    }
    
  } catch (error) {
    console.error('Error in updateAllProfiles:', error);
  }
}

// Run the script
updateAllProfiles().catch(console.error); 