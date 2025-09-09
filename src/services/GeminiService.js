// GeminiService.js
// This service handles all interactions with the Gemini API

// Debug environment variable access
console.log("Environment variables available:", Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
console.log("VITE_GEMINI_API_KEY exists:", import.meta.env.VITE_GEMINI_API_KEY ? "Yes" : "No");

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Updated to use Gemini 1.5 Pro model which is available in the API
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";

/**
 * Send a prompt to the Gemini API and get a response
 * @param {string} prompt - The user's question or prompt
 * @returns {Promise<string>} - The AI response
 */
export const getGeminiResponse = async (prompt) => {
  try {
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

    // Make the API request
    console.log("Sending request to Gemini API...");
    const apiUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    
    // Debug the request
    console.log("API URL:", apiUrl.replace(GEMINI_API_KEY, "API_KEY_HIDDEN"));
    console.log("Request payload:", JSON.stringify(payload).substring(0, 200) + "...");
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("Response status:", response.status, response.statusText);
    
    // Parse the response
    const data = await response.json();
    
    // Extract the text response
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const result = data.candidates[0].content.parts[0].text;
      console.log("Successful API response received");
      return result;
    } else if (data.error) {
      console.error("Gemini API error:", data.error);
      
      // Check for specific API key errors
      if (data.error.status === "INVALID_ARGUMENT" || 
          data.error.status === "PERMISSION_DENIED" || 
          data.error.message?.includes("API key")) {
        console.error("This appears to be an API key issue. Please check your API key.");
        return `API key error: ${data.error.message}. Please check your API key in the .env file.`;
      }
      
      return `I'm sorry, I encountered an error: ${data.error.message || "Unknown error"}`;
    } else {
      console.error("Unexpected response format:", JSON.stringify(data).substring(0, 200));
      return "I'm sorry, I couldn't process your request. Please try again later.";
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error.message);
    
    // Network errors often indicate API key or CORS issues
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      console.error("Network error - this could be due to API key issues or CORS restrictions");
      return "There was a network error connecting to the AI service. Please check your API key and internet connection.";
    }
    
    return "I'm sorry, there was an error processing your request. Please check your API key and try again.";
  }
};

/**
 * Check if the API key is valid
 * @returns {Promise<boolean>} - True if API key is valid
 */
export const validateApiKey = async () => {
  console.log("Current API key:", GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 6)}...` : "Not set");
  
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    console.error("API key not set or using default placeholder value");
    return false;
  }
  
  try {
    console.log("Validating API key with Gemini API...");
    
    // First check if we can make a request to the API
    const testUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    console.log("Testing API endpoint:", testUrl.replace(GEMINI_API_KEY, "API_KEY_HIDDEN"));
    
    const response = await getGeminiResponse("Hello, this is a test message.");
    console.log("Got response from API:", response.substring(0, 50) + "...");
    
    const isValid = !response.includes("error") && !response.includes("API key");
    console.log("API key validation result:", isValid ? "SUCCESS" : "FAILED");
    
    if (!isValid) {
      console.error("Response indicates an error:", response);
    }
    
    return isValid;
  } catch (error) {
    console.error("API key validation failed with exception:", error.message);
    return false;
  }
};
