import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CategoryPage.css";

const API_BASE = 'http://localhost:8000/api';

function CategoryPage() {
  const navigate = useNavigate();

  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [expandedTag, setExpandedTag] = useState(null);
  const [noteCounter, setNoteCounter] = useState(1);

  // 載入初始資料
  useEffect(() => {
    fetch(`${API_BASE}/notes/`)
      .then(res => res.json())
      .then(data => setNotes(data));

    fetch(`${API_BASE}/tags/`)
      .then(res => res.json())
      .then(data => setTags(data));
  }, []);

  const handleAddTag = () => {
    if (newTagName.trim()) {
      fetch(`${API_BASE}/tags/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName })
      })
        .then(res => res.json())
        .then(newTag => {
          setTags([...tags, { ...newTag, notes: [] }]);
          setNewTagName("");
        });
    }
  };

  const handleAddNote = () => {
    const newTitle = `Note ${noteCounter}`;
    fetch(`${API_BASE}/notes/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, content: "" })
    })
      .then(res => res.json())
      .then(newNote => {
        setNotes([...notes, newNote]);
        setNoteCounter(noteCounter + 1);
      });
  };

  const handleAssignNoteToTag = (note, tagName) => {
    // 要從前端刪除與更新狀態
    setNotes(notes.filter((n) => n.id !== note.id));
    setTags(
      tags.map((tag) =>
        tag.name === tagName
          ? { ...tag, notes: [...(tag.notes || []), note] }
          : tag
      )
    );
    // ✅ 建立 note-tag 關聯：需補上後端支援
  };

  const handleDeleteNote = (noteId) => {
    fetch(`${API_BASE}/notes/${noteId}/`, {
      method: "DELETE"
    }).then(() => {
      setNotes(notes.filter((n) => n.id !== noteId));
    });
  };

  const handleDeleteTaggedNote = (tagName, noteId) => {
    setTags(
      tags.map((tag) =>
        tag.name === tagName
          ? {
            ...tag,
            notes: (tag.notes || []).filter((note) => note.id !== noteId)
          }
          : tag
      )
    );
    // ✅ 建議後端 API 提供移除 tag 的功能
  };

  const toggleExpand = (tagName) => {
    setExpandedTag(expandedTag === tagName ? null : tagName);
  };

  const handleViewNote = (noteId) => {
    navigate(`/note/${noteId}`);
  };

  const handleLogout = () => {
    fetch(`${API_BASE}/logout/`, {
      method: "POST"
    }).then(() => {
      navigate("/");
    });
  };

  return (
    <div className="page-container">
      <button onClick={handleLogout} className="logout-button">log out</button>
      <h1>NoteGenius</h1>
      <button onClick={handleAddNote} className="add-note-button">新增筆記</button>

      <h3>未分標籤筆記</h3>
      {notes.map((note) => (
        <div key={note.id} className="note-item-inline">
          <span>{note.title}</span>
          <button onClick={() => handleViewNote(note.id)} className="view-button">查看</button>
          <button onClick={() => handleDeleteNote(note.id)} className="delete-button">刪除</button>
        </div>
      ))}

      <h3 className="section-title">標籤列表</h3>
      <div className="tag-input-container">
        <input
          type="text"
          placeholder="新增標籤名稱"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          className="tag-input"
        />
        <button onClick={handleAddTag} className="add-tag-button">+</button>
      </div>

      {tags.map((tag) => (
        <div key={tag.name} className="tag-block">
          <div className="tag-header">
            <strong>{tag.name}</strong>
            <button onClick={() => toggleExpand(tag.name)}>+</button>
          </div>

          {expandedTag === tag.name && (
            <div className="expanded-tag-container">
              <h5>可加入的筆記：</h5>
              {notes.length === 0 ? (
                <div>目前無可加入的筆記</div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="assign-note-block">
                    {note.title}
                    <button
                      onClick={() => handleAssignNoteToTag(note, tag.name)}
                      className="view-button"
                    >
                      加入
                    </button>
                  </div>
                ))
              )}
              {(tag.notes || []).length > 0 && (
                <>
                  <h5>已分配筆記：</h5>
                  {tag.notes.map((note) => (
                    <div key={note.id} className="assigned-note">
                      {note.title}
                      <button
                        onClick={() => handleViewNote(note.id)}
                        className="view-button"
                      >
                        查看
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteTaggedNote(tag.name, note.id)
                        }
                        className="delete-button"
                      >
                        刪除
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CategoryPage;
