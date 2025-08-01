require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to load and parse Twitter archive JS files
function loadTwitterArchive(filename, key) {
  const filePath = path.join(__dirname, '../demo-data', filename);
  const raw = fs.readFileSync(filePath, 'utf8');
  const jsonStr = raw.replace(/^window\.YTD\.[^.]+\.part\d+ = /, '');
  return JSON.parse(jsonStr);
}

function extractBetterQuotes(tweets) {
  const userQuotes = {};
  
  tweets.forEach(entry => {
    const tweet = entry.tweet;
    
    // Extract mentions to get usernames (include retweets too)
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
            likeCount: 0
          };
        }
        
        // Add the actual tweet content as a quote (clean it up)
        let cleanText = tweet.full_text;
        
        // Remove URLs
        cleanText = cleanText.replace(/https?:\/\/\S+/g, '');
        
        // Remove RT prefixes but keep the content
        cleanText = cleanText.replace(/^RT @\w+:\s*/, '');
        
        // Clean up extra whitespace
        cleanText = cleanText.trim();
        
        if (cleanText.length > 10 && !userQuotes[userId].quotes.includes(cleanText)) {
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

function extractUserActivity(tweets) {
  const userActivity = {};
  
  tweets.forEach(entry => {
    const tweet = entry.tweet;
    
    // Track who the user interacts with
    if (tweet.entities && tweet.entities.user_mentions) {
      tweet.entities.user_mentions.forEach(mention => {
        const userId = mention.id_str;
        if (!userActivity[userId]) {
          userActivity[userId] = {
            mentions: 0,
            retweets: 0,
            likes: 0,
            lastActivity: null
          };
        }
        
        userActivity[userId].mentions++;
        
        // Check if this is a retweet
        if (tweet.retweeted || tweet.full_text.startsWith('RT @')) {
          userActivity[userId].retweets++;
        }
        
        // Track activity date
        const tweetDate = new Date(tweet.created_at);
        if (!userActivity[userId].lastActivity || tweetDate > userActivity[userId].lastActivity) {
          userActivity[userId].lastActivity = tweetDate;
        }
      });
    }
  });
  
  return userActivity;
}

async function improveDataQuality() {
  console.log('🔄 Improving data quality...');
  
  try {
    // Load tweets
    const tweets = loadTwitterArchive('tweets.js', 'tweet');
    console.log(`📊 Loaded ${tweets.length} tweets`);
    
    // Extract better quotes and usernames
    const userQuotes = extractBetterQuotes(tweets);
    console.log(`👥 Found ${Object.keys(userQuotes).length} users with quotes`);
    
    // Extract user activity
    const userActivity = extractUserActivity(tweets);
    console.log(`📈 Extracted activity data for ${Object.keys(userActivity).length} users`);
    
    // Get existing people from Supabase
    const { data: existingPeople, error } = await supabase
      .from('people')
      .select('*')
      .eq('user_email', 'demo@mira.com');
    
    if (error) {
      console.error('Error fetching existing people:', error);
      return;
    }
    
    console.log(`📋 Found ${existingPeople.length} existing people in database`);
    
    // Update people with better data
    const updates = [];
    
    existingPeople.forEach(person => {
      const userId = person.account_id;
      const betterData = userQuotes[userId];
      const activityData = userActivity[userId];
      
      if (betterData) {
        // Update with better quotes and username
        updates.push({
          id: person.id,
          name: betterData.name || person.name,
          username: betterData.username, // Add username field
          quotes: betterData.quotes.slice(0, 5), // Keep top 5 quotes
          updated_at: new Date().toISOString()
        });
        
        console.log(`✅ Updated ${betterData.name || userId} with ${betterData.quotes.length} quotes`);
      }
    });
    
    // Batch update the database
    if (updates.length > 0) {
      const { data, error } = await supabase
        .from('people')
        .upsert(updates, { onConflict: 'id' });
      
      if (error) {
        console.error('Error updating people:', error);
      } else {
        console.log(`✅ Successfully updated ${updates.length} people with better data`);
      }
    }
    
    // Show some examples of improved data
    console.log('\n📝 Sample improved quotes:');
    Object.values(userQuotes).slice(0, 3).forEach(user => {
      console.log(`\n👤 ${user.name} (@${user.username}):`);
      user.quotes.slice(0, 2).forEach((quote, i) => {
        console.log(`  ${i + 1}. "${quote.substring(0, 100)}${quote.length > 100 ? '...' : ''}"`);
      });
    });
    
  } catch (error) {
    console.error('Error improving data quality:', error);
  }
}

// Run the improvement
improveDataQuality().catch(console.error); 