require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to extract comprehensive quotes from tweets
function extractComprehensiveQuotes(tweetsData) {
  const userQuotes = {};
  
  tweetsData.forEach(entry => {
    const tweet = entry.tweet;
    
    // Extract mentions to get usernames
    if (tweet.entities && tweet.entities.user_mentions) {
      tweet.entities.user_mentions.forEach(mention => {
        const userId = mention.id_str;
        const username = mention.screen_name;
        const name = mention.name;
        
        if (!userQuotes[userId]) {
          userQuotes[userId] = {
            accountId: userId,
            username: username,
            name: name,
            quotes: [],
            tweetCount: 0,
            retweetCount: 0,
            likeCount: 0,
            hashtags: new Set(),
            urls: new Set()
          };
        }
        
        // Clean and add the tweet content
        let cleanText = tweet.full_text;
        
        // Remove URLs but keep track of them
        const urlMatches = cleanText.match(/https?:\/\/\S+/g) || [];
        urlMatches.forEach(url => {
          userQuotes[userId].urls.add(url);
          cleanText = cleanText.replace(url, '');
        });
        
        // Remove RT prefixes but keep the content
        cleanText = cleanText.replace(/^RT @\w+:\s*/, '');
        
        // Extract hashtags
        const hashtagMatches = cleanText.match(/#\w+/g) || [];
        hashtagMatches.forEach(hashtag => {
          userQuotes[userId].hashtags.add(hashtag);
        });
        
        // Clean up extra whitespace
        cleanText = cleanText.trim();
        
        // Only add if it's substantial content
        if (cleanText.length > 15 && !userQuotes[userId].quotes.includes(cleanText)) {
          userQuotes[userId].quotes.push(cleanText);
        }
        
        userQuotes[userId].tweetCount++;
        userQuotes[userId].retweetCount += parseInt(tweet.retweet_count || 0);
        userQuotes[userId].likeCount += parseInt(tweet.favorite_count || 0);
      });
    }
  });
  
  return userQuotes;
}

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

// Main function to update database with comprehensive quotes
async function updateComprehensiveQuotes() {
  console.log('🔄 Extracting comprehensive quotes...');
  
  try {
    // Load tweets data
    const tweetsPath = path.join(__dirname, '../demo-data/tweets.js');
    const tweetsContent = fs.readFileSync(tweetsPath, 'utf8');
    
    // Extract the tweets array from the JS file
    const tweetsMatch = tweetsContent.match(/window\.YTD\.tweets\.part0 = (\[[\s\S]*\]);/);
    if (!tweetsMatch) {
      console.error('Could not parse tweets.js file');
      return;
    }
    
    let tweetsData;
    try {
      tweetsData = JSON.parse(tweetsMatch[1]);
    } catch (parseError) {
      console.error('Error parsing tweets JSON:', parseError);
      return;
    }
    console.log(`📊 Loaded ${tweetsData.length} tweets`);
    
    // Extract comprehensive quotes
    const userQuotes = extractComprehensiveQuotes(tweetsData);
    console.log(`👥 Found ${Object.keys(userQuotes).length} users with quotes`);
    
    // Get existing people from database
    const { data: existingPeople, error } = await supabase
      .from('people')
      .select('id, account_id, username, name');
    
    if (error) {
      console.error('Error fetching people:', error);
      return;
    }
    
    console.log(`📋 Found ${existingPeople.length} existing people in database`);
    
    // Update each person with better quotes
    const updates = [];
    
    for (const person of existingPeople) {
      const betterData = userQuotes[person.account_id];
      
      if (betterData && betterData.quotes.length > 0) {
        // Get most relevant quotes for different topics
        const aiQuotes = getMostRelevantQuotes(betterData.quotes, 'ai', 3);
        const techQuotes = getMostRelevantQuotes(betterData.quotes, 'tech', 3);
        const businessQuotes = getMostRelevantQuotes(betterData.quotes, 'business', 3);
        
        // Combine all relevant quotes
        const allRelevantQuotes = [...new Set([...aiQuotes, ...techQuotes, ...businessQuotes])];
        
        // If no topic-specific quotes, use general quotes
        const finalQuotes = allRelevantQuotes.length > 0 ? 
          allRelevantQuotes.slice(0, 5) : 
          betterData.quotes.slice(0, 5);
        
        updates.push({
          id: person.id,
          name: betterData.name || person.name,
          username: betterData.username,
          quotes: finalQuotes,
          updated_at: new Date().toISOString()
        });
        
        console.log(`✅ Updated ${betterData.name || person.name} with ${finalQuotes.length} relevant quotes`);
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
          console.error(`❌ Error updating ${update.name}:`, updateError);
        }
      }
    }
    
    console.log(`✅ Successfully updated ${updates.length} people with comprehensive quotes`);
    
    // Show sample improved quotes
    console.log('\n📝 Sample improved quotes:');
    const sampleUpdates = updates.slice(0, 3);
    for (const update of sampleUpdates) {
      console.log(`\n👤 ${update.name} (@${update.username}):`);
      update.quotes.forEach((quote, index) => {
        console.log(`  ${index + 1}. "${quote}"`);
      });
    }
    
  } catch (error) {
    console.error('Error in updateComprehensiveQuotes:', error);
  }
}

// Run the script
updateComprehensiveQuotes().catch(console.error); 