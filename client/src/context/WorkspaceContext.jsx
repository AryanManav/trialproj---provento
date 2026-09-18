import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [terminalOpen, setTerminalOpen] = useState(true);

  // Fetch all projects for the user
  const fetchProjects = useCallback(async (selectProjectId = null) => {
    if (!user) {
      setProjects([]);
      setActiveProject(null);
      setActiveFile(null);
      return;
    }

    setIsLoadingProjects(true);
    try {
      const data = await api.getProjects();
      setProjects(data.projects);

      // Determine which project to select
      let targetId = selectProjectId;
      if (!targetId && activeProject) {
        targetId = activeProject.id;
      }

      if (targetId && data.projects.some((p) => p.id === targetId)) {
        await selectProject(targetId);
      } else if (data.projects.length > 0) {
        await selectProject(data.projects[0].id);
      } else {
        setActiveProject(null);
        setActiveFile(null);
        setFileContent('');
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [user]);

  // Select active project and load its details with files
  const selectProject = async (projectId) => {
    try {
      const { project } = await api.getProject(projectId);
      setActiveProject(project);

      // Select first file if available
      if (project.files && project.files.length > 0) {
        const fileToSelect = project.files[0];
        setActiveFile(fileToSelect);
        setFileContent(fileToSelect.content || '');
        setHasUnsavedChanges(false);
      } else {
        setActiveFile(null);
        setFileContent('');
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
    }
  };

  // Select active file
  const selectFile = (file) => {
    if (activeFile && activeFile.id === file.id) return;
    setActiveFile(file);
    setFileContent(file.content || '');
    setHasUnsavedChanges(false);
  };

  // Content change handler for Monaco Editor
  const handleContentChange = (newContent) => {
    setFileContent(newContent);
    if (activeFile && newContent !== activeFile.content) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  };

  // Save current file
  const saveCurrentFile = async () => {
    if (!activeFile) return;
    setIsSaving(true);
    try {
      const { file } = await api.updateFile(activeFile.id, { content: fileContent });
      setActiveFile(file);
      setHasUnsavedChanges(false);

      // Also update in activeProject.files
      setActiveProject((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          files: prev.files.map((f) => (f.id === file.id ? file : f)),
        };
      });
      return file;
    } catch (err) {
      console.error('Failed to save file:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Execute current code
  const runCode = async () => {
    if (!activeFile) return;

    // Save first if there are unsaved changes
    if (hasUnsavedChanges) {
      await saveCurrentFile();
    }

    setIsExecuting(true);
    setTerminalOpen(true);
    try {
      const result = await api.executeCode(fileContent, activeFile.language);
      setExecutionResult(result);
    } catch (err) {
      setExecutionResult({
        success: false,
        output: '',
        error: err.message || 'Execution request failed',
        executionTimeMs: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Clear terminal
  const clearTerminal = () => {
    setExecutionResult(null);
  };

  // Reload projects when user logs in
  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setActiveProject(null);
      setActiveFile(null);
      setFileContent('');
      setExecutionResult(null);
    }
  }, [user]);

  return (
    <WorkspaceContext.Provider
      value={{
        projects,
        activeProject,
        activeFile,
        fileContent,
        isSaving,
        hasUnsavedChanges,
        isLoadingProjects,
        isExecuting,
        executionResult,
        terminalOpen,
        setTerminalOpen,
        fetchProjects,
        selectProject,
        selectFile,
        handleContentChange,
        saveCurrentFile,
        runCode,
        clearTerminal,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
