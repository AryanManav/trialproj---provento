import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#252526] border border-[#3e3e42] rounded-lg shadow-2xl w-full max-w-sm overflow-hidden text-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#333333]">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertTriangle size={18} />
            <h2 className="text-sm font-semibold text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs text-gray-300">
          <p>{message}</p>
          <p className="text-[11px] text-gray-500">This action cannot be undone.</p>
        </div>

        <div className="flex items-center justify-end space-x-3 px-5 py-3 bg-[#1f1f20] border-t border-[#333333]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold flex items-center space-x-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={13} />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
