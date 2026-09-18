import express from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

function detectLanguage(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'mjs':
    case 'cjs':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
}

const createFileSchema = z.object({
  name: z.string().min(1, 'File name is required').max(100),
  content: z.string().optional(),
});

const updateFileSchema = z.object({
  name: z.string().min(1, 'File name cannot be empty').max(100).optional(),
  content: z.string().optional(),
});

// Helper: check if authenticated user owns the project
async function userOwnsProject(projectId, userId) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  return !!project;
}

// Helper: check if authenticated user owns the file
async function getFileWithOwnership(fileId, userId) {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: { project: true },
  });

  if (!file || file.project.userId !== userId) {
    return null;
  }
  return file;
}

// POST /api/projects/:projectId/files - Create file in project
router.post('/projects/:projectId/files', async (req, res) => {
  try {
    const { projectId } = req.params;

    const owns = await userOwnsProject(projectId, req.user.id);
    if (!owns) {
      return res.status(404).json({ error: 'Project not found or access denied.' });
    }

    const parseResult = createFileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: parseResult.error.errors.map((e) => e.message).join(', '),
      });
    }

    const name = parseResult.data.name.trim();

    // Check if file name already exists in project
    const existing = await prisma.file.findFirst({
      where: { projectId, name },
    });

    if (existing) {
      return res.status(409).json({ error: `A file named '${name}' already exists in this project.` });
    }

    const language = detectLanguage(name);
    const content = parseResult.data.content ?? '';

    const file = await prisma.file.create({
      data: {
        name,
        content,
        language,
        projectId,
      },
    });

    res.status(201).json({ file });
  } catch (err) {
    console.error('Create file error:', err);
    res.status(500).json({ error: 'Failed to create file.' });
  }
});

// GET /api/files/:id - Get single file
router.get('/files/:id', async (req, res) => {
  try {
    const file = await getFileWithOwnership(req.params.id, req.user.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found or access denied.' });
    }

    res.json({ file });
  } catch (err) {
    console.error('Get file error:', err);
    res.status(500).json({ error: 'Failed to fetch file.' });
  }
});

// PUT /api/files/:id - Update file content or rename
router.put('/files/:id', async (req, res) => {
  try {
    const file = await getFileWithOwnership(req.params.id, req.user.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found or access denied.' });
    }

    const parseResult = updateFileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: parseResult.error.errors.map((e) => e.message).join(', '),
      });
    }

    const updateData = {};

    if (parseResult.data.name !== undefined) {
      const newName = parseResult.data.name.trim();
      if (newName !== file.name) {
        // Check collision
        const collision = await prisma.file.findFirst({
          where: {
            projectId: file.projectId,
            name: newName,
            id: { not: file.id },
          },
        });
        if (collision) {
          return res.status(409).json({ error: `A file named '${newName}' already exists in this project.` });
        }
        updateData.name = newName;
        updateData.language = detectLanguage(newName);
      }
    }

    if (parseResult.data.content !== undefined) {
      updateData.content = parseResult.data.content;
    }

    const updatedFile = await prisma.file.update({
      where: { id: file.id },
      data: updateData,
    });

    res.json({ file: updatedFile });
  } catch (err) {
    console.error('Update file error:', err);
    res.status(500).json({ error: 'Failed to update file.' });
  }
});

// DELETE /api/files/:id - Delete file
router.delete('/files/:id', async (req, res) => {
  try {
    const file = await getFileWithOwnership(req.params.id, req.user.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found or access denied.' });
    }

    await prisma.file.delete({
      where: { id: file.id },
    });

    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({ error: 'Failed to delete file.' });
  }
});

export default router;
