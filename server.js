// server.js - A simple Express server to proxy Gemini API requests
// Run this with: node server.js
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
// Updated to use Gemini 1.5 Pro model with the correct API version
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";

// API endpoint to proxy requests to Gemini
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Build the request payload
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You are a helpful health assistant. Answer the following health-related question with practical suggestions for prevention and management. Provide specific, actionable advice in simple language. Keep your response brief (3-4 sentences) and focus on home remedies, lifestyle changes, and self-care tips when appropriate. Avoid simply telling the user to "see a doctor" unless it's a clear emergency: ${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 300,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    console.log(`Making request to Gemini API with prompt: ${prompt.substring(0, 30)}...`);
    
    // Make the API request using the server's stored API key
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    // Extract and return the response text
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const result = data.candidates[0].content.parts[0].text;
      console.log("Successful API response received");
      res.json({ response: result });
    } else if (data.error) {
      console.error("Gemini API error:", data.error);
      res.status(500).json({ error: data.error.message || "Unknown error" });
    } else {
      console.error("Unexpected response format");
      res.status(500).json({ error: "Unexpected response format" });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to verify the API key
app.get('/api/test-key', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.json({ valid: false, message: "API key not found in environment" });
    }
    
    // Make a simple test request to Gemini API
    const testPayload = {
      contents: [
        {
          parts: [{ text: "Hello, this is a test message." }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 10,
      }
    };
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload),
    });
    
    const data = await response.json();
    
    if (response.ok && data.candidates) {
      res.json({ 
        valid: true, 
        message: "API key is valid",
        statusCode: response.status
      });
    } else {
      res.json({ 
        valid: false, 
        message: data.error?.message || "API request failed",
        statusCode: response.status,
        error: data.error
      });
    }
  } catch (error) {
    res.json({ valid: false, message: error.message });
  }
});

// Serve the test HTML page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Gemini API Key Tester</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .result { white-space: pre-wrap; background: #f1f1f1; padding: 15px; margin-top: 15px; border-radius: 5px; }
        button { padding: 10px 15px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; }
        input, textarea { width: 100%; padding: 10px; margin: 10px 0; }
        .status { margin-top: 20px; }
        .error { color: #d32f2f; }
        .success { color: #388e3c; }
      </style>
    </head>
    <body>
      <h1>Gemini API Key Tester</h1>
      
      <h2>1. Test Your API Key</h2>
      <button id="testKey">Test API Key</button>
      <div id="keyStatus" class="status"></div>
      
      <h2>2. Test a Health Question</h2>
      <textarea id="prompt" rows="4" placeholder="Enter a health-related question...">What are common symptoms of the flu?</textarea>
      <button id="sendPrompt">Send Question</button>
      <div id="responseResult" class="result" style="display: none;"></div>
      
      <script>
        document.getElementById('testKey').addEventListener('click', async () => {
          const keyStatus = document.getElementById('keyStatus');
          keyStatus.innerHTML = 'Testing API key...';
          
          try {
            const response = await fetch('/api/test-key');
            const data = await response.json();
            
            if (data.valid) {
              keyStatus.innerHTML = '<div class="success">✅ Success! Your API key is valid.</div>';
            } else {
              keyStatus.innerHTML = '<div class="error">❌ API key error: ' + data.message + '</div>';
              if (data.error) {
                keyStatus.innerHTML += '<div class="error">Details: ' + JSON.stringify(data.error) + '</div>';
              }
            }
          } catch (error) {
            keyStatus.innerHTML = '<div class="error">❌ Error testing API key: ' + error.message + '</div>';
          }
        });
        
        document.getElementById('sendPrompt').addEventListener('click', async () => {
          const prompt = document.getElementById('prompt').value;
          const responseResult = document.getElementById('responseResult');
          
          if (!prompt) {
            alert('Please enter a question');
            return;
          }
          
          responseResult.style.display = 'block';
          responseResult.textContent = 'Sending request...';
          
          try {
            const response = await fetch('/api/gemini', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt })
            });
            
            const data = await response.json();
            
            if (data.response) {
              responseResult.textContent = data.response;
            } else {
              responseResult.textContent = 'Error: ' + data.error;
            }
          } catch (error) {
            responseResult.textContent = 'Error: ' + error.message;
          }
        });
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API key status: ${GEMINI_API_KEY ? 'Found in environment' : 'NOT FOUND'}`);
});
