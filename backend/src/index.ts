import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import apiRouter from './api/simulations.js';
import { setupWebSocket } from './ws/handler.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(helmet());
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = createServer(app);

// WebSocket for real-time streaming
setupWebSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`QuantAcademy Backend running on port ${PORT}`);
  console.log(`  REST API: http://localhost:${PORT}/api`);
  console.log(`  WebSocket: ws://localhost:${PORT}/ws`);
});
