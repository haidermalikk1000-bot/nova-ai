import "./Sidebar.css";

function Sidebar({ isOpen, toggleSidebar, chats, onSelectChat, onNewChat, activeChatId }) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <button 
          className="toggle-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {isOpen ? "←" : "→"}
        </button>

        {isOpen && (
          <button className="new-chat-btn" onClick={onNewChat}>
            + New Chat
          </button>
        )}
      </div>

      {isOpen && (
        <div className="recent-section">
          <h3>Recent Chats</h3>
          <div className="history-list">
            {chats.length === 0 ? (
              <div className="history-item empty">No chats yet</div>
            ) : (
              chats.map((chat) => (
                <div 
                  className={`history-item ${chat._id === activeChatId ? 'active' : ''}`}
                  key={chat._id}
                  onClick={() => onSelectChat(chat._id)}
                >
                  {chat.title}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="sidebar-footer">
          Nova AI
          <span>Built by Haider</span>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;