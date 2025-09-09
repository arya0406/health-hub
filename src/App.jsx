import { useState } from "react";
import ChatWindow from "./components/Chatwindow";
import InputBox from "./components/Inputbox";
import Mainpage from "./components/Mainpage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function AppContent() {
  const [authView, setAuthView] = useState("login"); // "login" or "signup"
  const { isAuthenticated, login, signup } = useAuth();

  const switchToLogin = () => setAuthView("login");
  const switchToSignup = () => setAuthView("signup");

  // If not authenticated, show login or signup view
  if (!isAuthenticated) {
    return authView === "login" ? (
      <Login onLogin={login} switchToSignup={switchToSignup} />
    ) : (
      <Signup onSignup={signup} switchToLogin={switchToLogin} />
    );
  }

  // If authenticated, show the main app
  return (
    <div className="App">
      <Mainpage />
      <ChatWindow />
      <InputBox />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
