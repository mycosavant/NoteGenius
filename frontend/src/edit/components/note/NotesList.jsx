// src/components/note/NotesList.jsx
import React, { useState } from 'react';
import './NotesList.css';

export function NotesList({
  notes,
  selectedNote,
  onSelectNote,
  onDeleteNote,
  categories,
  selectedCategory,
  onSelectCategory,
  onCreateCategory,
}) {
  const [newCategory, setNewCategory] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  // 根據選定的分類過濾筆記
  const filteredNotes = Object.entries(notes).filter(([_, note]) => {
    if (!selectedCategory) return true;
    return note.category === selectedCategory;
  });

  const handleCreateCategory = () => {
    if (newCategory) {
      onCreateCategory(newCategory);
      setNewCategory('');
      setShowCategoryDialog(false);
    }
  };

  return (
    <div className="notes-list">
      <div className="categories-section">
        {/* 分類區域 */}
        <div className="section-header" onClick={() => setCategoriesOpen(!categoriesOpen)}>
          <span className="section-title">
            <span className={`chevron ${categoriesOpen ? 'down' : 'right'}`}></span>
            分類
          </span>
          <button 
            className="add-button" 
            onClick={(e) => {
              e.stopPropagation();
              setShowCategoryDialog(true);
            }}
          >
            +
          </button>
        </div>
        
        {categoriesOpen && (
          <div className="categories-list">
            <div
              className={`category-item ${!selectedCategory ? 'active' : ''}`}
              onClick={() => onSelectCategory(null)}
            >
              <span>所有筆記</span>
            </div>
            {categories.map((category) => (
              <div
                key={category}
                className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => onSelectCategory(category)}
              >
                <span>{category}</span>
                <span className="note-count">
                  {Object.values(notes).filter((note) => note.category === category).length}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="notes-section">
        <div className="section-header">
          <span className="section-title">筆記列表</span>
        </div>

        <div className="notes-grid">
          {filteredNotes.length === 0 ? (
            <div className="no-notes">
              {selectedCategory ? `${selectedCategory} 分類中沒有筆記` : '沒有筆記，請創建一個新筆記'}
            </div>
          ) : (
            filteredNotes.map(([id, note]) => (
              <div
                key={id}
                className={`note-item ${selectedNote === id ? 'active' : ''}`}
                onClick={() => onSelectNote(id)}
              >
                <div className="note-content">
                  <div className="note-title">{note.title}</div>
                  {note.category && <div className="note-category">{note.category}</div>}
                  {note.tags && note.tags.length > 0 && (
                    <div className="note-tags">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="note-tag">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="note-tag">+{note.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('確定要刪除這個筆記嗎？')) {
                      onDeleteNote(id);
                    }
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 新增分類對話框 */}
      {showCategoryDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">新增分類</div>
            <div className="dialog-content">
              <label htmlFor="category-name">分類名稱</label>
              <input
                id="category-name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="輸入分類名稱"
              />
            </div>
            <div className="dialog-footer">
              <button onClick={() => setShowCategoryDialog(false)}>取消</button>
              <button onClick={handleCreateCategory}>創建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}