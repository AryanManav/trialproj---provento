import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-for-dev-only-12345',
  nodeEnv: process.env.NODE_ENV || 'development',
  maxExecutionTimeMs: 4000,
  maxOutputLength: 20000,
};
