import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import debugBuild from './utils/debugBuild';

// Run debug info in production
if (import.meta.env.PROD) {
  debugBuild();
}

// Simple error handling for production
const handleErrors = () => {
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: sans-serif;">
        <h1>Something went wrong</h1>
        <p>The application encountered an error. Please try refreshing the page.</p>
        <pre style="text-align: left; background: #f1f1f1; padding: 10px; overflow: auto; max-width: 100%;">
          ${event.error ? event.error.toString() : 'Unknown error'}
        </pre>
      </div>
    `;
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
};

// Initialize error handling
handleErrors();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
