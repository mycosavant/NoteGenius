import './NotesList.css';

export default function NotesList({
  notes,
  selectedNote,
  onSelectNote,
  onDeleteNote,
  tags,
  selectedTag,
  onSelectTag,
  onCreateTag,
  onRenameTag,
  onDeleteTag,
}) {
  const safeNotes = Array.isArray(notes) ? notes : Object.entries(notes || {});

  const filteredNotes = safeNotes.filter(([_, note]) => {
    if (selectedTag === 'ALL') return true;
    if (selectedTag === 'UNTAGGED') return !note.tags || note.tags.length === 0;
    return Array.isArray(note.tags) &&
      note.tags.some(t => t.name === selectedTag);
  });

  return (
    <div className="notes-list">
      <div className="label-header">
        <span className="label-title">標籤</span>
        <button
          onClick={() => {
            const name = prompt('請輸入新標籤名稱:');
            if (name) onCreateTag(name);
          }}
          className="add-category"
        >+</button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div
          className={`category-item category-all${selectedTag === 'ALL' ? ' selected' : ''}`}
          onClick={() => onSelectTag('ALL')}
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
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingRight: '4px'
            }}
          >
            <span
              style={{ flex: 1, cursor: 'pointer' }}
              onClick={() => onSelectTag(tag)}
            >
              {tag}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                title="重新命名"
                onClick={(e) => {
                  e.stopPropagation();
                  const newName = prompt("請輸入新的標籤名稱:", tag);
                  if (newName && newName !== tag) onRenameTag?.(tag, newName);
                }}
                style={{ fontSize: '0.8rem' }}
              >✎</button>
              <button
                title="刪除"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`確定要刪除標籤「${tag}」嗎？`)) onDeleteTag?.(tag);
                }}
                style={{ fontSize: '0.8rem' }}
              >🗑</button>
            </div>
          </div>
        ))}
      </div>

      <div className="note-section-header">
        <div className="note-section-title">筆記列表</div>
        {filteredNotes.length === 0 ? (
          <div className="note-empty">沒有筆記</div>
        ) : (
          <ul className="notes-ul">
            {filteredNotes.map(([id, note]) => (
              <li
                key={id}
                className={`note-item note-item-custom${selectedNote === id ? ' selected' : ''}`}
                onClick={() => onSelectNote?.(id)}
              >
                <span className="note-title-truncate">
                  {note.title || '（未命名）'}
                </span>
                <button
                  className="delete-note"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote?.(id);
                  }}
                >
                  刪除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
