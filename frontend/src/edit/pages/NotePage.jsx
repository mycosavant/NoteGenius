// src/pages/NotePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import NoteEditor from '../components/note/NoteEditor';
import AiChat from '../components/note/AiChat';
import { NotesList } from '../components/note/NotesList';
import { Button } from '../components/ui/Button';
import '../styles/note.css';

export default function NotePage() {
  const { noteId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNote, setSelectedNote] = useState(noteId || null);
  const [notes, setNotes] = useState({});
  const [aiChatVisible, setAiChatVisible] = useState(true);
  const [tags, setTags] = useState([]);  // 這裡就是「標籤」狀態
  const [selectedTag, setSelectedTag] = useState(null);

  // 1. 讀 localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    const savedAiChatVisible = localStorage.getItem('aiChatVisible');
    if (savedAiChatVisible !== null) setAiChatVisible(JSON.parse(savedAiChatVisible));
    const savedTags = localStorage.getItem('tags');
    if (savedTags) setTags(JSON.parse(savedTags));
  }, []);

  // 2. 根據 noteId URL 參數自動選中
  useEffect(() => {
    if (noteId) setSelectedNote(noteId);
  }, [noteId]);

  // 3. 儲存回 localStorage
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    localStorage.setItem('aiChatVisible', JSON.stringify(aiChatVisible));
  }, [aiChatVisible]);
  useEffect(() => {
    localStorage.setItem('tags', JSON.stringify(tags));
  }, [tags]);

  // 4. 新增/刪除/編輯筆記
  const handleSaveNote = (id, title, content, tag) => {
    setNotes(prev => ({
      ...prev,
      [id]: { ...prev[id], title, content, tag } // tag 取代原本的 category
    }));
  };

  const handleCreateNote = () => {
    const id = `note-${Date.now()}`;
    setNotes(prev => ({
      ...prev,
      [id]: { title: '新筆記', content: '', tag: '' }
    }));
    setSelectedNote(id);
  };

  const handleDeleteNote = (id) => {
    const newNotes = { ...notes };
    delete newNotes[id];
    setNotes(newNotes);
    if (selectedNote === id) setSelectedNote(null);
  };

  // 5. 新增標籤
  const handleCreateTag = (tagName) => {
    if (tagName && !tags.includes(tagName)) {
      setTags([...tags, tagName]);
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
              categories={tags} // 這裡傳進去就是標籤！
              selectedCategory={selectedTag}
              onSelectCategory={setSelectedTag}
              onCreateCategory={handleCreateTag}
            />
          </div>
        )}

        {/* 主要內容 */}
        <div className="main-content">
          <div className={`editor-area ${!aiChatVisible ? 'full-width' : ''}`}>
            {selectedNote && notes[selectedNote] ? (
              <NoteEditor
                key={selectedNote}
                noteId={selectedNote}
                initialTitle={notes[selectedNote]?.title}
                initialContent={notes[selectedNote]?.content}
                initialTag={notes[selectedNote]?.tag}    // 用 tag 不是 category
                tags={tags}                               // 標籤列表
                onSave={handleSaveNote}
                onCreateTag={handleCreateTag}
              />
            ) : (
              <div style={{ textAlign: 'center', marginTop: 40, color: '#666' }}>
                請點選左側筆記或新增一個新筆記
              </div>
            )}
          </div>
          {aiChatVisible && (
            <div className="ai-chat-area">
              <AiChat onToggleVisibility={() => setAiChatVisible(!aiChatVisible)} />
            </div>
          )}
        </div>
      </div>

      {!aiChatVisible && (
        <Button className="show-ai-button" onClick={() => setAiChatVisible(true)}>
          顯示AI助手
        </Button>
      )}
    </div>
  );
}
