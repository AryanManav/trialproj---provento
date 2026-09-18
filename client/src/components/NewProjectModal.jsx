import React, { useState } from 'react';
import { X, FolderPlus, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../api';
import { useWorkspace } from '../context/WorkspaceContext';

export function NewProjectModal({ isOpen, onClose }) {
  const { fetchProjects } = useWorkspace();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError('');
    setSubmitting(true);
    try {
      const { project } = await api.createProject(name.trim(), description.trim());
      await fetchProjects(project.id);
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#252526] border border-[#3e3e42] rounded-lg shadow-2xl w-full max-w-md overflow-hidden text-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#333333]">
          <div className="flex items-center space-x-2">
            <FolderPlus size={18} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Create New Project</h2>
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
              Project Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Algorithms Lab"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of the workspace..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
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
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center space-x-2 transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Project</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
