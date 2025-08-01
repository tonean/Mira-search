# 🐦 Live Twitter Data Collection System

This system adds **real-time Twitter data collection** to enhance user profiles with current, authentic Twitter activity without requiring the Twitter API.

## 🚀 Features

### **Live Data Collection:**
- **Recent Tweets** (up to 100 per user)
- **Profile Information** (bio, followers, location, verification)
- **Tweet Content Analysis** (original tweets vs retweets)
- **Engagement Metrics** (likes, retweets per tweet)

### **AI-Powered Analysis:**
- **Profile Overview** based on actual tweet content
- **Expertise Areas** from topics discussed
- **Key Achievements** mentioned in tweets
- **Personality Traits** from communication style
- **Main Topics** they tweet about
- **Personalized Connection Messages**

### **Database Integration:**
- Seamlessly updates existing user profiles
- Adds new columns for live data
- Tracks when users were last updated
- Stores tweet content for search functionality

## 🛠️ Setup

### **1. Install Dependencies**
```bash
cd mira-ui/backend
node setup_live_collection.js
```

This will:
- Install `snscrape` (free Twitter data collection tool)
- Add required database columns
- Test the installation

### **2. Manual Installation (if needed)**
```bash
# Install snscrape manually
pip3 install snscrape

# Or with pip
pip install snscrape

# Test installation
snscrape --help
```

## 📋 Usage

### **Collect All Users (Batch)**
```bash
node live_twitter_collector.js
```
- Finds users that haven't been live-collected
- Processes up to 10 users at a time
- Adds 3-second delays between requests
- Updates database with results

### **Test Single User**
```bash
node test_live_collection.js username
node test_live_collection.js elonmusk
```
- Tests data collection for a specific user
- Shows sample tweets and AI analysis
- Updates database if successful

### **Programmatic Usage**
```javascript
const { updateUserWithLiveData } = require('./live_twitter_collector');

// Update a single user
await updateUserWithLiveData('username');

// Update multiple users
const { updateMultipleUsersWithLiveData } = require('./live_twitter_collector');
await updateMultipleUsersWithLiveData(['user1', 'user2'], 5000);
```

## 🗄️ Database Schema

### **New Columns Added:**
```sql
live_collected_at TIMESTAMP        -- When user was last updated
live_tweet_count INTEGER         -- Number of tweets collected
ai_communication_style TEXT      -- How they communicate
ai_main_topics TEXT[]           -- Main topics they discuss
bio TEXT                        -- Twitter bio
location TEXT                   -- Location from profile
verified BOOLEAN                -- Verification status
```

### **Updated Columns:**
- `ai_profile_overview` - Enhanced with live data
- `ai_expertise_areas` - Based on recent tweets
- `ai_key_achievements` - From actual tweet content
- `quotes` - Recent tweets for search functionality

## 🔍 How It Works

### **Step 1: Web Data Collection**
```bash
snscrape --jsonl --max-results 100 twitter-user username
```
- Uses `snscrape` to fetch recent tweets
- No API keys required
- Respects rate limits
- Gets both tweets and profile data

### **Step 2: AI Analysis**
- Sends tweet content to Gemini AI
- Analyzes communication style and topics
- Extracts expertise areas and interests
- Generates personalized connection messages

### **Step 3: Database Update**
- Updates user profile with live data
- Stores tweets as searchable quotes
- Tracks collection timestamp
- Maintains data freshness

## 📊 Example Output

### **Before (Generic):**
```
Profile: "John is a professional with expertise in their field"
Expertise: ["Professional Background"]
```

### **After (Live Data):**
```
Profile: "John is a robotics engineer specializing in autonomous systems and AI integration. He frequently shares insights about cutting-edge robotics research and practical implementation challenges."
Expertise: ["Robotics Engineering", "Autonomous Systems", "AI Integration", "Research & Development"]
Topics: ["Robotics", "Artificial Intelligence", "Automation", "Technology Innovation"]
```

## ⚡ Performance & Limits

### **Collection Limits:**
- **100 tweets per user** (configurable)
- **3-second delays** between users
- **10 users per batch** (configurable)
- **Respectful rate limiting**

### **AI Analysis:**
- Uses `gemini-1.5-flash` (faster, cheaper)
- **800 token limit** per analysis
- **Robust error handling**
- **JSON parsing with fallbacks**

## 🔒 Privacy & Ethics

### **Respectful Data Collection:**
- Only public tweets and profiles
- Reasonable delays between requests
- No aggressive collection patterns
- Respects Twitter's robots.txt

### **Data Handling:**
- Only stores necessary data
- Users can opt-out anytime
- Data can be deleted on request
- No personal/private information

## 🚨 Troubleshooting

### **snscrape Not Found:**
```bash
pip3 install snscrape
# Or try: pip install snscrape
```

### **Database Errors:**
- Check environment variables in `.env`
- Ensure Supabase connection is working
- Verify database permissions

### **No Tweets Found:**
- User might be private
- Username might not exist
- Twitter might be rate limiting
- Try again later

### **AI Analysis Failed:**
- Check Gemini API key
- Verify API quota
- Check network connection
- Review tweet content quality

## 🔄 Automation

### **Cron Job (Daily Updates):**
```bash
# Add to crontab
0 2 * * * cd /path/to/mira-ui/backend && node live_twitter_collector.js
```

### **Webhook Integration:**
```javascript
// Trigger data collection when new users are added
app.post('/webhook/new-user', async (req, res) => {
  const { username } = req.body;
  await updateUserWithLiveData(username);
  res.json({ success: true });
});
```

## 📈 Benefits

### **For Users:**
- **Authentic profiles** based on real activity
- **Current information** from recent tweets
- **Better matching** with relevant connections
- **Personalized outreach** suggestions

### **For the Platform:**
- **Higher quality** user profiles
- **Better search results** with real content
- **Improved AI matching** accuracy
- **Reduced generic content**

## 🎯 Next Steps

1. **Run Setup:** `node setup_live_collection.js`
2. **Test Single User:** `node test_live_collection.js username`
3. **Run Batch Update:** `node live_twitter_collector.js`
4. **Monitor Results** in the application
5. **Set up Automation** for regular updates

---

**🎉 Your user profiles will now be powered by real, current Twitter data instead of generic templates!** 