import React, { useState } from 'react';
import {
  FolderPlus,
  FilePlus,
  Trash2,
  Edit2,
  FileCode2,
  FileJson,
  FileText,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  MoreVertical,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

function getFileIcon(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
      return <FileCode2 size={15} className="text-yellow-400 shrink-0" />;
    case 'json':
      return <FileJson size={15} className="text-emerald-400 shrink-0" />;
    case 'ts':
    case 'tsx':
      return <FileCode2 size={15} className="text-blue-400 shrink-0" />;
    case 'html':
      return <FileCode2 size={15} className="text-orange-400 shrink-0" />;
    case 'css':
      return <FileCode2 size={15} className="text-sky-400 shrink-0" />;
    default:
      return <FileText size={15} className="text-gray-400 shrink-0" />;
  }
}

export function Sidebar({
  onNewProject,
  onRenameProject,
  onDeleteProject,
  onNewFile,
  onRenameFile,
  onDeleteFile,
}) {
  const {
    projects,
    activeProject,
    selectProject,
    activeFile,
    selectFile,
    hasUnsavedChanges,
    isLoadingProjects,
  } = useWorkspace();

  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [fileMenuId, setFileMenuId] = useState(null);

  return (
    <aside className="w-64 bg-[#252526] border-r border-[#333333] flex flex-col h-full select-none">
      {/* Top Header / Explorer label */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-[#333333] text-gray-400 text-xs font-bold tracking-wider uppercase">
        <span>Explorer</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={onNewProject}
            title="New Project"
            className="p-1 hover:text-white hover:bg-[#333333] rounded transition"
          >
            <FolderPlus size={15} />
          </button>
          {activeProject && (
            <button
              onClick={onNewFile}
              title="New File"
              className="p-1 hover:text-white hover:bg-[#333333] rounded transition"
            >
              <FilePlus size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Project details and actions */}
      {activeProject ? (
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Active Project Title bar with menu */}
          <div className="group relative flex items-center justify-between px-3 py-2 bg-[#2a2d2e] border-b border-[#333333] text-xs font-semibold text-gray-200">
            <div className="flex items-center space-x-2 truncate">
              <FolderOpen size={16} className="text-blue-400 shrink-0" />
              <span className="truncate" title={activeProject.name}>
                {activeProject.name}
              </span>
            </div>

            <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
              <button
                onClick={() => onRenameProject(activeProject)}
                title="Rename Project"
                className="p-1 hover:text-white hover:bg-[#3e3e42] rounded text-gray-400"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={() => onDeleteProject(activeProject)}
                title="Delete Project"
                className="p-1 hover:text-red-400 hover:bg-[#3e3e42] rounded text-gray-400"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Files List in Project */}
          <div className="p-1 flex-1 overflow-y-auto">
            {activeProject.files && activeProject.files.length > 0 ? (
              <div className="space-y-0.5">
                {activeProject.files.map((file) => {
                  const isActive = activeFile?.id === file.id;
                  const isModified = isActive && hasUnsavedChanges;

                  return (
                    <div
                      key={file.id}
                      onClick={() => selectFile(file)}
                      className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer transition ${
                        isActive
                          ? 'bg-[#37373d] text-white font-medium'
                          : 'text-gray-300 hover:bg-[#2a2d2e] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate pr-2">
                        {getFileIcon(file.name)}
                        <span className="truncate">{file.name}</span>
                        {isModified && (
                          <span
                            title="Unsaved changes"
                            className="w-2 h-2 rounded-full bg-blue-400 inline-block shrink-0"
                          />
                        )}
                      </div>

                      {/* File action buttons on hover */}
                      <div className="hidden group-hover:flex items-center space-x-1 text-gray-400">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRenameFile(file);
                          }}
                          title="Rename File"
                          className="p-1 hover:text-white hover:bg-[#46464d] rounded"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFile(file);
                          }}
                          title="Delete File"
                          className="p-1 hover:text-red-400 hover:bg-[#46464d] rounded"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-gray-500">
                <p>No files in this project.</p>
                <button
                  onClick={onNewFile}
                  className="mt-2 text-blue-400 hover:underline inline-flex items-center space-x-1"
                >
                  <FilePlus size={13} />
                  <span>Create a file</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-gray-500 flex-1 flex flex-col items-center justify-center">
          {isLoadingProjects ? (
            <p>Loading projects...</p>
          ) : (
            <>
              <Folder size={32} className="text-gray-600 mb-2" />
              <p className="font-medium text-gray-400">No Project Open</p>
              <p className="mt-1 text-gray-500">Create or select a project to begin writing code.</p>
              <button
                onClick={onNewProject}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs transition"
              >
                + Create Project
              </button>
            </>
          )}
        </div>
      )}

      {/* Footer quick projects drawer */}
      <div className="border-t border-[#333333] p-2 bg-[#1f1f20] text-xs">
        <div className="text-[11px] font-semibold text-gray-500 uppercase px-2 mb-1">
          Projects ({projects.length})
        </div>
        <div className="max-h-36 overflow-y-auto space-y-0.5">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => selectProject(p.id)}
              className={`px-2 py-1 rounded cursor-pointer truncate flex items-center justify-between ${
                activeProject?.id === p.id
                  ? 'bg-[#37373d] text-white font-medium'
                  : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'
              }`}
            >
              <span className="truncate">{p.name}</span>
              <span className="text-[10px] text-gray-500 ml-1 shrink-0">
                {p._count?.files ?? 0} files
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
