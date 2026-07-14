import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatArea from "../../components/ChatArea/ChatArea";
import ChatHeader from "../../components/ChatHeader/ChatHeader";
import "./Chat.css";

// 1. Replace crypto.randomUUID() with this - works everywhere
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);

  // 5. Session without login: use localStorage UUID
  useEffect(() => {
    let sid = localStorage.getItem('sessionId');
    if (!sid) {
      sid = generateUUID(); // No more crypto.randomUUID()
      localStorage.setItem('sessionId', sid);
    }
    setSessionId(sid);
  }, []);

  // 4. Fetch chat history - moved inside useEffect to kill the deps warning
  useEffect(() => {
    const fetchChats = async () => {
      if (!sessionId) return;
      try {
        const res = await fetch(`http://localhost:3000/chats/${sessionId}`);
        const data = await res.json();
        setChats(data);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      }
    };
    
    if (sessionId) fetchChats(); // Line 37 error gone - no fetchChats dep needed
  }, [sessionId]);

  const loadChat = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/chat/${id}`);
      const data = await res.json();
      setChatId(id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to load chat:", err);
    }
  };

  const handleNewChat = () => {
    setChatId(null);
    setMessages([]);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="chat-page">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        chats={chats}
        onSelectChat={loadChat}
        onNewChat={handleNewChat}
        activeChatId={chatId}
      />

      {sidebarOpen && window.innerWidth <= 600 &&
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
        ></div>
      }

      <main className="chat-container">
        <ChatHeader toggleSidebar={toggleSidebar} />
        <ChatArea
          messages={messages}
          setMessages={setMessages}
          sessionId={sessionId}
          chatId={chatId}
          setChatId={setChatId}
          onChatCreated={() => {
            // Refresh chats after new chat created
            if (sessionId) {
              fetch(`http://localhost:3000/chats/${sessionId}`)
                .then(res => res.json())
                .then(setChats)
                .catch(console.error);
            }
          }}
        />
      </main>
    </div>
  );
}

export default Chat;