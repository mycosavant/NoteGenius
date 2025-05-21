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
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    const savedAiChatVisible = localStorage.getItem('aiChatVisible');
    if (savedAiChatVisible !== null) setAiChatVisible(JSON.parse(savedAiChatVisible));
    const savedTags = localStorage.getItem('tags');
    if (savedTags) setTags(JSON.parse(savedTags));

    // 🚀 取得所有 notes from 後端
    fetch("http://localhost:8000/api/notes/")
      .then(res => res.json())
      .then(data => {
        const notesMap = {};
        data.forEach(note => { notesMap[note.id] = note });
        setNotes(notesMap);
      })
      .catch(err => console.error("載入 notes 失敗：", err));
  }, []);

  useEffect(() => {
    if (noteId) setSelectedNote(noteId);
  }, [noteId]);

  useEffect(() => {
    localStorage.setItem('aiChatVisible', JSON.stringify(aiChatVisible));
    localStorage.setItem('tags', JSON.stringify(tags));
  }, [aiChatVisible, tags]);

  const handleSaveNote = async (id, title, content, tag) => {
    try {
      const response = await fetch(`http://localhost:8000/api/notes/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tag })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("更新筆記失敗：", errorData);
        return;
      }

      const updatedNote = await response.json();
      setNotes(prev => ({ ...prev, [id]: updatedNote }));
    } catch (err) {
      console.error("儲存筆記時發生錯誤：", err);
    }
  };

  const handleCreateNote = async () => {
  try {
    const userId = parseInt(localStorage.getItem('userId')) || 1; // ✅ 預設為訪客 ID: 1
    const response = await fetch("http://localhost:8000/api/notes/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "新筆記",
        content: "這是一筆新的內容", // 🔧 改：避免空白導致錯誤
        tag: "",
        user:  userId // 🔧 改：請填入你後端的使用者 ID（目前假設為 1）
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("建立筆記失敗：", errorData);
      return;
    }

    const newNote = await response.json();
    setNotes(prev => ({ ...prev, [newNote.id]: newNote }));
    setSelectedNote(newNote.id);
  } catch (err) {
    console.error("建立筆記時發生錯誤：", err);
  }
};

  const handleDeleteNote = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/notes/${id}/`, {
        method: "DELETE"
      });

      const newNotes = { ...notes };
      delete newNotes[id];
      setNotes(newNotes);
      if (selectedNote === id) setSelectedNote(null);
    } catch (err) {
      console.error("刪除筆記時發生錯誤：", err);
    }
  };

  const handleCreateTag = (tagName) => {
    if (tagName && !tags.includes(tagName)) {
      setTags([...tags, tagName]);
    }
  };

  return (
    <div className="note-page">
      <div className="sidebar-toggle">
        <Button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '隱藏側邊欄' : '顯示側邊欄'}
        </Button>
      </div>

      <div className="note-container">
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
              categories={tags}
              selectedCategory={selectedTag}
              onSelectCategory={setSelectedTag}
              onCreateCategory={handleCreateTag}
            />
          </div>
        )}

        <div className="main-content">
          <div className={`editor-area ${!aiChatVisible ? 'full-width' : ''}`}>
            {selectedNote && notes[selectedNote] ? (
              <NoteEditor
                key={selectedNote}
                noteId={selectedNote}
                initialTitle={notes[selectedNote]?.title}
                initialContent={notes[selectedNote]?.content}
                initialTag={notes[selectedNote]?.tag}
                tags={tags}
                onSave={handleSaveNote}
                onCreateTag={handleCreateTag}
              />
            ) : (
              <div style={{ textAlign: 'center', marginTop: 40, color: '#666' }}>
                請點選左側筆記或新增一個新筆記
              </div>
            )}
          </div>

          {aiChatVisible && selectedNote && notes[selectedNote] && (
            <div className="ai-chat-area">
              <AiChat
                noteId={notes[selectedNote].id}  // ✅ 用真實後端 ID 傳入
                onToggleVisibility={() => setAiChatVisible(!aiChatVisible)}
              />
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