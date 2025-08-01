require('dotenv').config();
const https = require('https');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API...');
  console.log('🔑 API Key:', GEMINI_API_KEY.substring(0, 10) + '...');
  
  const postData = JSON.stringify({
    contents: [{
      parts: [{
        text: "Hello, can you respond with 'API is working' if you receive this message?"
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 100,
    }
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
        console.log('📡 Response status:', res.statusCode);
        console.log('📡 Response headers:', res.headers);
        
        try {
          const jsonData = JSON.parse(data);
          
          if (res.statusCode !== 200) {
            console.error('❌ API Error:', jsonData);
            resolve(false);
          } else if (jsonData.error) {
            console.error('❌ Gemini API error:', jsonData.error);
            resolve(false);
          } else {
            console.log('✅ Gemini API response:', jsonData.candidates[0].content.parts[0].text);
            resolve(true);
          }
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

testGeminiAPI().then(success => {
  if (success) {
    console.log('🎉 Gemini API is working correctly!');
  } else {
    console.log('❌ Gemini API test failed');
  }
}).catch(console.error); 