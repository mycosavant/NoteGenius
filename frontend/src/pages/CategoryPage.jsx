import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CategoryPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [notes, setNotes] = useState([]);
  const [noteCounter, setNoteCounter] = useState(1);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);

useEffect(() => {
  fetch("http://localhost:8000/notes/")
    .then((res) => res.json())
    .then((data) => {
      console.log("抓到的資料", data);
      setNotes(data);
    })
    .catch((err) => console.error("API 錯誤", err));
}, []);


  const handleAddNote = () => {
    const newNote = {
      id: Date.now(),
      title: `Note ${noteCounter}`,
    };
    setNotes([...notes, newNote]);
    setNoteCounter(noteCounter + 1);
  };

  const handleDeleteNote = (noteId) => {
    setNotes(notes.filter((n) => n.id !== noteId));
  };

  const handleDeleteCategorizedNote = (categoryName, noteId) => {
    setCategories(
      categories.map((cat) =>
        cat.name === categoryName
          ? {
              ...cat,
              notes: cat.notes.filter((note) => note.id !== noteId),
            }
          : cat
      )
    );
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([...categories, { name: newCategoryName, notes: [] }]);
      setNewCategoryName("");
    }
  };

  const handleAddNoteToCategory = (note, categoryName) => {
    setNotes(notes.filter((n) => n.id !== note.id));
    setCategories(
      categories.map((cat) =>
        cat.name === categoryName
          ? { ...cat, notes: [...cat.notes, note] }
          : cat
      )
    );
  };

  const toggleExpand = (categoryName) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  const handleViewNote = (noteId) => {
    navigate(`/note/${noteId}`);
  };

  const handleLogout = () => {
    navigate("/login");
  };

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

      <h3>未分類筆記</h3>
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

      <h3 style={{ marginTop: "30px" }}>分類列表</h3>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="新增類別名稱"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          style={{
            width: "50%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleAddCategory}
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

      {categories.map((category) => (
        <div key={category.name} style={{ marginBottom: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{category.name}</strong>
            <button onClick={() => toggleExpand(category.name)}>+</button>
          </div>
          {expandedCategory === category.name && (
            <div style={{ paddingLeft: "10px" }}>
              <h5>可加入的筆記：</h5>
              {notes.length === 0 ? (
                <div>目前無可加入的筆記</div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} style={{ marginBottom: "5px" }}>
                    {note.title}
                    <button
                      onClick={() => handleAddNoteToCategory(note, category.name)}
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

              {category.notes.length > 0 && (
                <>
                  <h5>已分類筆記：</h5>
                  {category.notes.map((note) => (
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
                        onClick={() => handleDeleteCategorizedNote(category.name, note.id)}
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