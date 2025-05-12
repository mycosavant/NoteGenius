// src/components/note/AiChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import './AiChat.css';

export default function AiChat({ onToggleVisibility }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '您好！我是您的AI助手，有什麼我可以幫助您的嗎？' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 滾動到最新消息
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
      // 這裡應該連接到您的AI API
      // 以下是模擬回應
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '這是一個模擬的AI回應。要實際連接AI API，您需要在後端設置相應的API路由並在此處調用它。',
          },
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: '抱歉，發生了錯誤。請稍後再試。' }]);
      setIsLoading(false);
    }
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
          placeholder="輸入您的問題..."
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
      <p className="ai-chat-note">要連接到實際的AI API，您需要設置相應的API金鑰和後端路由。</p>
    </div>
  );
}