import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import fileRoutes from './routes/files.js';
import executeRoutes from './routes/execute.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api', fileRoutes);
  app.use('/api/execute', executeRoutes);

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({ error: `Not Found: ${req.method} ${req.url}` });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}

export const app = createApp();
