// basic-test.js - An ES Module script to test your Gemini API key
// Run this with: node basic-test.js

// Read API key from .env file manually
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let GEMINI_API_KEY;

try {
  // Read .env file
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Parse the API key
  const match = envContent.match(/VITE_GEMINI_API_KEY=([^\r\n]+)/);
  if (match && match[1]) {
    GEMINI_API_KEY = match[1];
    console.log(`Found API key in .env: ${GEMINI_API_KEY.substring(0, 6)}...`);
  } else {
    throw new Error('API key not found in .env file');
  }
} catch (error) {
  console.error('Error reading .env file:', error.message);
  console.error('Please ensure you have a .env file with VITE_GEMINI_API_KEY=your_key');
  process.exit(1);
}

// Updated to use Gemini 1.0 Pro model with the correct API version
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

// URL for listing available models
const LIST_MODELS_URL = "https://generativelanguage.googleapis.com/v1/models";

// List available models first
async function listAvailableModels() {
  console.log('Listing available Gemini models...');
  try {
    const response = await fetch(`${LIST_MODELS_URL}?key=${GEMINI_API_KEY}`);
    const data = await response.json();
    
    if (response.ok && data.models) {
      console.log('✅ Available models:');
      data.models.forEach(model => {
        console.log(`- ${model.name} (${model.supportedGenerationMethods.join(', ')})`);
      });
      return data.models;
    } else if (data.error) {
      console.error('❌ ERROR: Failed to list models.');
      console.error('Error message:', data.error.message);
      return null;
    }
  } catch (error) {
    console.error('❌ ERROR: Failed to list models.');
    console.error('Error:', error.message);
    return null;
  }
}

// Test function using built-in fetch (available in newer Node.js versions)
async function testApiKey(modelName) {
  console.log(`Testing Gemini API Key with model: ${modelName}...`);
  
  // Construct the API URL with the provided model name
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent`;
  
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
    console.log('API URL:', apiUrl);
    
    const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    const data = await response.json();
    
    if (response.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      console.log('✅ SUCCESS! API key is valid.');
      console.log('Response:', data.candidates[0].content.parts[0].text);
      return true;
    } else if (data.error) {
      console.error('❌ ERROR: API key test failed.');
      console.error('Error message:', data.error.message);
      console.error('Error details:', JSON.stringify(data.error, null, 2));
      return false;
    } else {
      console.error('❌ ERROR: Unexpected response format.');
      console.error('Response:', JSON.stringify(data).substring(0, 200) + '...');
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR: Failed to test API key.');
    console.error('Error:', error.message);
    return false;
  }
}

// Main execution flow
async function main() {
  // First list available models
  const models = await listAvailableModels();
  
  if (models) {
    // Find a suitable model for testing
    // Try to find gemini-pro specifically
    const geminiProModel = models.find(model => 
      model.name.includes('gemini-pro') && 
      model.supportedGenerationMethods.includes('generateContent'));
    
    if (geminiProModel) {
      // Extract just the model name from the full path (models/gemini-pro)
      const modelName = geminiProModel.name.split('/').pop();
      console.log(`\nFound suitable model: ${modelName}`);
      await testApiKey(modelName);
    } else {
      console.log('\nNo gemini-pro model found, testing with first available model that supports generateContent');
      const firstSuitableModel = models.find(model => 
        model.supportedGenerationMethods.includes('generateContent'));
      
      if (firstSuitableModel) {
        const modelName = firstSuitableModel.name.split('/').pop();
        console.log(`Using model: ${modelName}`);
        await testApiKey(modelName);
      } else {
        console.error('No suitable models found that support generateContent method');
      }
    }
  } else {
    // Fallback to default test if we couldn't list models
    console.log('\nFalling back to default test with gemini-pro');
    await testApiKey('gemini-pro');
  }
}

main();
