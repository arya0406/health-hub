// src/services/ProxyGeminiService.js
// This service provides a direct implementation for testing purposes

/**
 * IMPORTANT: This approach with direct API calls from the browser may not work due to CORS restrictions.
 * In a production environment, you should use a backend proxy server.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Updated to use Gemini 1.5 Pro model with the correct API version
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";

/**
 * Direct implementation of the Gemini API call - may face CORS issues
 * @param {string} prompt - The user's question or prompt
 * @returns {Promise<string>} - The AI response
 */
export const getProxyGeminiResponse = async (prompt) => {
  try {
    console.log("Sending direct request to Gemini API...");
    
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
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Parse the response
    const data = await response.json();
    
    // Extract the text response
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else if (data.error) {
      console.error("Gemini API error:", data.error);
      
      // If there's a CORS error, provide a helpful message
      if (data.error.message?.includes("CORS") || 
          response.headers.get("Access-Control-Allow-Origin") === null) {
        return `CORS Error: The browser prevented direct access to the Gemini API for security reasons. 
                Please implement a backend proxy server as described in the TROUBLESHOOTING.md file.`;
      }
      
      return `API Error: ${data.error.message || "Unknown error"}`;
    } else {
      console.error("Unexpected response format:", data);
      return "I'm sorry, I couldn't process your request. Please try again later.";
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    // Special handling for CORS errors
    if (error.message?.includes("CORS") || error.name === "TypeError") {
      return `CORS Error: The browser prevented direct access to the Gemini API for security reasons.
              This is expected behavior. Please try using the Node.js test script or implementing a backend proxy server.`;
    }
    
    return "There was an error processing your request. Please check the console for details.";
  }
};

/**
 * Better Implementation Strategy:
 * 
 * The code above attempts a direct API call but will likely fail due to CORS restrictions.
 * Here's how to properly implement this with a proxy server:
 * 
 * 1. Set up a simple Express server (see d:\my-app\server.js)
 * 2. Start it with: node server.js
 * 3. Update this service to call your local server instead:
 * 
 * export const getProxyGeminiResponse = async (prompt) => {
 *   try {
 *     const response = await fetch('http://localhost:3000/api/gemini', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ prompt })
 *     });
 *     const data = await response.json();
 *     return data.response;
 *   } catch (error) {
 *     console.error("Error:", error);
 *     return "There was an error processing your request.";
 *   }
 * };
 */

// Alternative: Use this function to try both direct and proxy approaches
export const tryBothApproaches = async (prompt) => {
  try {
    // Try direct API call first
    return await getProxyGeminiResponse(prompt);
  } catch (error) {
    console.log("Direct API call failed, trying proxy server...");
    
    try {
      // If direct call fails, try the proxy server
      const response = await fetch('http://localhost:3000/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      return data.response;
    } catch (proxyError) {
      console.error("Proxy server error:", proxyError);
      return "Both direct API call and proxy server failed. Please check your setup.";
    }
  }
};
