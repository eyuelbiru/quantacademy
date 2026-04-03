"use client";

import { useState, useRef, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const current = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: current, history: messages }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.response || "I'm not sure how to help with that." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, the mentor service is unavailable right now. Try again later." },
      ]);
    }

    setLoading(false);
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "calc(100vh - 57px)",
      maxWidth: 800, margin: "0 auto",
    }}>
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 80, color: "#737373" }}>
            <h2>AI Mentor</h2>
            <p>Ask about any trading strategy, indicator, or concept.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
              {["Tell me about trend following", "What is RSI divergence?", "Explain smart money concepts", "Quiz me on fibonacci"].map((s) => (
                <button key={s} onClick={() => { setInput(s); send(); }}
                  style={{
                    padding: "6px 14px", borderRadius: 20, border: "1px solid #333",
                    background: "#111", color: "#a3a3a3", cursor: "pointer", fontSize: 13,
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "70%",
              padding: "12px 16px",
              borderRadius: 16,
              background: m.role === "user" ? "#2563eb" : "#1e1e1e",
              color: m.role === "user" ? "#fff" : "#d4d4d4",
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ color: "#737373", padding: "8px 16px" }}>Thinking...</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid #222",
        display: "flex",
        gap: 8,
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about trading strategies..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 24,
            border: "1px solid #333",
            background: "#111",
            color: "#e5e5e5",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            padding: "10px 20px",
            borderRadius: 24,
            border: "none",
            background: input.trim() && !loading ? "#2563eb" : "#1e1e1e",
            color: input.trim() && !loading ? "#fff" : "#555",
            cursor: input.trim() && !loading ? "pointer" : "default",
            fontWeight: 600,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
