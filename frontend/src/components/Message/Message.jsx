import "./Message.css";

function Message({ role, content, isThinking }) {
  return (
    <div className={`message-row ${role === "user" ? "user-message-row" : "ai-message-row"}`}>
      <div className={`message-bubble ${role === "user" ? "user-message" : "ai-message"} ${isThinking ? "thinking" : ""}`}>
        {content}
      </div>
    </div>
  );
}

export default Message;