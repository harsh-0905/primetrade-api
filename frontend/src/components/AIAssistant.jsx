import { useState, useRef, useEffect } from "react";
import { aiChat } from "../api/endpoints";

const AIAssistant = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI task assistant. I can help you plan tasks, prioritize your work, break down projects, or suggest improvements. What can I help you with?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await aiChat(newMessages.slice(-8)); // send last 8 messages for context
      setMessages([...newMessages, { role: "assistant", content: res.data.data.reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const quickPrompts = [
    "Help me prioritize my tasks",
    "How to break down a big project?",
    "Suggest a productive daily schedule",
    "Tips for reducing task overload",
  ];

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      width: 380, maxHeight: 560,
      background: "var(--surface)",
      border: "1px solid var(--border-light)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-lg), 0 0 40px rgba(99,102,241,0.1)",
      display: "flex", flexDirection: "column",
      zIndex: 300,
      animation: "fadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "linear-gradient(135deg, rgba(99,102,241,0.1), transparent)",
        borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, boxShadow: "0 2px 10px var(--accent-glow-strong)"
          }}>✦</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14 }}>AI Assistant</p>
            <p style={{ fontSize: 11, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, background: "var(--success)", borderRadius: "50%", display: "inline-block" }} />
              Online
            </p>
          </div>
        </div>
        <button onClick={onClose} className="btn-icon" style={{ padding: "4px 8px", borderRadius: "50%" }}>×</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: 12,
            display: "flex",
            flexDirection: msg.role === "user" ? "row-reverse" : "row",
            alignItems: "flex-end",
            gap: 8,
          }}>
            {msg.role === "assistant" && (
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, flexShrink: 0,
              }}>✦</div>
            )}
            <div style={{
              maxWidth: "78%",
              padding: "10px 14px",
              borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: msg.role === "user"
                ? "linear-gradient(135deg, var(--accent), var(--accent-2))"
                : "var(--surface-2)",
              color: msg.role === "user" ? "#fff" : "var(--text-2)",
              fontSize: 13,
              lineHeight: 1.6,
              border: msg.role === "user" ? "none" : "1px solid var(--border)",
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✦</div>
            <div style={{ padding: "10px 16px", background: "var(--surface-2)", borderRadius: "14px 14px 14px 4px", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--accent)",
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    display: "inline-block",
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div style={{ padding: "0 16px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {quickPrompts.map((p) => (
            <button key={p} onClick={() => setInput(p)} style={{
              fontSize: 11, padding: "5px 10px",
              background: "var(--surface-3)", border: "1px solid var(--border)",
              color: "var(--text-muted)", borderRadius: "var(--radius-full)",
              cursor: "pointer", transition: "all var(--transition)",
            }}
              onMouseEnter={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.color = "var(--accent-2)"; }}
              onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text-muted)"; }}
            >{p}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "8px 16px 16px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about your tasks..."
            rows={1}
            style={{
              flex: 1, resize: "none", fontSize: 13,
              maxHeight: 80, padding: "9px 12px",
              background: "var(--surface-2)",
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="btn-primary"
            style={{ padding: "9px 14px", borderRadius: "var(--radius)", flexShrink: 0 }}
          >→</button>
        </div>
        <p style={{ fontSize: 10, color: "var(--text-disabled)", marginTop: 6, textAlign: "center" }}>
          Powered by Claude AI · Press Enter to send
        </p>
      </div>

      <style>{`
        @keyframes pulse { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default AIAssistant;