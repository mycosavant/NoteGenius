import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import NoteEditor from '../components/note/NoteEditor';
import AiChat from '../components/note/AiChat';
import NotesList from '../components/note/NotesList';
import { Button } from '../components/ui/Button';
import './NotePage.css';

export default function NotePage() {
  const { noteId } = useParams();
  const [userId, setUserId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNote, setSelectedNote] = useState(noteId || null);
  const [notes, setNotes] = useState({});
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [aiChatVisible, setAiChatVisible] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 取得使用者資訊
  useEffect(() => {
    fetch("http://localhost:8000/api/users/me/", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("未登入");
        return res.json();
      })
      .then(data => setUserId(data?.id))
      .catch(err => {
        console.error("無法取得使用者資料", err);
        window.location.href = "/login";
      });
  }, []);

  // 載入 notes
  useEffect(() => {
    if (!userId) return;

    fetch("http://localhost:8000/api/notes/", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const map = {};
        data.forEach(note => { map[note.id] = note; });
        setNotes(map);
      })
      .catch(err => console.error("載入 notes 失敗：", err));
  }, [userId]);

  // 載入 tags
  useEffect(() => {
    if (!userId) return;

    fetch("http://localhost:8000/api/tags/", { credentials: "include" })
      .then(res => res.json())
      .then(data => setTags(data.map(tag => tag.name)))
      .catch(err => console.error("載入 tags 失敗：", err));
  }, [userId]);

  useEffect(() => {
    if (noteId) setSelectedNote(noteId);
  }, [noteId]);

  useEffect(() => {
    localStorage.setItem('aiChatVisible', JSON.stringify(aiChatVisible));
  }, [aiChatVisible]);

  const handleSaveNote = async (id, title, content, tag_names) => {
    try {
      const response = await fetch(`http://localhost:8000/api/notes/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, content, tag_names }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("更新筆記失敗：", JSON.stringify(errorData, null, 2));
        return;
      }

      const updatedNote = await response.json();
      setNotes(prev => ({ ...prev, [id]: updatedNote }));
    } catch (err) {
      console.error("儲存筆記時發生錯誤：", err);
    }
  };

  const handleCreateNote = async () => {
    if (!userId) {
      console.error("尚未載入 userId，無法建立筆記");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/notes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user: userId, // ✅ 加上這行
          title: "新筆記",
          content: "這是一筆新的內容",
          tag_names: []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("建立筆記失敗：", JSON.stringify(errorData, null, 2));
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
      const response = await fetch(`http://localhost:8000/api/notes/${id}/`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        console.error(`刪除筆記 ${id} 失敗：`, await response.text());
        return;
      }

      setNotes(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      if (selectedNote === id) setSelectedNote(null);
    } catch (err) {
      console.error("刪除筆記時發生錯誤：", err);
    }
  };

  const handleCreateTag = async (tagName) => {
    if (!tagName || tags.includes(tagName)) return;

    try {
      const response = await fetch("http://localhost:8000/api/tags/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: tagName })
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("新增 tag 失敗：", err);
        return;
      }

      const newTag = await response.json();
      setTags(prev => [...prev, newTag.name]); // ✅ 更新 NotesList 使用的 tags
    } catch (err) {
      console.error("建立 tag 發生錯誤：", err);
    }
  };

  const handleRenameTag = async (oldName, newName) => {
    try {
      // 找出要更新的 tag id
      const tagRes = await fetch("http://localhost:8000/api/tags/", { credentials: "include" });
      const tagsData = await tagRes.json();
      const tagToUpdate = tagsData.find(t => t.name === oldName);
      if (!tagToUpdate) return alert("找不到標籤");

      // 發送 PATCH 更新名稱
      const res = await fetch(`http://localhost:8000/api/tags/${tagToUpdate.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName })
      });

      if (!res.ok) {
        console.error("重新命名失敗：", await res.text());
        return;
      }

      // ✅ 更新全域 tags 陣列
      setTags(prev => prev.map(t => (t === oldName ? newName : t)));

      // ✅ 同步更新所有筆記中的 tag 名稱
      setNotes(prevNotes => {
        const updated = { ...prevNotes };
        for (const id in updated) {
          const note = updated[id];
          if (Array.isArray(note.tags)) {
            const newTags = note.tags.map(t =>
              t.name === oldName ? { ...t, name: newName } : t
            );
            updated[id] = { ...note, tags: newTags };
          }
        }
        return updated;
      });

    } catch (err) {
      console.error("重新命名標籤發生錯誤：", err);
    }
  };

  const handleDeleteTag = async (name) => {
    try {
      // 找出 tag 的 id
      const tagRes = await fetch("http://localhost:8000/api/tags/", { credentials: "include" });
      const tagsData = await tagRes.json();
      const tagToDelete = tagsData.find(t => t.name === name);
      if (!tagToDelete) return alert("找不到標籤");

      const res = await fetch(`http://localhost:8000/api/tags/${tagToDelete.id}/`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!res.ok) {
        console.error("刪除失敗：", await res.text());
        return;
      }

      setTags(prev => prev.filter(t => t !== name));
    } catch (err) {
      console.error("刪除標籤發生錯誤：", err);
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
              <h1></h1>
              <h2>我的筆記</h2>
              <Button onClick={handleCreateNote}>新增筆記</Button>
            </div>
            <NotesList
              notes={notes}
              selectedNote={selectedNote}
              onSelectNote={setSelectedNote}
              onDeleteNote={handleDeleteNote}
              tags={tags}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
              onCreateTag={handleCreateTag}
              onRenameTag={handleRenameTag}
              onDeleteTag={handleDeleteTag}
              searchKeyword={searchKeyword}
              onSearchKeywordChange={setSearchKeyword}
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
                initialTags={(notes[selectedNote]?.tags || []).map(t => t.name)} // ✅ 傳陣列
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
                noteId={notes[selectedNote].id}
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
