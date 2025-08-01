require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to load and parse Twitter archive JS files
function loadTwitterArchive(filename, key) {
  const filePath = path.join(__dirname, '../demo-data', filename);
  const raw = fs.readFileSync(filePath, 'utf8');
  const jsonStr = raw.replace(/^window\.YTD\.[^.]+\.part\d+ = /, '');
  return JSON.parse(jsonStr);
}

async function parseTwitterData() {
  console.log('Parsing Twitter data...');
  // Followers
  const followers = loadTwitterArchive('follower.js', 'follower');
  // Following
  const following = loadTwitterArchive('following.js', 'following');
  // Tweets (first 100 for demo)
  const tweets = loadTwitterArchive('tweets.js', 'tweet').slice(0, 100);

  // Build people map
  const people = {};

  // Add followers
  followers.forEach(entry => {
    const acc = entry.follower.accountId;
    if (!people[acc]) people[acc] = { accountId: acc, type: 'follower', quotes: [], following: false };
  });
  // Add following
  following.forEach(entry => {
    const acc = entry.following.accountId;
    if (!people[acc]) people[acc] = { accountId: acc, type: 'following', quotes: [], following: true };
    else people[acc].following = true;
  });
  // Parse tweets for quotes and mentions
  tweets.forEach(entry => {
    const tweet = entry.tweet;
    // Add quote to self (demo user)
    if (!people['self']) people['self'] = { accountId: 'self', type: 'self', quotes: [], following: false };
    people['self'].quotes.push(tweet.full_text);
    // Mentions
    if (tweet.entities && tweet.entities.user_mentions) {
      tweet.entities.user_mentions.forEach(mention => {
        const acc = mention.id_str;
        if (!people[acc]) people[acc] = { accountId: acc, type: 'mentioned', quotes: [], following: false };
        people[acc].quotes.push(`Mentioned in: ${tweet.full_text}`);
      });
    }
  });

  console.log(`Parsed ${Object.keys(people).length} people from Twitter data.`);
  return people;
}

async function saveToSupabase(twitterPeople) {
  console.log('Saving Twitter data to Supabase...');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('Supabase credentials not configured. Skipping database save.');
    return;
  }

  try {
    // Prepare data for Supabase
    const peopleData = Object.values(twitterPeople).map(person => ({
      user_email: 'demo@mira.com',
      account_id: person.accountId,
      name: person.name || `User ${person.accountId}`,
      type: person.type,
      source: 'twitter',
      quotes: person.quotes.slice(0, 5), // Limit to 5 quotes
      following: person.following || false,
      created_at: new Date().toISOString()
    }));

    console.log(`Attempting to save ${peopleData.length} people to Supabase...`);

    // Upsert to Supabase
    const { data, error } = await supabase
      .from('people')
      .upsert(peopleData, { onConflict: 'user_email,account_id' });

    if (error) {
      console.error('Error saving to Supabase:', error);
      console.log('\n💡 Try disabling RLS on the people table in Supabase dashboard');
    } else {
      console.log(`✅ Successfully saved ${peopleData.length} people to Supabase!`);
      console.log('📊 Data is now available for demo@mira.com account');
    }
  } catch (error) {
    console.error('Error in saveToSupabase:', error);
  }
}

async function main() {
  console.log('🚀 Starting Twitter data ingestion for demo@mira.com...\n');
  
  const twitterPeople = await parseTwitterData();
  await saveToSupabase(twitterPeople);
  
  console.log('\n✅ Twitter data ingestion complete!');
  console.log(`📊 Total people found: ${Object.keys(twitterPeople).length}`);
}

main().catch(console.error); 