import cors from 'cors';
import express from 'express';
import mysql from 'mysql2/promise';

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
  })
);
app.use(express.json());

let pool;

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function connectWithRetry(retries = 20, delay = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'appuser',
        password: process.env.DB_PASSWORD || 'apppassword',
        database: process.env.DB_NAME || 'appdb',
        waitForConnections: true,
        connectionLimit: 10
      });

      await pool.query('SELECT 1');
      console.log(`MySQL connected on attempt ${attempt}`);
      return;
    } catch (error) {
      console.error(`MySQL connection failed on attempt ${attempt}: ${error.message}`);
      if (attempt === retries) {
        throw error;
      }
      await sleep(delay);
    }
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/api/users', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  try {
    const [result] = await pool.query('INSERT INTO users (name, email) VALUES (?, ?)', [
      name,
      email
    ]);

    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

async function startServer() {
  try {
    await connectWithRetry();
    app.listen(port, () => {
      console.log(`Backend running on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();

