import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { FileCode2, Code, Loader2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export function MonacoWorkspace() {
  const {
    activeFile,
    fileContent,
    handleContentChange,
    saveCurrentFile,
    runCode,
    hasUnsavedChanges,
  } = useWorkspace();

  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Add Ctrl+S / Cmd+S save command
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveCurrentFile();
    });

    // Add Ctrl+Enter / Cmd+Enter run code command
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCode();
    });
  };

  // Keyboard shortcut fallback at window level
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentFile();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveCurrentFile, runCode]);

  if (!activeFile) {
    return (
      <div className="flex-1 bg-[#1e1e1e] flex flex-col items-center justify-center text-gray-500 select-none">
        <div className="w-16 h-16 rounded-2xl bg-[#252526] border border-[#333333] flex items-center justify-center mb-4 text-gray-400 shadow-inner">
          <Code size={32} />
        </div>
        <h3 className="text-base font-semibold text-gray-300">No File Selected</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm text-center">
          Select a file from the explorer on the left or create a new file to start coding.
        </p>
        <div className="mt-4 flex items-center space-x-4 text-[11px] text-gray-500">
          <span><kbd className="px-1.5 py-0.5 bg-[#2d2d2d] border border-[#444] rounded text-gray-400 font-mono">Ctrl+S</kbd> to save</span>
          <span><kbd className="px-1.5 py-0.5 bg-[#2d2d2d] border border-[#444] rounded text-gray-400 font-mono">Ctrl+Enter</kbd> to run</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
      {/* File Tab Bar */}
      <div className="h-9 bg-[#252526] border-b border-[#333333] flex items-center px-2 select-none">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#1e1e1e] border-t-2 border-blue-500 text-xs text-gray-200 rounded-t">
          <FileCode2 size={14} className="text-blue-400" />
          <span className="font-medium">{activeFile.name}</span>
          {hasUnsavedChanges && (
            <span
              title="Unsaved changes"
              className="w-2 h-2 rounded-full bg-blue-400 ml-1 inline-block"
            />
          )}
        </div>
        <div className="ml-auto text-[11px] text-gray-500 flex items-center space-x-3 pr-2 font-mono">
          <span>Language: {activeFile.language}</span>
          <span>UTF-8</span>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={activeFile.language || 'javascript'}
          value={fileContent}
          onChange={handleContentChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            padding: { top: 12, bottom: 12 },
          }}
          loading={
            <div className="flex items-center justify-center h-full text-xs text-gray-400 space-x-2">
              <Loader2 size={16} className="animate-spin text-blue-500" />
              <span>Loading Monaco Editor...</span>
            </div>
          }
        />
      </div>
    </div>
  );
}
