// test-api-key.mjs - A simple ES module script to test your Gemini API key
// Run this with: node test-api-key.mjs
// First make sure to run: npm install dotenv node-fetch

try {
  // Try to load dotenv package
  import('dotenv/config').catch(err => {
    console.log("Warning: dotenv package not found. Will use API key directly from process.env.");
    // If not available, we'll use environment variables directly
  });
} catch (err) {
  // Ignore errors, we'll fall back to direct environment variables
}

// Use dynamic import for node-fetch to handle potential missing module
let fetch;
try {
  const fetchModule = await import('node-fetch');
  fetch = fetchModule.default;
} catch (err) {
  console.error("Error: node-fetch package is required but not found.");
  console.error("Please run: npm install node-fetch");
  process.exit(1);
}

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
// Updated to use Gemini 1.0 Pro model with the correct API version
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent";

async function testApiKey() {
  console.log('Testing Gemini API Key...');
  console.log(`API Key: ${GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 6) + '...' : 'NOT FOUND'}`);
  
  if (!GEMINI_API_KEY) {
    console.error('❌ ERROR: API key not found in environment variables.');
    console.log('Make sure you have a .env file with VITE_GEMINI_API_KEY=your_api_key_here');
    return;
  }
  
  try {
    // Simple test payload
    const payload = {
      contents: [
        {
          parts: [{ text: "Hello, this is a test message. Please respond with a simple greeting." }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 30,
        temperature: 0.7
      }
    };
    
    console.log('Sending test request to Gemini API...');
    console.log('API URL:', GEMINI_API_URL);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status, response.statusText);
    
    if (response.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      console.log('✅ SUCCESS! API key is valid.');
      console.log('Response:', data.candidates[0].content.parts[0].text);
    } else if (data.error) {
      console.error('❌ ERROR: API key test failed.');
      console.error('Error message:', data.error.message);
      console.error('Error details:', JSON.stringify(data.error, null, 2));
      
      if (data.error.status === 'INVALID_ARGUMENT') {
        console.log('\n🔍 This looks like an API key format issue. Make sure your key is copied correctly.');
      } else if (data.error.status === 'PERMISSION_DENIED') {
        console.log('\n🔍 This looks like a permissions issue. Make sure your API key has access to the Gemini API.');
      } else if (data.error.status === 'UNAUTHENTICATED') {
        console.log('\n🔍 This looks like an authentication issue. Your API key might be invalid or expired.');
      }
    } else {
      console.error('❌ ERROR: Unexpected response format.');
      console.error('Response:', JSON.stringify(data).substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ ERROR: Failed to test API key.');
    console.error('Error:', error.message);
  }
}

testApiKey();
