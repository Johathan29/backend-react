import express from 'express';
import db from '../db';

const router = express.Router();

// GET todos los usuarios
router.get('/', (req, res) => {
  db.query('SELECT * FROM sendmessage', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(results);
  });
});

// POST nuevo usuario
router.post('/', (req, res) => {
  const { nombre, email } = req.body;
  const sql = 'INSERT INTO sendmessage (nombre, email) VALUES (?, ?)';
  db.query(sql, [nombre, email], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al insertar' });
    res.json({ id: result.insertId, nombre, email });
  });
});

export default router;
