import { useState, useEffect } from 'react';
import './NotesList.css';

export default function NotesList({
  notes,
  selectedNote,
  onSelectNote,
  onDeleteNote,
  tags,
  selectedTag,
  onSelectTag,
  onRenameTag,
  onRenameNote,
  onDeleteTag,
  searchKeyword,
  onSearchKeywordChange,
  handleCreateNoteWithTag,
}) {
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempTitle, setTempTitle] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [tempTag, setTempTag] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [openTagDropdown, setOpenTagDropdown] = useState(null);
  const [tagListOpen, setTagListOpen] = useState(true);

  const safeNotes = Array.isArray(notes) ? notes : Object.entries(notes || {});

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      document.documentElement.className = saved;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.className = 'dark';
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const next = html.classList.contains('dark') ? 'light' : 'dark';
    html.className = next;
    localStorage.setItem('theme', next);
  };

  const filteredNotes = safeNotes.filter(([_, note]) => {
    const noteTagNames = Array.isArray(note.tags) ? note.tags.map(t => t.name) : [];
    const tagMatch =
      selectedTag === 'ALL'
        ? true
        : selectedTag === 'UNTAGGED'
          ? noteTagNames.length === 0
          : noteTagNames.includes(selectedTag);
    const keyword = searchKeyword.trim().toLowerCase();
    const keywordMatch =
      keyword === '' ||
      (note.title && note.title.toLowerCase().includes(keyword)) ||
      (note.content && note.content.toLowerCase().includes(keyword)) ||
      noteTagNames.some(tagName => tagName.toLowerCase().includes(keyword));
    return tagMatch && keywordMatch;
  });

  const handleNoteRename = (id) => {
    onRenameNote(id, tempTitle);
    setEditingNoteId(null);
    setOpenDropdownId(null);
  };

  const handleTagRename = (oldName) => {
    onRenameTag(oldName, tempTag);
    setEditingTag(null);
    setOpenTagDropdown(null);
  };

  return (
    <div className="notes-list">
      <div className="label-header">
        <input
          type="text"
          placeholder="搜尋筆記名稱或是標籤..."
          value={searchKeyword}
          onChange={(e) => onSearchKeywordChange(e.target.value)}
          style={{ width: '100%', padding: '6px', marginBottom: '10px', boxSizing: 'border-box' }}
        />
      </div>

      <span className="label-title">
        標籤列表
        <button
          className="toggle-collapse"
          onClick={() => setTagListOpen(prev => !prev)}
          title={tagListOpen ? '收合' : '展開'}
        >
          {tagListOpen ? '−' : '+'}
        </button>
      </span>

      <div className={`collapsible ${tagListOpen ? 'open' : 'closed'} tag-list-scrollable`}>
        <div
          className={`category-item category-all${selectedTag === 'ALL' ? ' selected' : ''}`}
          onClick={() => {
            onSelectTag('ALL');
            onSearchKeywordChange('');
          }}
        >
          所有筆記
        </div>
        <div
          className={`category-item category-untagged${selectedTag === 'UNTAGGED' ? ' selected' : ''}`}
          onClick={() => onSelectTag('UNTAGGED')}
        >
          無標籤
        </div>
        {tags.map(tag => (
          <div
            key={tag}
            className={`category-item category-item-custom${selectedTag === tag ? ' selected' : ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            {editingTag === tag ? (
              <input
                value={tempTag}
                onChange={(e) => setTempTag(e.target.value)}
                onBlur={() => handleTagRename(tag)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTagRename(tag);
                }}
                autoFocus
              />
            ) : (
              <span
                style={{ flex: 1, cursor: 'pointer' }}
                onClick={() => {
                  onSelectTag(tag);
                  onSearchKeywordChange(tag);
                }}
              >
                {tag}
              </span>
            )}

            <div className="note-dropdown-wrapper">
              <button className="note-dropdown-toggle" onClick={() => setOpenTagDropdown(openTagDropdown === tag ? null : tag)}>⋮</button>
              {openTagDropdown === tag && (
                <div className="note-dropdown-menu">
                  <div className="note-dropdown-item" onClick={() => {
                    setTempTag(tag);
                    setEditingTag(tag);
                  }}>重新命名</div>
                  <div className="note-dropdown-item" onClick={() => onDeleteTag(tag)}>刪除</div>
                  <div className="note-dropdown-item" onClick={() => handleCreateNoteWithTag(tag)}>新增筆記</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <span className="label-title">筆記列表</span>
      <div className="note-section-scrollable">
        {filteredNotes.length === 0 ? (
          <div className="note-empty">沒有筆記</div>
        ) : (
          <ul className="notes-ul">
            {filteredNotes.map(([id, note]) => (
              <li
                key={id}
                className={`note-item note-item-custom${selectedNote === id ? ' selected' : ''}`}
              >
                {editingNoteId === id ? (
                  <input
                    className="note-title-edit-input"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={() => handleNoteRename(id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNoteRename(id);
                    }}
                    autoFocus
                  />
                ) : (
                  <div
                    className="note-title-wrapper"
                    onClick={() => onSelectNote?.(id)}
                  >
                    <span className="note-title-truncate">
                      {note.title || '（未命名）'}
                    </span>
                  </div>
                )}

                <div className="note-dropdown-wrapper">
                  <button className="note-dropdown-toggle" onClick={() => setOpenDropdownId(openDropdownId === id ? null : id)}>⋮</button>
                  {openDropdownId === id && (
                    <div className="note-dropdown-menu">
                      <div className="note-dropdown-item" onClick={() => {
                        setTempTitle(note.title);
                        setEditingNoteId(id);
                      }}>重新命名</div>
                      <div className="note-dropdown-item delete" onClick={() => onDeleteNote?.(id)}>刪除</div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button onClick={toggleTheme} title="切換黑色模式" className="dark-toggle-btn">🌓</button>
      </div>
    </div>
  );
}
