import { useState } from "react";
import "./auth.css";

function Login({ onLogin, switchToSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Dummy credentials for testing
  const dummyCredentials = {
    username: "user",
    password: "password123"
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Check if the username and password match the dummy credentials
    if (username === dummyCredentials.username && password === dummyCredentials.password) {
      // Login successful
      onLogin({ username });
    } else {
      // Login failed
      setError("Invalid username or password");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" width="36" height="36">
              <path
                fill="#2563EB"
                d="M20 8H4V6h16v2m-2-6H6v2h12V2m4 10v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2m-6 4l-6-3l-6 3v4l6-3l6 3v-4Z"
              />
            </svg>
          </div>
          <div className="logo-text">
            <h1>Health Hub</h1>
            <h2>Chatbot</h2>
          </div>
        </div>
        
        <h2 className="auth-title">Log In</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="auth-button">Log In</button>
        </form>
        
        <div className="auth-switch">
          Don't have an account?{" "}
          <button onClick={switchToSignup} className="switch-button">
            Sign Up
          </button>
        </div>
        
        <div className="auth-help">
          <small>Demo credentials: username: "user", password: "password123"</small>
        </div>
      </div>
    </div>
  );
}

export default Login;
