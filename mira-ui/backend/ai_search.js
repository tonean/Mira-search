require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function callGeminiAPI(prompt) {
  try {
    const postData = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            
            if (jsonData.error) {
              console.error('Gemini API error:', jsonData.error);
              resolve(null);
            } else {
              resolve(jsonData.candidates[0].content.parts[0].text);
            }
          } catch (error) {
            console.error('Error parsing Gemini response:', error);
            resolve(null);
          }
        });
      });

      req.on('error', (error) => {
        console.error('Error calling Gemini API:', error);
        resolve(null);
      });

      req.write(postData);
      req.end();
    });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

async function searchPeople(query, userEmail = 'demo@mira.com') {
  console.log(`🔍 Searching for: "${query}" for user: ${userEmail}`);
  
  try {
    // Fetch all people data for the user
    const { data: people, error } = await supabase
      .from('people')
      .select('*')
      .eq('user_email', userEmail);

    if (error) {
      console.error('Error fetching people:', error);
      return { people: [], keywords: [], explanation: '' };
    }

    if (!people || people.length === 0) {
      return { people: [], keywords: [], explanation: 'No people found in your network.' };
    }

    // Prepare data for Gemini analysis
    const peopleData = people.map(person => ({
      id: person.account_id,
      name: person.name,
      type: person.type,
      source: person.source,
      quotes: person.quotes || [],
      following: person.following
    }));

    // Create prompt for Gemini
    const prompt = `
You are an AI assistant that helps find the best people matches from a social network based on search queries.

SEARCH QUERY: "${query}"

PEOPLE DATA:
${JSON.stringify(peopleData, null, 2)}

TASK:
1. Analyze each person's relevance to the search query
2. Rank people from most relevant to least relevant (1-10 scale)
3. Generate 3-5 related keywords that match the query
4. Provide a brief explanation of why the top matches are relevant

OUTPUT FORMAT (JSON only):
{
  "ranked_people": [
    {
      "id": "person_id",
      "relevance_score": 9,
      "explanation": "Why this person is relevant"
    }
  ],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "overall_explanation": "Brief explanation of the search results"
}

Focus on people who are most relevant to the search query. Consider their quotes, type (follower/following/mentioned), and source (twitter/gmail).
`;

    // Call Gemini API
    const geminiResponse = await callGeminiAPI(prompt);
    
    if (!geminiResponse) {
      // Fallback: return all people without ranking
      return {
        people: people.slice(0, 10),
        keywords: ['network', 'connections', 'people'],
        explanation: 'Showing your network connections.'
      };
    }

    // Parse Gemini response
    let parsedResponse;
    try {
      // Extract JSON from response (Gemini might add extra text)
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return {
        people: people.slice(0, 10),
        keywords: ['network', 'connections', 'people'],
        explanation: 'Showing your network connections.'
      };
    }

    // Map ranked results back to full people data
    const rankedPeople = parsedResponse.ranked_people
      .map(ranked => {
        const person = people.find(p => p.account_id === ranked.id);
        return person ? {
          ...person,
          relevance_score: ranked.relevance_score,
          relevance_explanation: ranked.explanation
        } : null;
      })
      .filter(Boolean)
      .slice(0, 10); // Limit to top 10

    return {
      people: rankedPeople,
      keywords: parsedResponse.keywords || ['network', 'connections', 'people'],
      explanation: parsedResponse.overall_explanation || 'Showing relevant people from your network.'
    };

  } catch (error) {
    console.error('Error in searchPeople:', error);
    return { people: [], keywords: [], explanation: 'Error searching people.' };
  }
}

// Test function
async function testSearch() {
  const results = await searchPeople('Engineers who have contributed to open source projects');
  console.log('Search Results:', JSON.stringify(results, null, 2));
}

// Export for use in other files
module.exports = { searchPeople, callGeminiAPI };

// Run test if called directly
if (require.main === module) {
  testSearch().catch(console.error);
} 