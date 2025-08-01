require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const readline = require('readline');

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI || 'http://localhost';

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

async function authenticateGmail() {
  console.log('Setting up Gmail authentication...');
  
  const oauth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REDIRECT_URI
  );

  // Check if we have a saved token
  const tokenPath = path.join(__dirname, 'gmail_token.json');
  let tokens;
  
  try {
    if (fs.existsSync(tokenPath)) {
      tokens = JSON.parse(fs.readFileSync(tokenPath));
      oauth2Client.setCredentials(tokens);
      console.log('Using saved Gmail token...');
    } else {
      // Get new token
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.readonly'],
      });

      console.log('\n🔐 Gmail Authentication Required');
      console.log('Please visit this URL to authorize the app:');
      console.log(authUrl);
      console.log('\nAfter authorization, you will get a code. Please paste it here:');

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const code = await new Promise((resolve) => {
        rl.question('Enter the authorization code: ', resolve);
      });
      rl.close();

      const { tokens: newTokens } = await oauth2Client.getToken(code);
      tokens = newTokens;
      
      // Save token for future use
      fs.writeFileSync(tokenPath, JSON.stringify(tokens));
      console.log('Gmail token saved for future use.');
    }

    return oauth2Client;
  } catch (error) {
    console.error('Gmail authentication failed:', error.message);
    return null;
  }
}

async function fetchGmailData(oauth2Client) {
  if (!oauth2Client) {
    console.log('Skipping Gmail data fetch due to authentication failure.');
    return {};
  }

  console.log('Fetching Gmail data...');
  
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const people = {};

  try {
    // Fetch recent emails (last 100)
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 100,
    });

    const messages = response.data.messages || [];
    console.log(`Found ${messages.length} emails to process...`);

    for (const message of messages.slice(0, 50)) { // Process first 50 for demo
      try {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date']
        });

        const headers = email.data.payload.headers;
        const from = headers.find(h => h.name === 'From')?.value;
        const to = headers.find(h => h.name === 'To')?.value;
        const subject = headers.find(h => h.name === 'Subject')?.value;
        const date = headers.find(h => h.name === 'Date')?.value;

        if (from) {
          const emailMatch = from.match(/<(.+?)>/);
          const emailAddress = emailMatch ? emailMatch[1] : from;
          const nameMatch = from.match(/^([^<]+)/);
          const name = nameMatch ? nameMatch[1].trim() : emailAddress;

          if (!people[emailAddress]) {
            people[emailAddress] = {
              accountId: emailAddress,
              type: 'email_contact',
              name: name,
              quotes: [],
              following: false,
              source: 'gmail'
            };
          }

          if (subject) {
            people[emailAddress].quotes.push(`Email subject: ${subject}`);
          }
        }
      } catch (error) {
        console.log(`Error processing email ${message.id}:`, error.message);
      }
    }

    console.log(`Extracted ${Object.keys(people).length} people from Gmail data.`);
    return people;
  } catch (error) {
    console.error('Error fetching Gmail data:', error.message);
    return {};
  }
}

async function saveToSupabase(twitterPeople, gmailPeople) {
  console.log('Saving data to Supabase...');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('Supabase credentials not configured. Skipping database save.');
    return;
  }

  try {
    // Combine all people data
    const allPeople = { ...twitterPeople, ...gmailPeople };
    
    // Prepare data for Supabase
    const peopleData = Object.values(allPeople).map(person => ({
      user_email: 'demo@mira.com',
      account_id: person.accountId,
      name: person.name || `User ${person.accountId}`,
      type: person.type,
      source: person.source || 'twitter',
      quotes: person.quotes.slice(0, 5), // Limit to 5 quotes
      following: person.following || false,
      created_at: new Date().toISOString()
    }));

    // Upsert to Supabase
    const { data, error } = await supabase
      .from('people')
      .upsert(peopleData, { onConflict: 'user_email,account_id' });

    if (error) {
      console.error('Error saving to Supabase:', error);
    } else {
      console.log(`Successfully saved ${peopleData.length} people to Supabase.`);
    }
  } catch (error) {
    console.error('Error in saveToSupabase:', error);
  }
}

async function main() {
  console.log('🚀 Starting data ingestion for demo@mira.com...\n');
  
  const twitterPeople = await parseTwitterData();
  const oauth2Client = await authenticateGmail();
  const gmailPeople = await fetchGmailData(oauth2Client);
  
  await saveToSupabase(twitterPeople, gmailPeople);
  
  console.log('\n✅ Data ingestion complete!');
  console.log(`📊 Total people found: ${Object.keys({...twitterPeople, ...gmailPeople}).length}`);
}

main().catch(console.error); 