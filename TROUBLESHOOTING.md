# Gemini API Key Troubleshooting Guide

If your Gemini API key is not working, follow these steps to diagnose and fix the issue:

## 1. Check API Key Format

Your API key should:
- Start with "AIza"
- Not have any extra spaces or line breaks
- Be approximately 39 characters long

Current format in your .env file:
```
VITE_GEMINI_API_KEY=AIzaSyB_zRULmWN-bUX0cTqfukpOfAF7eM-i9_Y
```

## 2. Test Your API Key Directly

The most reliable way to test your API key is using the Node.js test script:

```
cd api-test-tools
npm install
npm run test-key
```

This script bypasses browser CORS issues and tells you exactly what's happening with your API key.

## 3. Common API Key Problems

### Browser CORS Issues
- Browser security prevents direct API calls to Gemini
- Solution: Use a backend proxy server

### API Key Permissions
- Make sure your API key has access to the Gemini API
- Check if you enabled the correct API in Google Cloud Console

### API Key Rate Limits
- New API keys may have usage limitations
- Check if you've hit any quotas or limits

### Environment Variable Loading
- Vite requires VITE_ prefix for environment variables
- Vite requires a restart when changing environment variables

## 4. Use the Proxy Server Solution

For a reliable solution:

```
cd api-test-tools
npm install
npm run server
```

Then open http://localhost:3000 to test your API key through a server.

## 5. Proper Backend Implementation

In a real application, you should:
1. Keep your API key on a server, never in browser code
2. Create a backend endpoint that calls Gemini API
3. Have your frontend call your own backend API

This is the most secure and reliable approach.

## Need More Help?

- Check the [Google AI Studio documentation](https://ai.google.dev/docs)
- Verify your API key in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- Try creating a new API key if all else fails
