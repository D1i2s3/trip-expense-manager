require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const tripRoutes = require('./routes/trips');
const memberRoutes = require('./routes/members');
const expenseRoutes = require('./routes/expenses');
const summaryRoutes = require('./routes/summary');

const authRoutes = require('./routes/auth');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
    'http://localhost:5176',
    'http://127.0.0.1:5176',
    'http://192.168.0.196:5174',
    'http://192.168.0.196:5173',
    'http://192.168.0.196.nip.io:5174',
    'http://192.168.0.196.nip.io:5173',
    'http://tripsplit.192.168.0.196.nip.io:5174',
    'http://tripsplit.192.168.0.196.nip.io:5173',
    'https://3qg70ft1-5174.inc1.devtunnels.ms',
  ],
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/trips', memberRoutes);
app.use('/api/trips', expenseRoutes);
app.use('/api/trips', summaryRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

async function connectDatabase() {
  let uri = process.env.MONGODB_URI;

  // Placeholder Atlas URI in .env — treat as unset
  if (uri && uri.includes('<username>')) {
    uri = null;
  }

  const useMemory = process.env.USE_MEMORY_DB === 'true' || !uri;

  if (useMemory) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    console.log('📦 Using in-memory MongoDB (data resets on restart)');
  }

  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');
  return uri;
}

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
