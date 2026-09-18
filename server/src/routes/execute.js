import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { executeCode } from '../services/executor.js';

const router = express.Router();

router.use(requireAuth);

const executeSchema = z.object({
  code: z.string({ required_error: 'Code string is required' }),
  language: z.string().optional().default('javascript'),
});

router.post('/', async (req, res) => {
  try {
    const parseResult = executeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: parseResult.error.errors.map((e) => e.message).join(', '),
      });
    }

    const { code, language } = parseResult.data;

    const normalizedLang = (language || 'javascript').toLowerCase();

    if (normalizedLang !== 'javascript' && normalizedLang !== 'js') {
      return res.status(400).json({
        success: false,
        output: '',
        error: `Execution for '${normalizedLang}' is not supported. Please run JavaScript (.js) files.`,
        executionTimeMs: 0,
      });
    }

    const result = await executeCode(code);
    return res.json(result);
  } catch (err) {
    console.error('Execute route error:', err);
    return res.status(500).json({
      success: false,
      output: '',
      error: 'An unexpected error occurred during execution.',
      executionTimeMs: 0,
    });
  }
});

export default router;
