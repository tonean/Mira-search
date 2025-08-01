import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('🔐 Missing Supabase environment variables. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Gemini API configuration - using environment variable
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

async function callGeminiAPI(prompt) {
  try {
    if (!GEMINI_API_KEY) {
      console.error('🔑 Gemini API key not found in environment variables');
      return null;
    }
    
    console.log('🔑 Using Gemini API key:', GEMINI_API_KEY.substring(0, 10) + '...');
    
    // Add a small delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024, // Reduced to prevent rate limits
        }
      })
    });

    console.log('📡 Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API HTTP error:', response.status, errorText);
      
      // If it's a rate limit error, return null to use fallback
      if (response.status === 429) {
        console.log('⚠️ Rate limit hit, using fallback');
      }
      return null;
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('Gemini API error:', data.error);
      return null;
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Gemini API unexpected response format:', data);
      return null;
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

async function searchPeopleWithAI(query, userEmail = 'demo@mira.com') {
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
1. Analyze each person's relevance to the search query by examining their quotes
2. Only include people whose quotes actually demonstrate involvement or expertise in the search topic
3. Rank people from most relevant to least relevant (1-10 scale)
4. Generate 3-5 related keywords that match the query
5. Provide a brief explanation of why the top matches are relevant

IMPORTANT: Be strict about relevance. If someone's quotes don't clearly show involvement in the search topic, don't include them. For example:
- For "AI and machine learning": Only include people who tweet about AI, ML, algorithms, data science, etc.
- For "open source": Only include people who tweet about coding, GitHub, software development, etc.
- For "business": Only include people who tweet about entrepreneurship, startups, companies, etc.

KEYWORDS: Generate exactly 3 smart, contextual keywords that capture the essence of what the user is looking for. These should be professional, relevant terms that would appear as labels on profile cards. For example:
- For "People involved in AI and machine learning": ["AI", "Machine Learning", "Algorithms"]
- For "Open source developers": ["Engineering", "Open Source", "Building"]
- For "Business leaders and entrepreneurs": ["Business", "Leadership", "Strategy"]
- For "Tech professionals": ["Technology", "Engineering", "Development"]
- For "Research scientists": ["Research", "Science", "Academic"]

Avoid generic words like "People", "Involved", "Machine" (alone), "Learning" (alone). Focus on professional, domain-specific terms.

OUTPUT FORMAT (JSON only):
{
  "ranked_people": [
    {
      "id": "person_id",
      "relevance_score": 9,
      "explanation": "Why this person is relevant (be specific about their quotes)"
    }
  ],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "overall_explanation": "Brief explanation of the search results"
}

Focus on people who are most relevant to the search query. Consider their quotes, type (follower/following/mentioned), and source (twitter/gmail).
`;

    // Call Gemini API
    console.log('🤖 Calling Gemini API...');
    const geminiResponse = await callGeminiAPI(prompt);
    
    if (!geminiResponse) {
      console.log('❌ Gemini API failed, using intelligent fallback');
      
      // Intelligent fallback: filter people based on query keywords and relevance
      const queryLower = query.toLowerCase();
      const queryKeywords = queryLower.split(' ').filter(word => word.length > 2);
      
      // Define relevant terms for different search categories
      const aiTerms = ['ai', 'artificial intelligence', 'machine learning', 'ml', 'neural', 'algorithm', 'data science', 'deep learning', 'nlp', 'computer vision', 'robotics', 'automation'];
      const techTerms = ['engineering', 'developer', 'programming', 'code', 'software', 'tech', 'technology', 'open source', 'github', 'startup', 'innovation'];
      const businessTerms = ['business', 'entrepreneur', 'founder', 'ceo', 'startup', 'company', 'product', 'market'];
      
      const relevantPeople = people.filter(person => {
        if (person.quotes && person.quotes.length > 0) {
          const quoteText = person.quotes.join(' ').toLowerCase();
          
          // Check for exact keyword matches
          const keywordMatches = queryKeywords.filter(keyword => quoteText.includes(keyword)).length;
          
          // Check for category-specific terms
          const hasAITerms = aiTerms.some(term => quoteText.includes(term));
          const hasTechTerms = techTerms.some(term => quoteText.includes(term));
          const hasBusinessTerms = businessTerms.some(term => quoteText.includes(term));
          
          // Determine if query is AI/ML related
          const isAISearch = queryKeywords.some(keyword => 
            aiTerms.some(aiTerm => aiTerm.includes(keyword) || keyword.includes(aiTerm))
          );
          
          // Determine if query is tech related
          const isTechSearch = queryKeywords.some(keyword => 
            techTerms.some(techTerm => techTerm.includes(keyword) || keyword.includes(techTerm))
          );
          
          // Return true if there are keyword matches OR if the search category matches the person's content
          return keywordMatches > 0 || 
                 (isAISearch && hasAITerms) || 
                 (isTechSearch && hasTechTerms) ||
                 (queryKeywords.some(k => k.includes('business')) && hasBusinessTerms);
        }
        return false;
      });
      
      // Sort by relevance score
      const rankedPeople = relevantPeople.sort((a, b) => {
        const aScore = calculateRelevanceScore(a, queryKeywords, aiTerms, techTerms, businessTerms);
        const bScore = calculateRelevanceScore(b, queryKeywords, aiTerms, techTerms, businessTerms);
        return bScore - aScore;
      });
      
      // Check if we have strong enough connections
      const strongConnections = rankedPeople.filter(person => {
        const score = calculateRelevanceScore(person, queryKeywords, aiTerms, techTerms, businessTerms);
        return score >= 5; // Minimum score threshold for "strong" connection
      });
      
      // If not enough strong connections, provide helpful message
      if (strongConnections.length < 3) {
        const suggestions = generateConnectionSuggestions(query);
        return {
          people: [],
          keywords: [],
          explanation: suggestions,
          noStrongConnections: true
        };
      }
      
      const fallbackPeople = rankedPeople.length > 0 ? rankedPeople.slice(0, 10) : people.slice(0, 10);
      
      // Generate smart, contextual keywords based on the query
      let fallbackKeywords = [];
      
      // Use the existing queryLower variable from above
      
      // AI/ML related queries
      if (queryLower.includes('ai') || queryLower.includes('artificial intelligence') || 
          queryLower.includes('machine learning') || queryLower.includes('ml') ||
          queryLower.includes('neural') || queryLower.includes('algorithm') ||
          queryLower.includes('data science') || queryLower.includes('deep learning')) {
        fallbackKeywords = ['AI', 'Machine Learning', 'Algorithms'];
      }
      // Tech/Engineering related queries
      else if (queryLower.includes('engineering') || queryLower.includes('developer') || 
               queryLower.includes('programming') || queryLower.includes('code') ||
               queryLower.includes('software') || queryLower.includes('tech') ||
               queryLower.includes('technology') || queryLower.includes('open source') ||
               queryLower.includes('building') || queryLower.includes('development')) {
        fallbackKeywords = ['Engineering', 'Technology', 'Building'];
      }
      // Business/Startup related queries
      else if (queryLower.includes('business') || queryLower.includes('entrepreneur') || 
               queryLower.includes('founder') || queryLower.includes('ceo') ||
               queryLower.includes('startup') || queryLower.includes('company') ||
               queryLower.includes('leadership') || queryLower.includes('strategy')) {
        fallbackKeywords = ['Business', 'Leadership', 'Strategy'];
      }
      // Research/Science related queries
      else if (queryLower.includes('research') || queryLower.includes('science') || 
               queryLower.includes('academic') || queryLower.includes('university') ||
               queryLower.includes('professor') || queryLower.includes('phd') ||
               queryLower.includes('scientist') || queryLower.includes('study')) {
        fallbackKeywords = ['Research', 'Science', 'Academic'];
      }
      // Design/Creative related queries
      else if (queryLower.includes('design') || queryLower.includes('creative') || 
               queryLower.includes('art') || queryLower.includes('ui') ||
               queryLower.includes('ux') || queryLower.includes('visual') ||
               queryLower.includes('graphic') || queryLower.includes('creative')) {
        fallbackKeywords = ['Design', 'Creative', 'Visual'];
      }
      // Default fallback for general queries
      else {
        fallbackKeywords = ['Network', 'Connections', 'Activity'];
      }
      
      return {
        people: fallbackPeople,
        keywords: fallbackKeywords,
        explanation: `Found ${fallbackPeople.length} people in your network related to "${query}":`
      };
    }
    
    console.log('✅ Gemini API response received');

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

    // Check if we have strong enough connections (relevance score >= 7 for Gemini results)
    const strongConnections = rankedPeople.filter(person => person.relevance_score >= 7);
    
    // If not enough strong connections, provide helpful message
    if (strongConnections.length < 3) {
      const suggestions = generateConnectionSuggestions(query);
      return {
        people: [],
        keywords: [],
        explanation: suggestions,
        noStrongConnections: true
      };
    }

    return {
      people: rankedPeople,
      keywords: parsedResponse.keywords || ['network', 'connections', 'people'],
      explanation: parsedResponse.overall_explanation || 'Showing relevant people from your network.'
    };

  } catch (error) {
    console.error('Error in searchPeopleWithAI:', error);
    return { people: [], keywords: [], explanation: 'Error searching people.' };
  }
}

// Generate helpful suggestions when no strong connections are found
function generateConnectionSuggestions(query) {
  const queryLower = query.toLowerCase();
  
  // AI/ML related suggestions
  if (queryLower.includes('ai') || queryLower.includes('artificial intelligence') || 
      queryLower.includes('machine learning') || queryLower.includes('ml')) {
    return `No strong AI/ML connections found in your network. Try following AI researchers, data scientists, or ML engineers on Twitter. Consider connecting with people from @OpenAI, @DeepMind, or @AnthropicAI.`;
  }
  
  // Tech/Engineering suggestions
  if (queryLower.includes('engineering') || queryLower.includes('developer') || 
      queryLower.includes('programming') || queryLower.includes('code') ||
      queryLower.includes('software') || queryLower.includes('tech')) {
    return `No strong engineering connections found. Try following software engineers, developers, or tech leaders. Consider connecting with people from @GitHub, @StackOverflow, or tech companies.`;
  }
  
  // Business/Startup suggestions
  if (queryLower.includes('business') || queryLower.includes('entrepreneur') || 
      queryLower.includes('founder') || queryLower.includes('startup')) {
    return `No strong business connections found. Try following entrepreneurs, startup founders, or business leaders. Consider connecting with people from @YCombinator, @TechCrunch, or startup communities.`;
  }
  
  // Research/Science suggestions
  if (queryLower.includes('research') || queryLower.includes('science') || 
      queryLower.includes('academic') || queryLower.includes('professor')) {
    return `No strong research connections found. Try following researchers, professors, or scientists. Consider connecting with people from universities, research institutions, or scientific communities.`;
  }
  
  // Design/Creative suggestions
  if (queryLower.includes('design') || queryLower.includes('creative') || 
      queryLower.includes('art') || queryLower.includes('ui') || queryLower.includes('ux')) {
    return `No strong design connections found. Try following designers, creatives, or UX professionals. Consider connecting with people from @Dribbble, @Behance, or design communities.`;
  }
  
  // Default suggestion
  return `No strong connections found for "${query}". Try expanding your network by following more people in this field, or try a different search query.`;
}

// Calculate relevance score for a person based on their quotes and the search query
function calculateRelevanceScore(person, queryKeywords, aiTerms, techTerms, businessTerms) {
  if (!person.quotes || person.quotes.length === 0) return 0;
  
  const quoteText = person.quotes.join(' ').toLowerCase();
  let score = 0;
  
  // Exact keyword matches (highest weight)
  const keywordMatches = queryKeywords.filter(keyword => quoteText.includes(keyword)).length;
  score += keywordMatches * 10;
  
  // Category-specific term matches
  const aiMatches = aiTerms.filter(term => quoteText.includes(term)).length;
  const techMatches = techTerms.filter(term => quoteText.includes(term)).length;
  const businessMatches = businessTerms.filter(term => quoteText.includes(term)).length;
  
  score += aiMatches * 5;
  score += techMatches * 5;
  score += businessMatches * 3;
  
  // Bonus for having more quotes (indicates more activity)
  score += Math.min(person.quotes.length * 2, 10);
  
  // Bonus for following status
  if (person.following) score += 3;
  
  return score;
}

// Convert Supabase data to the format expected by PeopleCardList
function convertToCardFormat(supabasePerson, searchKeywords = []) {
  // Generate a consistent avatar background based on the person's ID
  const colors = [
    'linear-gradient(135deg, #3a8dde 0%, #b388ff 100%)',
    '#7c3aed',
    'linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)',
    'linear-gradient(135deg, #ff6a88 0%, #ff99ac 100%)',
    'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
  ];
  
  const colorIndex = parseInt(supabasePerson.account_id) % colors.length;
  const avatarBg = colors[colorIndex];

  // Generate scores based on the person's data and search keywords
  const scores = [];
  
  // Use search keywords if available, otherwise use default categories
  if (searchKeywords && searchKeywords.length > 0) {
    // Generate scores based on search keywords with smarter matching
    searchKeywords.slice(0, 3).forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      let hasKeywordContent = false;
      
      // Smart matching for different keyword types
      if (keywordLower.includes('ai') || keywordLower.includes('artificial intelligence')) {
        const aiTerms = ['ai', 'artificial intelligence', 'machine learning', 'neural', 'algorithm', 'gpt', 'llm'];
        hasKeywordContent = supabasePerson.quotes.some(quote => 
          aiTerms.some(term => quote.toLowerCase().includes(term))
        );
      } else if (keywordLower.includes('machine learning') || keywordLower.includes('ml')) {
        const mlTerms = ['machine learning', 'ml', 'neural', 'algorithm', 'data science', 'deep learning'];
        hasKeywordContent = supabasePerson.quotes.some(quote => 
          mlTerms.some(term => quote.toLowerCase().includes(term))
        );
      } else if (keywordLower.includes('engineering') || keywordLower.includes('technology') || keywordLower.includes('tech')) {
        const techTerms = ['engineering', 'technology', 'tech', 'developer', 'programming', 'code', 'software'];
        hasKeywordContent = supabasePerson.quotes.some(quote => 
          techTerms.some(term => quote.toLowerCase().includes(term))
        );
      } else if (keywordLower.includes('building') || keywordLower.includes('development')) {
        const buildTerms = ['building', 'development', 'developer', 'code', 'programming', 'project'];
        hasKeywordContent = supabasePerson.quotes.some(quote => 
          buildTerms.some(term => quote.toLowerCase().includes(term))
        );
      } else if (keywordLower.includes('business') || keywordLower.includes('leadership') || keywordLower.includes('strategy')) {
        const businessTerms = ['business', 'leadership', 'strategy', 'entrepreneur', 'founder', 'ceo', 'startup'];
        hasKeywordContent = supabasePerson.quotes.some(quote => 
          businessTerms.some(term => quote.toLowerCase().includes(term))
        );
      } else {
        // Default exact matching
        hasKeywordContent = supabasePerson.quotes.some(quote => 
          quote.toLowerCase().includes(keywordLower)
        );
      }
      
      scores.push({ 
        label: keyword.charAt(0).toUpperCase() + keyword.slice(1), 
        color: hasKeywordContent ? 'green' : 'yellow' 
      });
    });
  } else {
    // Use AI-generated expertise areas if available, otherwise fallback to default categories
    if (supabasePerson.ai_expertise_areas && supabasePerson.ai_expertise_areas.length > 0) {
      // Use AI-generated expertise areas
      supabasePerson.ai_expertise_areas.slice(0, 3).forEach(expertiseArea => {
        const areaLower = expertiseArea.toLowerCase();
        let hasContent = false;
        
        // Check if quotes contain content related to this expertise area
        if (supabasePerson.quotes && supabasePerson.quotes.length > 0) {
          const quoteText = supabasePerson.quotes.join(' ').toLowerCase();
          
          // Smart matching for different expertise areas
          if (areaLower.includes('ai') || areaLower.includes('machine learning') || areaLower.includes('artificial intelligence')) {
            const aiTerms = ['ai', 'artificial intelligence', 'machine learning', 'ml', 'neural', 'algorithm', 'gpt', 'llm'];
            hasContent = aiTerms.some(term => quoteText.includes(term));
          } else if (areaLower.includes('software') || areaLower.includes('development') || areaLower.includes('engineering')) {
            const devTerms = ['code', 'programming', 'software', 'engineering', 'developer', 'tech', 'technology'];
            hasContent = devTerms.some(term => quoteText.includes(term));
          } else if (areaLower.includes('business') || areaLower.includes('entrepreneur') || areaLower.includes('startup')) {
            const businessTerms = ['business', 'entrepreneur', 'startup', 'company', 'product', 'market'];
            hasContent = businessTerms.some(term => quoteText.includes(term));
          } else if (areaLower.includes('research') || areaLower.includes('science') || areaLower.includes('academic')) {
            const researchTerms = ['research', 'science', 'academic', 'study', 'analysis'];
            hasContent = researchTerms.some(term => quoteText.includes(term));
          } else {
            // Default exact matching
            hasContent = quoteText.includes(areaLower);
          }
        }
        
        scores.push({ 
          label: expertiseArea, 
          color: hasContent ? 'green' : 'yellow' 
        });
      });
    } else {
      // Fallback to default categories
      // AI/ML score based on quotes containing AI terms
      const aiTerms = ['ai', 'artificial intelligence', 'machine learning', 'ml', 'neural', 'algorithm', 'data science', 'deep learning', 'nlp', 'computer vision'];
      const hasAIContent = supabasePerson.quotes.some(quote => 
        aiTerms.some(term => quote.toLowerCase().includes(term))
      );
      scores.push({ 
        label: 'AI/ML', 
        color: hasAIContent ? 'green' : 'yellow' 
      });

      // Technology score based on quotes containing technical terms
      const technicalTerms = ['code', 'programming', 'software', 'engineering', 'developer', 'tech', 'technology', 'algorithm', 'framework', 'api'];
      const hasTechnicalContent = supabasePerson.quotes.some(quote => 
        technicalTerms.some(term => quote.toLowerCase().includes(term))
      );
      scores.push({ 
        label: 'Technology', 
        color: hasTechnicalContent ? 'green' : 'yellow' 
      });

      // Activity score based on following status and quote count
      const hasActivity = supabasePerson.following || supabasePerson.quotes.length > 1;
      scores.push({ 
        label: 'Activity', 
        color: hasActivity ? 'green' : 'yellow' 
      });
    }
  }

  // Get a sample quote
  const quote = supabasePerson.quotes.length > 0 
    ? supabasePerson.quotes[0] 
    : `Connected via ${supabasePerson.source}`;

  // Use username from database, or extract from quotes, or use account_id
  let username = supabasePerson.username || supabasePerson.account_id;
  if (!supabasePerson.username && supabasePerson.quotes && supabasePerson.quotes.length > 0) {
    // Look for @username patterns in quotes as fallback
    const quoteText = supabasePerson.quotes.join(' ');
    const usernameMatch = quoteText.match(/@(\w+)/);
    if (usernameMatch) {
      username = usernameMatch[1];
    }
  }
  
  // Use real profile picture if available, otherwise generate initials
  const initials = (supabasePerson.name || username).split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  
  let avatarContent;
  if (supabasePerson.profile_picture_url) {
    // Use real profile picture
    avatarContent = (
      <img 
        src={supabasePerson.profile_picture_url} 
        alt={supabasePerson.name || username}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%'
        }}
        onError={(e) => {
          // Fallback to initials if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
        onLoad={(e) => {
          // Hide initials when image loads successfully
          e.target.nextSibling.style.display = 'none';
        }}
      />
    );
  }
  
  // Fallback initials (shown if no profile picture or if image fails to load)
  const fallbackInitials = (
    <div style={{
      width: '100%',
      height: '100%',
      display: supabasePerson.profile_picture_url ? 'flex' : 'flex', // Always show initially, will be hidden by onLoad
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {initials}
    </div>
  );
  
  return {
    name: supabasePerson.name || `User ${supabasePerson.account_id}`,
    followers: `${Math.floor(Math.random() * 20) + 1}K`, // Mock follower count
    platform: supabasePerson.source,
    username: username,
    avatarBg: avatarBg,
    avatarIcon: (
      <>
        {avatarContent}
        {fallbackInitials}
      </>
    ),
    scores: scores,
    quote: quote,
    // Add AI-generated profile overview
    aiProfileOverview: supabasePerson.ai_profile_overview || `${supabasePerson.name || username} is a professional in their field with experience shared through their social media presence. They engage with topics related to their expertise and contribute to discussions in their domain.`,
    // Add comprehensive profile data
    aiExpertiseAreas: supabasePerson.ai_expertise_areas || ['Technology', 'Social Media', 'Professional Development'],
    aiKeyAchievements: supabasePerson.ai_key_achievements || ['Active professional presence', 'Engaged in their field'],
    aiInterests: supabasePerson.ai_interests || ['Technology', 'Networking', 'Professional growth'],
    aiPersonalityTraits: supabasePerson.ai_personality_traits || ['Professional', 'Engaged', 'Connected'],
    aiConnectionMessage: supabasePerson.ai_connection_message || `Hi ${supabasePerson.name || username}! I was impressed by your professional presence and would love to connect and discuss potential collaboration opportunities.`,
    // Add timeline and predicted interests data
    aiTimelineContent: supabasePerson.ai_timeline_content || [],
    aiPredictedInterests: supabasePerson.ai_predicted_interests || ['Technology Innovation', 'Professional Development', 'Industry Trends', 'Networking & Collaboration'],
    // Add original data for reference
    originalData: supabasePerson
  };
}

export function useRealDataSearch(query, userEmail = 'demo@mira.com') {
  const [searchResults, setSearchResults] = useState({
    people: [],
    keywords: [],
    explanation: '',
    loading: false,
    error: null,
    noStrongConnections: false
  });

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults({
        people: [],
        keywords: [],
        explanation: '',
        loading: false,
        error: null,
        noStrongConnections: false
      });
      return;
    }

    // Add debouncing to prevent too many API calls
    const timeoutId = setTimeout(() => {
      setSearchResults(prev => ({ ...prev, loading: true, error: null }));

      searchPeopleWithAI(query, userEmail)
        .then(results => {
          const convertedPeople = results.people.map(person => 
            convertToCardFormat(person, results.keywords)
          );
          setSearchResults({
            people: convertedPeople,
            keywords: results.keywords,
            explanation: results.explanation,
            loading: false,
            error: null,
            noStrongConnections: results.noStrongConnections || false
          });
        })
        .catch(error => {
          console.error('Search error:', error);
          setSearchResults({
            people: [],
            keywords: [],
            explanation: 'Error searching people.',
            loading: false,
            error: error.message,
            noStrongConnections: false
          });
        });
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, userEmail]);

  return searchResults;
}

export { searchPeopleWithAI, convertToCardFormat }; 