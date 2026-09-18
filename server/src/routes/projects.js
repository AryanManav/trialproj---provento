import express from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(255).optional(),
});

// GET /api/projects - List user's projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: { files: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ projects });
  } catch (err) {
    console.error('List projects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
});

// POST /api/projects - Create a new project
router.post('/', async (req, res) => {
  try {
    const parseResult = projectSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: parseResult.error.errors.map((e) => e.message).join(', '),
      });
    }

    const { name, description } = parseResult.data;

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        userId: req.user.id,
        files: {
          create: [
            {
              name: 'index.js',
              content: `// Project: ${name}\nconsole.log("Welcome to ${name}!");\n`,
              language: 'javascript',
            },
          ],
        },
      },
      include: {
        files: true,
      },
    });

    res.status(201).json({ project });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Failed to create project.' });
  }
});

// GET /api/projects/:id - Get project with files
router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        files: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or access denied.' });
    }

    res.json({ project });
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
});

// PUT /api/projects/:id - Rename/update project
router.put('/:id', async (req, res) => {
  try {
    const parseResult = projectSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: parseResult.error.errors.map((e) => e.message).join(', '),
      });
    }

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Project not found or access denied.' });
    }

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        name: parseResult.data.name.trim(),
        description: parseResult.data.description !== undefined ? parseResult.data.description.trim() : existing.description,
      },
    });

    res.json({ project: updated });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ error: 'Failed to update project.' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Project not found or access denied.' });
    }

    await prisma.project.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

export default router;
