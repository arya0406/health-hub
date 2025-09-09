import { useState } from "react";
import "./auth.css";

function Signup({ onSignup, switchToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // In a real app, you would send this data to a server
    // For now, just call onSignup with the user data
    onSignup({ username });
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
        
        <h2 className="auth-title">Sign Up</h2>
        
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
              placeholder="Choose a username"
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
              placeholder="Create a password"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
            />
          </div>
          
          <button type="submit" className="auth-button">Sign Up</button>
        </form>
        
        <div className="auth-switch">
          Already have an account?{" "}
          <button onClick={switchToLogin} className="switch-button">
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
