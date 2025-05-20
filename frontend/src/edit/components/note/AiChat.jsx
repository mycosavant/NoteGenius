import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import './AiChat.css';

export default function AiChat({ onToggleVisibility, noteId }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '您好！我是您的AI助手，有什麼我可以幫助您的嗎？' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 當訊息更新，自動滾動到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/notes/${noteId}/ai/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("伺服器錯誤：", data);
        throw new Error(data.error || "伺服器回應錯誤");
      }

      const aiReply = data.result || '抱歉，AI 沒有回應內容。';
      setMessages((prev) => [...prev, { role: 'assistant', content: aiReply }]);
    } catch (error) {
      console.error("送出錯誤：", error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ 錯誤：${error.message}` },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div className="ai-chat">
      <div className="ai-chat-header">
        <h2>AI 助手</h2>
        <Button variant="ghost" size="sm" onClick={onToggleVisibility}>
          隱藏
        </Button>
      </div>

      <div className="ai-chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-input">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="請輸入像是「請翻譯」或「幫我改寫」..."
          className="chat-textarea"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
          發送
        </Button>
      </div>

      <p className="ai-chat-note">
        輸入像是「請翻譯」、「請摘要」、「幫我改寫這段話」等，我會自動幫你處理！
      </p>
    </div>
  );
}
