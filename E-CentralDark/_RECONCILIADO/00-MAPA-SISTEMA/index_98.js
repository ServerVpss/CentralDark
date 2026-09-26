const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Carregar envs: cofre VPS primeiro, depois .env local
try { dotenv.config({ path: '/root/Multizap/secrets/wabot.env', override: false }); } catch(e) {}
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'WABOT Server', timestamp: new Date() });
});

// Middleware: injetar Socket.io no Express
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rotas
app.use('/api/instances', require('./routes/instances'));
app.use('/api/webhooks', require('./routes/webhooks'));

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`[Socket] Client disconnected: ${socket.id}`));
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 WABOT Server running on port ${PORT}`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL ? '✅ configured' : '❌ missing'}`);
  console.log(`   WuzAPI:   ${process.env.WUZAPI_URL || 'http://127.0.0.1:8081'}`);
});
