import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large image payloads

// Serve static files from the Vite build
app.use(express.static(join(__dirname, 'dist')));

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://clinica_backend:Dzw7G1V8MB2Jt2skIq2sCKYQRYsPs1vU@dpg-d7u1akhpo60c73e0m6u0-a.oregon-postgres.render.com/clinicia',
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize DB
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patient_biometrics (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        image_data TEXT NOT NULL,
        verification_status VARCHAR(50) DEFAULT 'verified',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}
initDB();

app.post('/api/verify-biometric', async (req, res) => {
  try {
    const { fullName, biometricData } = req.body;
    
    if (!fullName || !biometricData) {
      return res.status(400).json({ error: 'Faltan datos requeridos (nombre o imagen)' });
    }

    // Insert record into database
    await pool.query(
      `INSERT INTO patient_biometrics (full_name, image_data, verification_status) 
       VALUES ($1, $2, $3)`, 
      [fullName, biometricData, 'verified']
    );
    
    // Simulate a slight delay for realistic processing time
    setTimeout(() => {
      res.json({ success: true, message: 'Validación biométrica exitosa y registrada' });
    }, 1500);
    
  } catch (error) {
    console.error('Error in /api/verify-biometric:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Handle Vite routing, return all unhandled requests to index.html
app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
