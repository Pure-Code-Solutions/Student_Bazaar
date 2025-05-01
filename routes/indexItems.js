import express from 'express';
import { indexDocument } from '../services/opensearchClient.js';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

router.put('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT item.name, item.description, item.categoryID, category.name AS categoryName
      FROM item
      JOIN category ON item.categoryID = category.categoryID
    `);

    const results = [];
    for (const row of rows) {
      const doc = {
		name: row.name,
		description: row.description || '',
		categoryID: row.categoryID,
		categoryName: row.categoryName
	};


      const result = await indexDocument('item', doc);
      results.push(JSON.parse(result));
    }

    res.status(200).json({ message: 'Indexing complete', results });
  } catch (err) {
    console.error('Error indexing items:', err);
    res.status(500).json({ error: 'Indexing failed' });
  }
});

export default router;
