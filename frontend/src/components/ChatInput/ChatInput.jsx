import { useRef, useState } from "react";
import "./ChatInput.css";

function ChatInput({ sessionId, chatId, setChatId, setMessages, onChatCreated }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setMessage(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || loading || !sessionId) return;
    
    const userMsg = message;
    setMessage("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Show user message + Thinking bubble
    setMessages(prev => [
      ...prev, 
      { role: 'user', content: userMsg },
      { role: 'assistant', content: 'Thinking...', isThinking: true }
    ]);

    try {
      const res = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, sessionId, chatId })
      });
      const data = await res.json();

      if (!chatId) {
        setChatId(data.chatId);
        onChatCreated();
      }
      
      // Replace Thinking... with real response
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'assistant', content: data.message };
        return newMsgs;
      });

    } catch (err) {
      console.error("Send failed:", err);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'assistant', content: "Error: Could not reach Nova AI." };
        return newMsgs;
      });
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-input-wrapper">
      <div className="chat-input-box">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={loading ? "Nova is thinking..." : "Message Nova AI..."}
          rows="1"
          disabled={loading}
        />
        <button
          className="send-btn"
          disabled={!message.trim() || loading}
          onClick={sendMessage}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default ChatInput;