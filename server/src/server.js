import { app } from './app.js';
import { config } from './config.js';

const server = app.listen(config.port, () => {
  console.log(`🚀 Code Master API server running at http://localhost:${config.port}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed gracefully');
    process.exit(0);
  });
});
