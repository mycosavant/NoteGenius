import { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CreatableSelect from 'react-select/creatable';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import './NoteEditor.css';

export default function NoteEditor({
  noteId,
  initialTitle,
  initialContent,
  initialTags = [],
  tags = [],
  onSave,
  onCreateTag,
}) {
  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [selectedTags, setSelectedTags] = useState(initialTags);
  const [activeTab, setActiveTab] = useState('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const isDark = document.body.classList.contains('dark');

  useEffect(() => setSelectedTags(initialTags), [initialTags]);
  useEffect(() => setSelectedTags(prev => prev.filter(tag => tags.includes(tag))), [tags]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        noteId &&
        (title !== initialTitle ||
          content !== initialContent ||
          JSON.stringify(selectedTags.sort()) !== JSON.stringify(initialTags.sort()))
      ) {
        saveNote();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, content, selectedTags]);

  const saveNote = () => {
    if (!noteId) return;
    setIsSaving(true);
    onSave(noteId, title, content, selectedTags);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 500);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !noteId) return;

    const formData = new FormData();
    formData.append('note', noteId);
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:8000/api/note-images/', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || '圖片上傳失敗');
      }

      const data = await res.json();
      const imageUrl = data.image.startsWith('/')
        ? `http://localhost:8000${data.image}`
        : data.image;

      setContent(prev => `${prev}\n\n![](${imageUrl})`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!noteId) return <div className="note-editor-placeholder">請選擇或創建一個筆記</div>;

  return (
    <div className="note-editor">
      <div className="note-editor-header">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="筆記標題"
          className="note-title-input"
        />
      </div>

      <div className="note-editor-toolbar">
        <div className="note-editor-tabs">
          <button className={`tab-button ${activeTab === 'edit' ? 'active' : ''}`} onClick={() => setActiveTab('edit')}>編輯</button>
          <button className={`tab-button ${activeTab === 'split' ? 'active' : ''}`} onClick={() => setActiveTab('split')}>分割視圖</button>
          <button className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>預覽</button>
        </div>
        <label className="upload-button">
          📷 上傳圖片
          <input type="file" accept="image/*" onChange={handleUploadImage} style={{ display: 'none' }} />
        </label>
        <Button onClick={saveNote} disabled={isSaving} className="save-button">
          {isSaving ? '保存中...' : saveSuccess ? '已保存' : '保存'}
        </Button>
      </div>

      <div className="note-metadata">
        <div className="category-selector">
          <span>標籤:</span>
          <div style={{ flex: 1 }}>
            <CreatableSelect
              isMulti
              options={tags.map(tag => ({ value: tag, label: tag }))}
              value={selectedTags.map(tag => ({ value: tag, label: tag }))}
              onChange={(selectedOptions) =>
                setSelectedTags(selectedOptions.map(opt => opt.value))
              }
              onCreateOption={(inputValue) => {
                if (!tags.includes(inputValue)) {
                  onCreateTag(inputValue);
                  setSelectedTags(prev => {
                    const updated = [...prev, inputValue];
                    if (noteId) onSave(noteId, title, content, updated);
                    return updated;
                  });
                }
              }}
              classNamePrefix="react-select"
              placeholder="選擇或輸入標籤..."
              noOptionsMessage={() => '無匹配標籤'}
            />
          </div>
        </div>
      </div>

      <div className="note-editor-content">
        {activeTab === 'edit' && (
          <Editor
            height="100%"
            defaultLanguage="markdown"
            value={content}
            onChange={(value) => setContent(value || '')}
            theme={isDark ? 'vs-dark' : 'vs-light'}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              lineNumbers: 'off',
              fontSize: 14,
              scrollBeyondLastLine: false,
            }}
          />
        )}
        {activeTab === 'preview' && (
          <div className="markdown-preview">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ node, ...props }) => (
                  <img {...props} style={{ maxWidth: '100%', height: 'auto' }} />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
        {activeTab === 'split' && (
          <div className="split-view">
            <div className="editor-pane">
              <Editor
                height="100%"
                defaultLanguage="markdown"
                value={content}
                onChange={(value) => setContent(value || '')}
                theme={isDark ? 'vs-dark' : 'vs-light'}
                options={{
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  lineNumbers: 'off',
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
            <div className="preview-pane">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ node, ...props }) => (
                    <img {...props} style={{ maxWidth: '100%', height: 'auto' }} />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
