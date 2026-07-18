import Message from "../Message/Message";
import ChatInput from "../ChatInput/ChatInput";
import "./ChatArea.css";

function ChatArea({ messages, setMessages, sessionId, chatId, setChatId, onChatCreated }) {
  return (
    <div className="chat-area">
      <div className="messages-container">
        {messages.length === 0 ? (
          <Message
            role="assistant"
            content="Hello! I am Nova AI. How can I help you today?"
          />
        ) : (
          messages.map((message, index) => (
            <Message
              key={index}
              role={message.role}
              content={message.content}
              isThinking={message.isThinking}
            />
          ))
        )}
        <div className="chat-bottom-space"></div>
      </div>

      <ChatInput
        sessionId={sessionId}
        chatId={chatId}
        setChatId={setChatId}
        setMessages={setMessages}
        onChatCreated={onChatCreated}
      />
    </div>
  );
}

export default ChatArea;