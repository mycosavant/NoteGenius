import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CategoryPage() {
  const navigate = useNavigate();

  // 標籤
  const [tags, setTags] = useState([]);
  // 筆記
  const [notes, setNotes] = useState([]);
  // 新標籤名稱
  const [newTagName, setNewTagName] = useState("");
  // 展開的標籤
  const [expandedTag, setExpandedTag] = useState(null);
  // 筆記編號
  const [noteCounter, setNoteCounter] = useState(1);

  // 新增標籤
  const handleAddTag = () => {
    if (newTagName.trim()) {
      setTags([...tags, { name: newTagName, notes: [] }]);
      setNewTagName("");
    }
  };

  // 新增筆記（未分標籤）
  const handleAddNote = () => {
    const newNote = {
      id: Date.now(),
      title: `Note ${noteCounter}`,
    };
    setNotes([...notes, newNote]);
    setNoteCounter(noteCounter + 1);
  };

  // 將筆記分配給標籤
  const handleAssignNoteToTag = (note, tagName) => {
    setNotes(notes.filter((n) => n.id !== note.id));
    setTags(
      tags.map((tag) =>
        tag.name === tagName
          ? { ...tag, notes: [...tag.notes, note] }
          : tag
      )
    );
  };

  // 刪除未分標籤的筆記
  const handleDeleteNote = (noteId) => {
    setNotes(notes.filter((n) => n.id !== noteId));
  };

  // 刪除已分配到標籤的筆記
  const handleDeleteTaggedNote = (tagName, noteId) => {
    setTags(
      tags.map((tag) =>
        tag.name === tagName
          ? { ...tag, notes: tag.notes.filter((note) => note.id !== noteId) }
          : tag
      )
    );
  };

  // 切換標籤展開
  const toggleExpand = (tagName) => {
    setExpandedTag(expandedTag === tagName ? null : tagName);
  };

  // 查看筆記
  const handleViewNote = (noteId) => {
    const note =
      notes.find((n) => n.id === noteId) ||
      tags.flatMap((t) => t.notes).find((n) => n.id === noteId);
    if (note) {
      // 可省略 localStorage，只靠 noteId 路由
    }
    navigate(`/note/${noteId}`);
  };

  // 登出
  const handleLogout = () => {
    navigate("/login");
  };

  // ======= 這裡才是 return ======
  return (
    <div style={{ padding: "20px", position: "relative" }}>
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          backgroundColor: "transparent",
          border: "none",
          color: "#666",
          cursor: "pointer",
        }}
      >
        log out
      </button>
      <h1>NoteGenius</h1>
      <button
        onClick={handleAddNote}
        style={{
          backgroundColor: "#1e3a8a",
          color: "white",
          padding: "10px 20px",
          borderRadius: "6px",
          border: "none",
          marginBottom: "20px",
        }}
      >
        新增筆記
      </button>
      <h3>未分標籤筆記</h3>
      {notes.map((note) => (
        <div key={note.id} style={{ marginBottom: "10px" }}>
          <span>{note.title}</span>
          <button
            onClick={() => handleViewNote(note.id)}
            style={{
              marginLeft: "10px",
              backgroundColor: "#1e3a8a",
              color: "white",
              border: "none",
              padding: "6px 10px",
              borderRadius: "4px",
            }}
          >
            查看
          </button>
          <button
            onClick={() => handleDeleteNote(note.id)}
            style={{
              marginLeft: "5px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              padding: "6px 10px",
              borderRadius: "4px",
            }}
          >
            刪除
          </button>
        </div>
      ))}
      <h3 style={{ marginTop: "30px" }}>標籤列表</h3>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="新增標籤名稱"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          style={{
            width: "50%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleAddTag}
          style={{
            marginLeft: "10px",
            width: "36px",
            height: "36px",
            fontSize: "18px",
            padding: 0,
            borderRadius: "50%",
            backgroundColor: "#1e3a8a",
            color: "white",
            border: "none",
          }}
        >
          +
        </button>
      </div>
      {tags.map((tag) => (
        <div key={tag.name} style={{ marginBottom: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{tag.name}</strong>
            <button onClick={() => toggleExpand(tag.name)}>+</button>
          </div>
          {expandedTag === tag.name && (
            <div style={{ paddingLeft: "10px" }}>
              <h5>可加入的筆記：</h5>
              {notes.length === 0 ? (
                <div>目前無可加入的筆記</div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} style={{ marginBottom: "5px" }}>
                    {note.title}
                    <button
                      onClick={() => handleAssignNoteToTag(note, tag.name)}
                      style={{
                        marginLeft: "8px",
                        padding: "4px 8px",
                        backgroundColor: "#1e3a8a",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                      }}
                    >
                      加入
                    </button>
                  </div>
                ))
              )}
              {tag.notes.length > 0 && (
                <>
                  <h5>已分配筆記：</h5>
                  {tag.notes.map((note) => (
                    <div key={note.id} style={{ marginLeft: "10px", marginBottom: "5px", color: "#666" }}>
                      {note.title}
                      <button
                        onClick={() => handleViewNote(note.id)}
                        style={{
                          marginLeft: "10px",
                          backgroundColor: "#1e3a8a",
                          color: "white",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        查看
                      </button>
                      <button
                        onClick={() => handleDeleteTaggedNote(tag.name, note.id)}
                        style={{
                          marginLeft: "5px",
                          backgroundColor: "#dc2626",
                          color: "white",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
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
