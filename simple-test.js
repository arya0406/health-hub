// simple-test.js - An even simpler script to test your Gemini API key
// Run this with: node simple-test.js
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read API key directly from .env file
let apiKeyFromEnv;
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  const match = envContent.match(/VITE_GEMINI_API_KEY=([^\r\n]+)/);
  if (match && match[1]) {
    apiKeyFromEnv = match[1];
  }
} catch (err) {
  console.log('Could not read .env file:', err.message);
}

// Get API key from command line argument or environment or .env file
const apiKey = process.argv[2] || process.env.VITE_GEMINI_API_KEY || apiKeyFromEnv;
// Updated to use gemini-1.5-pro model which is available in the API
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";

// Display usage instructions if no API key provided
if (!apiKey) {
  console.log('No API key provided. Use one of these methods:');
  console.log('1. Set VITE_GEMINI_API_KEY in your .env file');
  console.log('2. Pass the API key as an argument: node simple-test.js YOUR_API_KEY');
  process.exit(1);
}

console.log(`Testing Gemini API with key: ${apiKey.substring(0, 6)}...`);

// Simple test payload
const payload = {
  contents: [
    {
      parts: [{ text: "Hello, this is a test message. Respond with a short greeting." }]
    }
  ],
  generationConfig: {
    maxOutputTokens: 30,
    temperature: 0.7
  }
};

// Make the API request
fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
.then(response => {
  console.log('Response status:', response.status, response.statusText);
  return response.json();
})
.then(data => {
  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    console.log('✅ SUCCESS! API key is valid.');
    console.log('Response:', data.candidates[0].content.parts[0].text);
  } else if (data.error) {
    console.error('❌ ERROR: API key test failed.');
    console.error('Error message:', data.error.message);
    console.error('Error details:', JSON.stringify(data.error, null, 2));
  } else {
    console.error('❌ ERROR: Unexpected response format.');
    console.error('Response:', JSON.stringify(data, null, 2));
  }
})
.catch(error => {
  console.error('❌ ERROR: Request failed.');
  console.error('Error:', error.message);
});
