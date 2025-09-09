import React, { useState } from "react";
import "./inputbox.css";

function InputBox({ onSend }) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSend = () => {
    if (text.trim() === "") return;
    onSend(text);
    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSpeechRecognition = () => {
    if (!isListening) {
      // Start speech recognition
      startSpeechRecognition();
    } else {
      // Stop speech recognition
      stopSpeechRecognition();
    }
  };

  const startSpeechRecognition = () => {
    // Check if browser supports speech recognition
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert(
        "Your browser doesn't support speech recognition. Please use Chrome or Edge."
      );
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");

      setText(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopSpeechRecognition = () => {
    setIsListening(false);
    // In a real implementation, we would stop the recognition here
  };

  return (
    <div className="input-container">
      <div className="input-box">
        <input
          type="text"
          placeholder="Type your health question..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="message-input"
        />
        <div className="input-buttons">
          <button
            onClick={toggleSpeechRecognition}
            className={`mic-button ${isListening ? "listening" : ""}`}
            aria-label="Speech recognition"
            type="button"
          >
            <svg
              className="mic-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              {/* Fixed microphone icon path */}
              <path
                fill="currentColor"
                d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3m7 9c0 3.53-2.61 6.44-6 6.93V21h-2v-3.07c-3.39-.49-6-3.4-6-6.93h2a5 5 0 0 0 5 5a5 5 0 0 0 5-5h2z"
              />
            </svg>
            {isListening && <div className="pulse-ring"></div>}
          </button>
          <button
            onClick={handleSend}
            className="send-button"
            disabled={text.trim() === ""}
            aria-label="Send message"
            type="button"
          >
            <svg
              className="send-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputBox;
