import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useWorkspace } from './context/WorkspaceContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MonacoWorkspace } from './components/MonacoWorkspace';
import { TerminalPanel } from './components/TerminalPanel';
import { AuthModal } from './components/AuthModal';
import { NewProjectModal } from './components/NewProjectModal';
import { NewFileModal } from './components/NewFileModal';
import { RenameModal } from './components/RenameModal';
import { ConfirmModal } from './components/ConfirmModal';
import { api } from './api';
import { Code2, Sparkles, Terminal, Shield, Cpu, ArrowRight, Loader2 } from 'lucide-react';

export default function App() {
  const { user, loading } = useAuth();
  const {
    activeProject,
    fetchProjects,
    selectProject,
    selectFile,
    activeFile,
  } = useWorkspace();

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [newFileModalOpen, setNewFileModalOpen] = useState(false);

  // Rename state
  const [renameTarget, setRenameTarget] = useState(null); // { item, type: 'project' | 'file' }

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null); // { item, type: 'project' | 'file', title, message, action }

  if (loading) {
    return (
      <div className="h-full w-full bg-[#1e1e1e] flex flex-col items-center justify-center text-gray-400 space-y-3">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-sm font-medium">Starting Code Master Workspace...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-gray-200 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenNewProject={() => setNewProjectModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      {user ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar
            onNewProject={() => setNewProjectModalOpen(true)}
            onRenameProject={(project) =>
              setRenameTarget({ item: project, type: 'project' })
            }
            onDeleteProject={(project) =>
              setDeleteTarget({
                item: project,
                type: 'project',
                title: 'Delete Project',
                message: `Are you sure you want to delete "${project.name}" and all of its files?`,
                action: async () => {
                  await api.deleteProject(project.id);
                  await fetchProjects();
                },
              })
            }
            onNewFile={() => setNewFileModalOpen(true)}
            onRenameFile={(file) => setRenameTarget({ item: file, type: 'file' })}
            onDeleteFile={(file) =>
              setDeleteTarget({
                item: file,
                type: 'file',
                title: 'Delete File',
                message: `Are you sure you want to permanently delete "${file.name}"?`,
                action: async () => {
                  await api.deleteFile(file.id);
                  if (activeProject) {
                    await selectProject(activeProject.id);
                  }
                },
              })
            }
          />

          {/* Center Workspace & Bottom Terminal */}
          <main className="flex-1 flex flex-col h-full overflow-hidden">
            <MonacoWorkspace />
            <TerminalPanel />
          </main>
        </div>
      ) : (
        /* Guest / Unauthenticated Landing View */
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#1e1e1e] via-[#1a1a1a] to-[#141414] text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400 font-medium">
              <Sparkles size={14} />
              <span>Browser-Based Cloud Coding Environment</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Code, organize, and execute in{' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Monaco Editor
              </span>
            </h1>

            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Code Master gives you an integrated developer workspace right in your browser.
              Manage projects, edit code with syntax highlighting, and safely run JavaScript on our isolated backend.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center space-x-4 pt-2">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:translate-y-[-1px]"
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 text-left">
              <div className="p-4 bg-[#252526]/70 border border-[#333333] rounded-lg">
                <div className="w-8 h-8 rounded bg-blue-900/30 flex items-center justify-center text-blue-400 mb-2">
                  <Code2 size={18} />
                </div>
                <h4 className="text-xs font-semibold text-white">Monaco Editor</h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  VS Code powered editing, JavaScript & JSON syntax highlighting, and keyboard shortcuts.
                </p>
              </div>

              <div className="p-4 bg-[#252526]/70 border border-[#333333] rounded-lg">
                <div className="w-8 h-8 rounded bg-emerald-900/30 flex items-center justify-center text-emerald-400 mb-2">
                  <Terminal size={18} />
                </div>
                <h4 className="text-xs font-semibold text-white">Sandboxed Runner</h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  Execute JavaScript code with isolated contexts, timeout guardrails, and real-time logs.
                </p>
              </div>

              <div className="p-4 bg-[#252526]/70 border border-[#333333] rounded-lg">
                <div className="w-8 h-8 rounded bg-purple-900/30 flex items-center justify-center text-purple-400 mb-2">
                  <Shield size={18} />
                </div>
                <h4 className="text-xs font-semibold text-white">Secure Persistence</h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  Strict user ownership, authenticated REST APIs, and instant SQLite persistence.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <NewProjectModal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
      />

      <NewFileModal
        isOpen={newFileModalOpen}
        onClose={() => setNewFileModalOpen(false)}
      />

      {renameTarget && (
        <RenameModal
          isOpen={!!renameTarget}
          item={renameTarget.item}
          type={renameTarget.type}
          onClose={() => setRenameTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title={deleteTarget.title}
          message={deleteTarget.message}
          onConfirm={deleteTarget.action}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
