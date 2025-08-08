import express from 'express';
import { pool } from '../db.js';
import fetch from 'node-fetch';
import crypto from 'crypto';

const router = express.Router();

/** helper: gravatar url */
function gravatarUrl(email, size=200){
  const e = (email || '').trim().toLowerCase();
  const hash = crypto.createHash('md5').update(e).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}

/** helper: geocode city -> {lat, lon} using Nominatim */
async function geocodeCity(city){
  if(!city) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'MapaUsuarios/1.0 (seu-email@example.com)'
    }
  });
  const data = await resp.json();
  if(Array.isArray(data) && data.length>0){
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  }
  return null;
}

/** GET /usuarios */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios ORDER BY criado_em DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

/** POST /usuarios
 * body: { nome, email, cidade }
 */
router.post('/', async (req, res) => {
  try {
    const { nome, email, cidade } = req.body;
    if (!nome || !email) return res.status(400).json({ error: 'Nome e email são obrigatórios' });

    // geocode city
    const coords = await geocodeCity(cidade);
    const lat = coords ? coords.lat : null;
    const lon = coords ? coords.lon : null;

    const gravatar = gravatarUrl(email);

    const [result] = await pool.query(
      `INSERT INTO usuarios (nome, email, cidade, lat, lon, gravatar) VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, email, cidade || null, lat, lon, gravatar]
    );

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar usuário' });
  }
});

export default router;
