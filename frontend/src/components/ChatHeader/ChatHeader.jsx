import "./ChatHeader.css";

function ChatHeader({ toggleSidebar }) {
  return (
    <header className="chat-header">
      <button className="mobile-menu" onClick={toggleSidebar}>
        ☰
      </button>

      <h2>Nova AI</h2>
    </header>
  );
}

export default ChatHeader;
