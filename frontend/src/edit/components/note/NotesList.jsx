// src/components/note/NotesList.jsx
import React from 'react';
import './NotesList.css';

export function NotesList({
  notes,
  selectedNote,
  onSelectNote,
  onDeleteNote,
  categories, // 傳進來還叫 categories，但實際上就是標籤
  selectedCategory,
  onSelectCategory,
  onCreateCategory,
}) {
  // notes還是原本結構，categories 其實就是 tags
  const safeNotes = Array.isArray(notes) ? notes : Object.entries(notes || {});

  return (
    <div className="notes-list">
      {/* 分類標題→標籤 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 'bold', marginRight: 6 }}>標籤</span>
        <button
          style={{
            background: '#fff',
            border: '1px solid #bbb',
            borderRadius: 4,
            padding: '0 8px',
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
          onClick={() => {
            const name = prompt('請輸入新標籤名稱');
            if (name) onCreateCategory?.(name);
          }}
        >+</button>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div
          className={`category-item${!selectedCategory ? ' selected' : ''}`}
          onClick={() => onSelectCategory?.(null)}
          style={{ cursor: 'pointer', color: !selectedCategory ? '#1677ff' : '#222', marginBottom: 6 }}
        >
          所有筆記
        </div>
        {categories && categories.map((cat) => (
          <div
            key={cat}
            className={`category-item${selectedCategory === cat ? ' selected' : ''}`}
            onClick={() => onSelectCategory?.(cat)}
            style={{ cursor: 'pointer', color: selectedCategory === cat ? '#1677ff' : '#444', marginBottom: 6, paddingLeft: 8 }}
          >
            {cat}
          </div>
        ))}
      </div>
      {/* 筆記清單 */}
      <div style={{ borderTop: '1px solid #eee', paddingTop: 10 }}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>筆記列表</div>
        {safeNotes.length === 0 ? (
          <div style={{ color: '#aaa', textAlign: 'center', marginTop: 30 }}>
            沒有筆記，請創建一個新筆記
          </div>
        ) : (
          <ul className="notes-ul">
            {safeNotes
              .filter(([id, note]) =>
                !selectedCategory || note.tag === selectedCategory)
              .map(([id, note]) => (
                <li
                  key={id}
                  className={`note-item${selectedNote === id ? ' selected' : ''}`}
                  onClick={() => onSelectNote?.(id)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 6,
                    marginBottom: 6,
                    background: selectedNote === id ? '#e6f4ff' : undefined,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center'
                  }}
                >
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {note.title || '（未命名）'}
                  </span>
                  <button
                    style={{
                      background: '#fff',
                      color: '#ff4d4f',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      marginLeft: 8,
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote?.(id);
                    }}
                  >刪除</button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
