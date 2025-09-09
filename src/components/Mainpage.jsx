import { useState, useEffect } from "react";
import "./main.css";
import "./logout.css";
import { useAuth } from "../contexts/AuthContext";
import { getGeminiResponse, validateApiKey } from "../services/GeminiService";

function Mainpage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, logout } = useAuth();
  
  // State for chat management
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: "COVID-19 vaccine questions", date: "2 hours ago", messages: [] },
    { id: 2, title: "Allergy symptoms consultation", date: "Yesterday", messages: [] },
    { id: 3, title: "Nutrition advice for diabetes", date: "2 days ago", messages: [] },
    { id: 4, title: "Exercise recommendations", date: "Last week", messages: [] },
    { id: 5, title: "Sleep disorder concerns", date: "Last week", messages: [] },
    { id: 6, title: "Mental health discussion", date: "2 weeks ago", messages: [] },
    { id: 7, title: "Child vaccination schedule", date: "3 weeks ago", messages: [] },
  ]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  
  // State for chat operations
  const [isRenaming, setIsRenaming] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuChatId, setContextMenuChatId] = useState(null);
  
  // State for API operations
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Function to create a new chat
  const createNewChat = () => {
    const newChat = {
      id: Date.now(), // Use timestamp as unique ID
      title: "New conversation",
      date: "Just now",
      messages: []
    };
    
    setChatHistory(prevHistory => [newChat, ...prevHistory]);
    setCurrentChatId(newChat.id);
  };
  
  // Function to select a chat
  const selectChat = (chatId) => {
    setCurrentChatId(chatId);
  };
  
  // Function to handle message input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  // Function to handle message send
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    if (!currentChatId) {
      // If no chat is selected, create a new one
      createNewChat();
      return;
    }
    
    const userMessage = inputValue;
    
    // Add user message to chat
    setChatHistory(prevHistory => 
      prevHistory.map(chat => {
        if (chat.id === currentChatId) {
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, { 
              id: Date.now(),
              text: userMessage, 
              sender: 'user' 
            }]
          };
          
          // Update title if this is the first message
          if (chat.title === "New conversation" && chat.messages.length === 0) {
            updatedChat.title = userMessage.length > 30 
              ? userMessage.substring(0, 27) + "..." 
              : userMessage;
          }
          
          return updatedChat;
        }
        return chat;
      })
    );
    
    setInputValue("");
    
    // Show loading indicator for AI response
    setChatHistory(prevHistory => 
      prevHistory.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, { 
              id: Date.now() + 1,
              text: "...", 
              sender: 'ai',
              isLoading: true
            }]
          };
        }
        return chat;
      })
    );
    
    // Get response from Gemini API
    try {
      setIsLoading(true);
      const response = await getGeminiResponse(userMessage);
      
      // Update chat with AI response
      setChatHistory(prevHistory => 
        prevHistory.map(chat => {
          if (chat.id === currentChatId) {
            const updatedMessages = [...chat.messages];
            // Remove the loading message
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage.isLoading) {
              updatedMessages.pop();
            }
            
            // Add the actual response
            updatedMessages.push({
              id: Date.now() + 2,
              text: response,
              sender: 'ai'
            });
            
            return {
              ...chat,
              messages: updatedMessages
            };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Update chat with error message
      setChatHistory(prevHistory => 
        prevHistory.map(chat => {
          if (chat.id === currentChatId) {
            const updatedMessages = [...chat.messages];
            // Remove the loading message
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage.isLoading) {
              updatedMessages.pop();
            }
            
            // Add error message
            updatedMessages.push({
              id: Date.now() + 2,
              text: "Sorry, I couldn't process your request. Please try again later.",
              sender: 'ai',
              isError: true
            });
            
            return {
              ...chat,
              messages: updatedMessages
            };
          }
          return chat;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // If no chat is selected and there are chats, select the first one
  useEffect(() => {
    if (!currentChatId && chatHistory.length > 0) {
      setCurrentChatId(chatHistory[0].id);
    }
  }, [chatHistory, currentChatId]);
  
  // Check if the API key is valid when component mounts
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        console.log("🔄 Checking Gemini API key...");
        setIsApiKeyValid(false); // Reset to false until validated
        
        const isValid = await validateApiKey();
        setIsApiKeyValid(isValid);
        
        if (isValid) {
          console.log("✅ Gemini API key validated successfully! The chatbot is ready to use.");
        } else {
          console.error("❌ Gemini API key validation failed. Please check your API key in the .env file.");
          console.log("API key should be set in .env file as: VITE_GEMINI_API_KEY=your_api_key_here");
          console.log("Current environment variable access:", import.meta.env.VITE_GEMINI_API_KEY ? "Present" : "Not found");
        }
      } catch (err) {
        console.error("Error during API key validation:", err);
        setIsApiKeyValid(false);
      }
    };
    
    // Force immediate check when component mounts
    checkApiKey();
    
    // Add a manual check button in development
    if (import.meta.env.DEV) {
      window.checkGeminiApiKey = checkApiKey;
      console.log("Development mode: You can manually check the API key by running window.checkGeminiApiKey() in the console");
    }
  }, []);
  
  // Function to handle chat rename
  const handleRenameChat = (chatId) => {
    setContextMenuVisible(false);
    setIsRenaming(true);
    const chat = chatHistory.find(chat => chat.id === chatId);
    if (chat) {
      setNewChatTitle(chat.title);
      setContextMenuChatId(chatId);
    }
  };

  // Function to save renamed chat
  const saveRenamedChat = () => {
    if (newChatTitle.trim() === "") return;
    
    setChatHistory(prevHistory => 
      prevHistory.map(chat => {
        if (chat.id === contextMenuChatId) {
          return { ...chat, title: newChatTitle };
        }
        return chat;
      })
    );
    
    setIsRenaming(false);
    setNewChatTitle("");
    setContextMenuChatId(null);
  };

  // Function to delete a chat
  const deleteChat = (chatId) => {
    setContextMenuVisible(false);
    
    setChatHistory(prevHistory => prevHistory.filter(chat => chat.id !== chatId));
    
    // If we deleted the current chat, select another one
    if (chatId === currentChatId) {
      const remainingChats = chatHistory.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setCurrentChatId(remainingChats[0].id);
      } else {
        setCurrentChatId(null);
      }
    }
  };

  // Function to share a chat
  const shareChat = (chatId) => {
    setContextMenuVisible(false);
    setShareModalOpen(true);
    setContextMenuChatId(chatId);
  };

  // Function to show context menu
  const showContextMenu = (e, chatId) => {
    e.preventDefault(); // Prevent the default context menu
    e.stopPropagation(); // Prevent triggering chat selection
    
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuVisible(true);
    setContextMenuChatId(chatId);
  };

  // Function to close context menu
  const closeContextMenu = () => {
    setContextMenuVisible(false);
  };

  // Function to copy shared link
  const copyShareLink = () => {
    const chat = chatHistory.find(chat => chat.id === contextMenuChatId);
    if (chat) {
      const dummyShareLink = `https://healthhub-chatbot.com/share/${chat.id}`;
      navigator.clipboard.writeText(dummyShareLink)
        .then(() => {
          alert('Link copied to clipboard!');
          setShareModalOpen(false);
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
    }
  };

  // Click outside to close context menu
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuVisible(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Current selected chat
  const currentChat = chatHistory.find(chat => chat.id === currentChatId);

  return (
    <div className="app-container">
      {/* Sidebar for chat history */}
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h3>Chat History</h3>
          <button className="new-chat-btn" onClick={createNewChat}>+ New Chat</button>
          <button className="close-sidebar" onClick={toggleSidebar}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
        </div>
        <div className="chat-list">
          {chatHistory.map((chat) => (
            <div 
              key={chat.id} 
              className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
              onClick={() => selectChat(chat.id)}
              onContextMenu={(e) => showContextMenu(e, chat.id)}
            >
              <div className="chat-icon">💬</div>
              <div className="chat-info">
                <h4>{chat.title}</h4>
                <span>{chat.date}</span>
              </div>
              <button 
                className="chat-options-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  showContextMenu(e, chat.id);
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path
                    fill="currentColor"
                    d="M12,16A2,2 0 0,1 10,14A2,2 0 0,1 12,12A2,2 0 0,1 14,14A2,2 0 0,1 12,16M12,10A2,2 0 0,1 10,8A2,2 0 0,1 12,6A2,2 0 0,1 14,8A2,2 0 0,1 12,10M12,4A2,2 0 0,1 10,2A2,2 0 0,1 12,0A2,2 0 0,1 14,2A2,2 0 0,1 12,4Z"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="currentColor"
                  d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"
                />
              </svg>
            </button>
            <div className="logo">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" width="28" height="28">
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
          </div>

          <div className="avatar">
            <div className="avatar-container">
              <img
                src="https://i.pravatar.cc/50?img=47"
                alt="User Avatar"
                className="avatar-img"
              />
              <div className="ai-badge">AI</div>
            </div>
            <div className="avatar-info">
              <p className="avatar-name">
                {currentUser ? currentUser.username : "Chatbot"}
              </p>
              <span className="avatar-status">AI-Powered</span>
            </div>
            <button onClick={logout} className="logout-button">Logout</button>
          </div>
        </div>

        {/* Chat area */}
        <div className="chat-area">
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className="welcome-message">
              <div className="welcome-icon">👋</div>
              <h2>Hello! How can I help with your health concerns today?</h2>
              <p>
                Ask me anything about public health, symptoms, or medical advice.
              </p>
              {isApiKeyValid ? (
                <div className="api-success">
                  <p>✅ Gemini AI is connected and ready to assist you!</p>
                  <button 
                    className="api-check-button"
                    onClick={async () => {
                      const isValid = await validateApiKey();
                      setIsApiKeyValid(isValid);
                    }}
                  >
                    Re-check API connection
                  </button>
                </div>
              ) : (
                <div className="api-warning">
                  <p>⚠️ API key not valid. Please check your Gemini API key in the .env file.</p>
                  <button 
                    className="api-check-button"
                    onClick={async () => {
                      const isValid = await validateApiKey();
                      setIsApiKeyValid(isValid);
                    }}
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="messages-container">
              {currentChat.messages.map(message => (
                <div key={message.id} className={`message ${message.sender} ${message.isLoading ? 'loading' : ''} ${message.isError ? 'error' : ''}`}>
                  <div className="message-content">
                    {message.isLoading ? (
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      message.text
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="input-container">
          <div className="input-box">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your health question..."
              className="message-input"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button className="send-button" onClick={handleSendMessage}>
              <svg
                className="send-icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <path
                  fill="currentColor"
                  d="M2,21L23,12L2,3V10L17,12L2,14V21Z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Context Menu */}
      {contextMenuVisible && (
        <div 
          className="context-menu"
          style={{ 
            top: `${contextMenuPosition.y}px`, 
            left: `${contextMenuPosition.x}px` 
          }}
        >
          <button onClick={() => handleRenameChat(contextMenuChatId)}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path
                fill="currentColor"
                d="M20.71,4.04C21.1,3.65 21.1,3 20.71,2.63L18.37,0.29C18,-0.1 17.35,-0.1 16.96,0.29L15,2.25L18.75,6M17.75,7L14,3.25L4,13.25V17H7.75L17.75,7Z"
              />
            </svg>
            Rename
          </button>
          <button onClick={() => shareChat(contextMenuChatId)}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path
                fill="currentColor"
                d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z"
              />
            </svg>
            Share
          </button>
          <button onClick={() => deleteChat(contextMenuChatId)}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path
                fill="currentColor"
                d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
              />
            </svg>
            Delete
          </button>
        </div>
      )}
      
      {/* Rename Modal */}
      {isRenaming && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Rename Chat</h3>
            <input
              type="text"
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              placeholder="Enter new title"
              className="modal-input"
              autoFocus
            />
            <div className="modal-buttons">
              <button className="modal-btn cancel" onClick={() => setIsRenaming(false)}>
                Cancel
              </button>
              <button className="modal-btn save" onClick={saveRenamedChat}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Share Modal */}
      {shareModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Share Chat</h3>
            <p>Share this conversation with others:</p>
            <div className="share-link">
              {`https://healthhub-chatbot.com/share/${contextMenuChatId}`}
            </div>
            <div className="modal-buttons">
              <button className="modal-btn cancel" onClick={() => setShareModalOpen(false)}>
                Cancel
              </button>
              <button className="modal-btn share" onClick={copyShareLink}>
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mainpage;
