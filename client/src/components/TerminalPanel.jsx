import React from 'react';
import {
  Terminal,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export function TerminalPanel() {
  const {
    terminalOpen,
    setTerminalOpen,
    executionResult,
    clearTerminal,
    isExecuting,
  } = useWorkspace();

  if (!terminalOpen) {
    return (
      <div className="h-7 bg-[#252526] border-t border-[#333333] flex items-center justify-between px-3 text-xs text-gray-400 select-none">
        <button
          onClick={() => setTerminalOpen(true)}
          className="flex items-center space-x-1.5 hover:text-white transition"
        >
          <Terminal size={13} />
          <span className="font-semibold text-[11px] uppercase tracking-wider">Terminal / Output</span>
          <ChevronUp size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="h-56 bg-[#181818] border-t border-[#333333] flex flex-col font-mono select-none">
      {/* Terminal Title Bar */}
      <div className="h-8 bg-[#252526] border-b border-[#333333] flex items-center justify-between px-3 text-xs text-gray-300">
        <div className="flex items-center space-x-2">
          <Terminal size={14} className="text-blue-400" />
          <span className="font-semibold text-[11px] uppercase tracking-wider text-gray-200">
            Console Output
          </span>

          {/* Status Badge */}
          {isExecuting ? (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-900/40 text-blue-400 text-[11px]">
              <Loader2 size={11} className="animate-spin" />
              <span>Executing...</span>
            </span>
          ) : executionResult ? (
            executionResult.success ? (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 text-[11px]">
                <CheckCircle2 size={12} />
                <span>Success</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/50 text-[11px]">
                <AlertCircle size={12} />
                <span>Error</span>
              </span>
            )
          ) : null}

          {/* Execution Time */}
          {executionResult && typeof executionResult.executionTimeMs === 'number' && (
            <span className="flex items-center space-x-1 text-[11px] text-gray-500 ml-2">
              <Clock size={11} />
              <span>{executionResult.executionTimeMs}ms</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={clearTerminal}
            title="Clear Output"
            className="p-1 hover:text-white hover:bg-[#333333] rounded text-gray-400 transition"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => setTerminalOpen(false)}
            title="Collapse Panel"
            className="p-1 hover:text-white hover:bg-[#333333] rounded text-gray-400 transition"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Content Body */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-xs leading-relaxed select-text space-y-2">
        {isExecuting ? (
          <div className="flex items-center space-x-2 text-gray-400 py-2">
            <Loader2 size={15} className="animate-spin text-blue-400" />
            <span>Running script in isolated environment...</span>
          </div>
        ) : executionResult ? (
          <>
            {/* Standard Output */}
            {executionResult.output && (
              <pre className="text-gray-200 whitespace-pre-wrap break-words">
                {executionResult.output}
              </pre>
            )}

            {/* Error Message */}
            {executionResult.error && (
              <div className="bg-red-950/40 border-l-2 border-red-500 p-2.5 rounded-r text-red-300 whitespace-pre-wrap break-words">
                <div className="font-semibold text-red-400 mb-0.5 flex items-center space-x-1.5">
                  <AlertCircle size={13} />
                  <span>Execution Error:</span>
                </div>
                {executionResult.error}
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600 text-[11px]">
            Press "Run Code" or Ctrl+Enter to execute JavaScript and view console output here.
          </div>
        )}
      </div>
    </div>
  );
}
