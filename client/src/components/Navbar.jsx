import React from 'react';
import { Play, Save, Code2, FolderGit2, LogOut, User, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';

export function Navbar({ onOpenNewProject, onOpenAuth }) {
  const { user, logout } = useAuth();
  const {
    projects,
    activeProject,
    selectProject,
    activeFile,
    saveCurrentFile,
    runCode,
    isSaving,
    isExecuting,
    hasUnsavedChanges,
  } = useWorkspace();

  const isJsFile = activeFile && (activeFile.language === 'javascript' || activeFile.name.endsWith('.js'));

  return (
    <header className="h-12 bg-[#2d2d2d] border-b border-[#3e3e42] flex items-center justify-between px-4 select-none z-10">
      {/* Brand & Active Project */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-white font-semibold tracking-wide">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white shadow-sm">
            <Code2 size={18} />
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            Code Master
          </span>
        </div>

        {user && (
          <div className="flex items-center space-x-2 border-l border-[#454545] pl-4">
            <FolderGit2 size={16} className="text-gray-400" />
            <select
              value={activeProject?.id || ''}
              onChange={(e) => selectProject(e.target.value)}
              className="bg-[#1e1e1e] text-gray-200 text-xs rounded px-2.5 py-1.5 border border-[#3e3e42] focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
            >
              {projects.length === 0 && <option value="">No Projects Found</option>}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={onOpenNewProject}
              title="Create New Project"
              className="text-xs bg-[#3a3a3a] hover:bg-[#484848] text-gray-200 px-2 py-1.5 rounded transition border border-[#484848]"
            >
              + New
            </button>
          </div>
        )}
      </div>

      {/* Editor & Execution Actions */}
      {user && activeFile && (
        <div className="flex items-center space-x-3">
          {/* Save Status & Button */}
          <button
            onClick={saveCurrentFile}
            disabled={isSaving || !hasUnsavedChanges}
            title={hasUnsavedChanges ? "Save file (Ctrl+S)" : "All changes saved"}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded font-medium transition ${
              hasUnsavedChanges
                ? 'bg-[#007acc] hover:bg-[#0062a3] text-white shadow'
                : 'bg-[#383838] text-gray-400 cursor-default'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Save size={14} />
                <span>Save</span>
              </>
            ) : (
              <>
                <Check size={14} className="text-emerald-400" />
                <span>Saved</span>
              </>
            )}
          </button>

          {/* Run Code Button */}
          <button
            onClick={runCode}
            disabled={isExecuting || !isJsFile}
            title={
              !isJsFile
                ? "Execution is supported for JavaScript files (.js)"
                : "Run JavaScript code (Ctrl+Enter)"
            }
            className={`flex items-center space-x-1.5 text-xs px-3.5 py-1.5 rounded font-medium transition ${
              !isJsFile
                ? 'bg-[#383838] text-gray-500 cursor-not-allowed'
                : isExecuting
                ? 'bg-emerald-700 text-white cursor-wait'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
            }`}
          >
            {isExecuting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Auth State & User Menu */}
      <div className="flex items-center space-x-3">
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs text-gray-300 bg-[#222222] px-2.5 py-1 rounded-full border border-[#3e3e42]">
              <User size={13} className="text-blue-400" />
              <span className="font-medium max-w-[140px] truncate">{user.name}</span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="text-xs text-gray-400 hover:text-red-400 p-1.5 rounded hover:bg-[#383838] transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded font-medium transition"
          >
            Sign In / Register
          </button>
        )}
      </div>
    </header>
  );
}
