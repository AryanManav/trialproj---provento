import React, { useState } from 'react';
import { X, FilePlus, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../api';
import { useWorkspace } from '../context/WorkspaceContext';

export function NewFileModal({ isOpen, onClose }) {
  const { activeProject, selectProject, selectFile } = useWorkspace();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !activeProject) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError('');
    setSubmitting(true);
    try {
      const { file } = await api.createFile(activeProject.id, name.trim());
      // Reload project to update file tree and select the newly created file
      await selectProject(activeProject.id);
      selectFile(file);
      setName('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create file');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#252526] border border-[#3e3e42] rounded-lg shadow-2xl w-full max-w-sm overflow-hidden text-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#333333]">
          <div className="flex items-center space-x-2">
            <FilePlus size={18} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">New File</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-950/60 border border-red-800 text-red-300 rounded text-xs">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              File Name (e.g. <span className="font-mono text-gray-300">script.js</span> or <span className="font-mono text-gray-300">data.json</span>)
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="script.js"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center space-x-2 transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create File</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
