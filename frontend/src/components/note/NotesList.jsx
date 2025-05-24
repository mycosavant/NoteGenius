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
}) {
  const safeNotes = Array.isArray(notes) ? notes : Object.entries(notes || {});

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
      <span className="label-title">標籤列表</span>

      <div className="tag-list-scrollable">
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
          >
            <span
              style={{ flex: 1, cursor: 'pointer' }}
              onClick={() => {
                onSelectTag(tag);
                onSearchKeywordChange(tag);
              }}
            >
              {tag}
            </span>
            <div className="tag-actions">
              <button
                title="重新命名"
                onClick={(e) => {
                  e.stopPropagation();
                  const newName = prompt("請輸入新的標籤名稱:", tag);
                  if (newName && newName !== tag) onRenameTag?.(tag, newName);
                }}
              >編輯標題</button>
              <button
                title="刪除"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`確定要刪除標籤「${tag}」嗎？`)) onDeleteTag?.(tag);
                }}
              >刪除</button>
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
                <div
                  className="note-title-wrapper"
                  onClick={() => onSelectNote?.(id)}
                >
                  <span className="note-title-truncate">
                    {note.title || '（未命名）'}
                  </span>
                </div>
                <div className="note-actions">
                  <button
                    title="編輯標題"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newTitle = prompt('請輸入新的筆記標題：', note.title);
                      if (newTitle && newTitle !== note.title) {
                        onRenameNote?.(id, newTitle);
                      }
                    }}
                  >
                    編輯標題
                  </button>
                  <button
                    title="刪除"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote?.(id);
                    }}
                  >
                    刪除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
