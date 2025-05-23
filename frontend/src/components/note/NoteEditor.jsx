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
  initialTags = [],  // ✅ 修改為陣列
  tags = [],
  onSave,
  onCreateTag,
}) {
  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [selectedTags, setSelectedTags] = useState(initialTags); // ✅ 多選初始化
  const [activeTab, setActiveTab] = useState('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setSelectedTags(initialTags);
  }, [initialTags]);

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (
        noteId &&
        (
          title !== initialTitle ||
          content !== initialContent ||
          JSON.stringify(selectedTags.sort()) !== JSON.stringify(initialTags.sort())
        )
      ) {
        saveNote();
      }
    }, 2000);
    return () => clearTimeout(saveTimer);
  }, [title, content, selectedTags]);

  // ✅ 當全域 tags 改變時，自動移除不存在的 selectedTags
  useEffect(() => {
    setSelectedTags(prev =>
      prev.filter(tag => tags.includes(tag))
    );
  }, [tags]);

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

  if (!noteId) {
    return <div className="note-editor-placeholder">請選擇或創建一個筆記</div>;
  }

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
          <button className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>預覽</button>
          <button className={`tab-button ${activeTab === 'split' ? 'active' : ''}`} onClick={() => setActiveTab('split')}>分割視圖</button>
        </div>
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
                  onCreateTag(inputValue); // 新增全域標籤
                  setSelectedTags(prev => {
                    const updated = [...prev, inputValue];
                    // ✅ 自動儲存筆記，加上新標籤
                    if (noteId) {
                      onSave(noteId, title, content, updated);
                    }
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
            theme="vs-light"
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
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
                theme="vs-light"
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
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
