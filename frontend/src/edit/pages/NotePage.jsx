// src/pages/NotePage.jsx
import React, { useState, useEffect } from 'react';
import NoteEditor from '../components/note/NoteEditor';
import AiChat from '../components/note/AiChat';
import { NotesList } from '../components/note/NotesList';
import { Button } from '../components/ui/Button';
import '../styles/note.css';

export default function NotePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [notes, setNotes] = useState({});
  const [aiChatVisible, setAiChatVisible] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 從本地存儲加載筆記和設置
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }

    const savedAiChatVisible = localStorage.getItem('aiChatVisible');
    if (savedAiChatVisible !== null) {
      setAiChatVisible(JSON.parse(savedAiChatVisible));
    }

    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  // 保存筆記到本地存儲
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // 保存AI助手可見性狀態
  useEffect(() => {
    localStorage.setItem('aiChatVisible', JSON.stringify(aiChatVisible));
  }, [aiChatVisible]);

  // 保存分類到本地存儲
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const handleSaveNote = (id, title, content, category, tags) => {
    setNotes((prev) => ({
      ...prev,
      [id]: {
        title,
        content,
        category,
        tags,
      },
    }));
  };

  const handleCreateNote = () => {
    const id = `note-${Date.now()}`;
    setNotes((prev) => ({
      ...prev,
      [id]: { title: '新筆記', content: '' },
    }));
    setSelectedNote(id);
  };

  const handleDeleteNote = (id) => {
    const newNotes = { ...notes };
    delete newNotes[id];
    setNotes(newNotes);
    if (selectedNote === id) {
      setSelectedNote(null);
    }
  };

  const handleCreateCategory = (categoryName) => {
    if (categoryName && !categories.includes(categoryName)) {
      setCategories([...categories, categoryName]);
    }
  };

  return (
    <div className="note-page">
      {/* 側邊欄切換按鈕 */}
      <div className="sidebar-toggle">
        <Button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '隱藏側邊欄' : '顯示側邊欄'}
        </Button>
      </div>

      <div className="note-container">
        {/* 側邊欄 */}
        {sidebarOpen && (
          <div className="sidebar">
            <div className="sidebar-header">
              <h2>我的筆記</h2>
              <Button onClick={handleCreateNote}>新增筆記</Button>
            </div>
            <NotesList
              notes={notes}
              selectedNote={selectedNote}
              onSelectNote={setSelectedNote}
              onDeleteNote={handleDeleteNote}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onCreateCategory={handleCreateCategory}
            />
          </div>
        )}

        {/* 主要內容區域 */}
        <div className="main-content">
          {/* 筆記編輯區域 */}
          <div className={`editor-area ${!aiChatVisible ? 'full-width' : ''}`}>
            <NoteEditor
              key={selectedNote}
              noteId={selectedNote}
              initialTitle={selectedNote ? notes[selectedNote]?.title : ''}
              initialContent={selectedNote ? notes[selectedNote]?.content : ''}
              initialCategory={selectedNote ? notes[selectedNote]?.category : undefined}
              initialTags={selectedNote ? notes[selectedNote]?.tags : []}
              categories={categories}
              onSave={handleSaveNote}
              onCreateCategory={handleCreateCategory}
            />
          </div>

          {/* AI 聊天區域 */}
          {aiChatVisible && (
            <div className="ai-chat-area">
              <AiChat onToggleVisibility={() => setAiChatVisible(!aiChatVisible)} />
            </div>
          )}
        </div>
      </div>

      {/* 顯示AI助手按鈕 */}
      {!aiChatVisible && (
        <Button
          className="show-ai-button"
          onClick={() => setAiChatVisible(true)}
        >
          顯示AI助手
        </Button>
      )}
    </div>
  );
}