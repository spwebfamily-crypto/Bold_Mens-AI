import express from 'express';
import mongoose from 'mongoose';
import packageJson from '../../package.json';

const router = express.Router();

function getMongoStatus(): string {
  switch (mongoose.connection.readyState) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'unknown';
  }
}

router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    version: packageJson.version,
    uptime: process.uptime(),
    mongoStatus: getMongoStatus(),
  });
});

router.get('/detailed', (_req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    res.status(404).json({ status: 'not_found' });
    return;
  }

  res.status(200).json({
    status: 'ok',
    version: packageJson.version,
    uptime: process.uptime(),
    mongoStatus: getMongoStatus(),
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
});

export default router;
