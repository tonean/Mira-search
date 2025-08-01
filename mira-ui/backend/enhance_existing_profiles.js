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

// Function to generate comprehensive profile from existing data
async function generateComprehensiveProfile(person) {
  const prompt = `
Generate a comprehensive professional profile for this person based on their social media content and information.

PERSON: ${person.name} (@${person.username})
SOURCE: ${person.source}
FOLLOWING: ${person.following ? 'Yes' : 'No'}
QUOTES: ${person.quotes ? person.quotes.join(' | ') : 'No quotes available'}

TASK: Create a comprehensive professional profile that includes:

1. OVERVIEW: A detailed 2-3 sentence professional overview (100-150 words) that describes their expertise, background, and professional identity based on their actual content
2. EXPERTISE AREAS: 3-4 specific areas of expertise based on their quotes and content
3. KEY ACHIEVEMENTS: 2-3 notable achievements or contributions inferred from their content
4. INTERESTS: 2-3 current interests or focus areas
5. PERSONALITY TRAITS: 2-3 professional personality traits
6. CONNECTION MESSAGE: A personalized message to connect with them based on their content

IMPORTANT: 
- Make it highly specific and personal based on their actual quotes
- Avoid generic statements like "professional in their field"
- Focus on what their content reveals about their expertise and interests
- Make the connection message personal and relevant to their content
- If they have technical content, highlight their technical expertise
- If they have business content, focus on their business acumen
- If they have creative content, emphasize their creative skills

OUTPUT FORMAT (JSON only):
{
  "overview": "Detailed professional overview based on their actual content",
  "expertise_areas": ["specific area 1", "specific area 2", "specific area 3"],
  "key_achievements": ["achievement 1", "achievement 2"],
  "interests": ["interest 1", "interest 2"],
  "personality_traits": ["trait 1", "trait 2"],
  "connection_message": "Personalized connection message based on their content"
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
      console.log(`⚠️ JSON parsing failed for ${person.name}, creating structured response`);
      
      // Create a structured response from the text
      const lines = response.split('\n').filter(line => line.trim());
      const overview = lines[0] || `${person.name} is a professional with expertise in their field.`;
      
      // Extract expertise areas from quotes
      const expertiseAreas = [];
      if (person.quotes && person.quotes.length > 0) {
        const quoteText = person.quotes.join(' ').toLowerCase();
        if (quoteText.includes('ai') || quoteText.includes('artificial intelligence') || quoteText.includes('machine learning')) {
          expertiseAreas.push('AI & Machine Learning');
        }
        if (quoteText.includes('code') || quoteText.includes('programming') || quoteText.includes('developer')) {
          expertiseAreas.push('Software Development');
        }
        if (quoteText.includes('business') || quoteText.includes('startup') || quoteText.includes('entrepreneur')) {
          expertiseAreas.push('Business & Entrepreneurship');
        }
        if (quoteText.includes('research') || quoteText.includes('science') || quoteText.includes('academic')) {
          expertiseAreas.push('Research & Academia');
        }
      }
      
      if (expertiseAreas.length === 0) {
        expertiseAreas.push('Technology', 'Social Media', 'Professional Development');
      }
      
      return {
        overview: overview,
        expertise_areas: expertiseAreas.slice(0, 3),
        key_achievements: ['Active professional presence', 'Engaged in their field'],
        interests: expertiseAreas.slice(0, 2),
        personality_traits: ['Professional', 'Engaged', 'Knowledgeable'],
        connection_message: `Hi ${person.name}! I was impressed by your content and would love to connect and discuss potential collaboration opportunities in ${expertiseAreas[0] || 'your field'}.`
      };
    }
  } catch (error) {
    console.error(`Error generating profile for ${person.name}:`, error);
    return {
      overview: `${person.name} is a professional with expertise in their field based on their social media presence.`,
      expertise_areas: ['Technology', 'Social Media', 'Professional Development'],
      key_achievements: ['Active professional presence', 'Engaged in their field'],
      interests: ['Technology', 'Networking', 'Professional growth'],
      personality_traits: ['Professional', 'Engaged', 'Connected'],
      connection_message: `Hi ${person.name}! I was impressed by your professional presence and would love to connect and discuss potential collaboration opportunities.`
    };
  }
}

// Function to update all people with enhanced comprehensive profiles
async function enhanceExistingProfiles() {
  console.log('🔄 Enhancing existing profiles with comprehensive AI-generated data...');
  
  try {
    // Get all people from database
    const { data: people, error } = await supabase
      .from('people')
      .select('id, name, username, quotes, source, following, type')
      .not('username', 'is', null);
    
    if (error) {
      console.error('Error fetching people:', error);
      return;
    }
    
    console.log(`📋 Found ${people.length} people to enhance`);
    
    // Process each person
    let updatedCount = 0;
    
    for (const person of people) {
      try {
        console.log(`🤖 Enhancing profile for ${person.name} (@${person.username})...`);
        
        // Generate comprehensive AI profile
        const comprehensiveProfile = await generateComprehensiveProfile(person);
        
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
            updated_at: new Date().toISOString()
          })
          .eq('id', person.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${person.name}:`, updateError);
        } else {
          console.log(`✅ Enhanced ${person.name}`);
          console.log(`   Overview: "${comprehensiveProfile.overview.substring(0, 100)}..."`);
          console.log(`   Expertise: ${comprehensiveProfile.expertise_areas.join(', ')}`);
          console.log(`   Connection: "${comprehensiveProfile.connection_message.substring(0, 80)}..."`);
          updatedCount++;
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Error processing ${person.name}:`, error);
      }
    }
    
    console.log(`✅ Successfully enhanced ${updatedCount} people with comprehensive profiles`);
    
    // Show sample enhanced profiles
    console.log('\n📝 Sample enhanced profiles:');
    const samplePeople = people.slice(0, 3);
    for (const person of samplePeople) {
      const { data: updatedPerson } = await supabase
        .from('people')
        .select('ai_profile_overview, ai_expertise_areas, ai_connection_message')
        .eq('id', person.id)
        .single();
      
      if (updatedPerson) {
        console.log(`\n👤 ${person.name} (@${person.username}):`);
        console.log(`   Overview: "${updatedPerson.ai_profile_overview}"`);
        console.log(`   Expertise: ${updatedPerson.ai_expertise_areas?.join(', ') || 'N/A'}`);
        console.log(`   Connection: "${updatedPerson.ai_connection_message}"`);
      }
    }
    
  } catch (error) {
    console.error('Error in enhanceExistingProfiles:', error);
  }
}

// Run the script
enhanceExistingProfiles().catch(console.error); 