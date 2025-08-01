require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to score quotes by relevance to different topics
function scoreQuotesByTopic(quotes, topic) {
  const topicKeywords = {
    'ai': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'neural', 'algorithm', 'data science', 'deep learning', 'nlp', 'computer vision', 'robotics', 'automation', 'gpt', 'llm', 'transformer'],
    'tech': ['engineering', 'developer', 'programming', 'code', 'software', 'tech', 'technology', 'open source', 'github', 'startup', 'innovation', 'coding', 'developer', 'engineer'],
    'business': ['business', 'entrepreneur', 'founder', 'ceo', 'startup', 'company', 'product', 'market', 'funding', 'venture', 'investor', 'strategy'],
    'science': ['research', 'science', 'study', 'paper', 'academic', 'university', 'professor', 'phd', 'scientist', 'laboratory', 'experiment']
  };
  
  const keywords = topicKeywords[topic.toLowerCase()] || [];
  const allQuotes = quotes.join(' ').toLowerCase();
  
  let score = 0;
  keywords.forEach(keyword => {
    const matches = (allQuotes.match(new RegExp(keyword, 'g')) || []).length;
    score += matches;
  });
  
  return score;
}

// Function to get the most relevant quotes for a topic
function getMostRelevantQuotes(quotes, topic, maxQuotes = 5) {
  if (!quotes || quotes.length === 0) return [];
  
  // Score each quote individually
  const scoredQuotes = quotes.map(quote => ({
    text: quote,
    score: scoreQuotesByTopic([quote], topic)
  }));
  
  // Sort by score and return top quotes
  return scoredQuotes
    .sort((a, b) => b.score - a.score)
    .slice(0, maxQuotes)
    .map(item => item.text);
}

// Main function to improve existing quotes
async function improveExistingQuotes() {
  console.log('🔄 Improving existing quotes with topic relevance...');
  
  try {
    // Get existing people from database
    const { data: existingPeople, error } = await supabase
      .from('people')
      .select('id, account_id, username, name, quotes');
    
    if (error) {
      console.error('Error fetching people:', error);
      return;
    }
    
    console.log(`📋 Found ${existingPeople.length} existing people in database`);
    
    // Update each person with better quotes
    const updates = [];
    
    for (const person of existingPeople) {
      if (person.quotes && person.quotes.length > 0) {
        // Get most relevant quotes for different topics
        const aiQuotes = getMostRelevantQuotes(person.quotes, 'ai', 3);
        const techQuotes = getMostRelevantQuotes(person.quotes, 'tech', 3);
        const businessQuotes = getMostRelevantQuotes(person.quotes, 'business', 3);
        
        // Combine all relevant quotes
        const allRelevantQuotes = [...new Set([...aiQuotes, ...techQuotes, ...businessQuotes])];
        
        // If no topic-specific quotes, use general quotes but prioritize longer, more substantial ones
        let finalQuotes = allRelevantQuotes.length > 0 ? 
          allRelevantQuotes.slice(0, 5) : 
          person.quotes
            .filter(quote => quote.length > 20) // Filter out very short quotes
            .sort((a, b) => b.length - a.length) // Sort by length
            .slice(0, 5);
        
        // If still no good quotes, use original quotes
        if (finalQuotes.length === 0) {
          finalQuotes = person.quotes.slice(0, 5);
        }
        
        updates.push({
          id: person.id,
          quotes: finalQuotes,
          updated_at: new Date().toISOString()
        });
        
        console.log(`✅ Updated ${person.name || person.username} with ${finalQuotes.length} relevant quotes`);
      }
    }
    
    // Batch update the database
    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('people')
          .update(update)
          .eq('id', update.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${update.id}:`, updateError);
        }
      }
    }
    
    console.log(`✅ Successfully updated ${updates.length} people with improved quotes`);
    
    // Show sample improved quotes
    console.log('\n📝 Sample improved quotes:');
    const sampleUpdates = updates.slice(0, 3);
    for (const update of sampleUpdates) {
      const person = existingPeople.find(p => p.id === update.id);
      console.log(`\n👤 ${person.name || person.username} (@${person.username}):`);
      update.quotes.forEach((quote, index) => {
        console.log(`  ${index + 1}. "${quote}"`);
      });
    }
    
  } catch (error) {
    console.error('Error in improveExistingQuotes:', error);
  }
}

// Run the script
improveExistingQuotes().catch(console.error); 