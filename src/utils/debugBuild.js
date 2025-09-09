/**
 * Utility function to log debug information in production build
 */
const debugBuild = () => {
  console.log('=== DEBUG INFO ===');
  console.log('App Version: 1.0.0');
  console.log('Environment:', import.meta.env.MODE);
  console.log('Base URL:', import.meta.env.BASE_URL);
  console.log('Gemini API Key exists:', !!import.meta.env.VITE_GEMINI_API_KEY);
  console.log('=================');
  
  // Check for common errors
  window.addEventListener('error', (event) => {
    console.error('GLOBAL ERROR CAUGHT:', event.error);
  });
  
  // Check for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('UNHANDLED PROMISE REJECTION:', event.reason);
  });
};

export default debugBuild;
