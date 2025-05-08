import express from 'express';
import { indexDocument, deleteIndex } from '../services/opensearchClient.js'; // ⬅️ Add deleteIndex
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();
import { sendSignedRequest } from '../services/opensearchClient.js';
import { client } from '../data/open_search.js';


const router = express.Router();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

router.post('/reindex', async (req, res) => {
  try {
    // Optional: Delete index (commented for now)
    // await deleteIndex('item');

    // Create index with edge_ngram mapping
    try {
      await sendSignedRequest('PUT', '/item', {}, {
  settings: {
    analysis: {
      analyzer: {
        edge_ngram_analyzer: {
          tokenizer: 'edge_ngram_tokenizer',
          filter: ['lowercase']
        }
      },
      tokenizer: {
        edge_ngram_tokenizer: {
          type: 'edge_ngram',
          min_gram: 2,
          max_gram: 15,
          token_chars: ['letter', 'digit']
        }
      }
    }
  },
  mappings: {
    properties: {
      name: { type: 'text', analyzer: 'edge_ngram_analyzer', search_analyzer: 'standard' },
      description: { type: 'text' },
      price: { type: 'float' },
      categoryName: { type: 'keyword' },
      imageUrl: { type: 'keyword' },
      tags: { type: 'keyword' }
    }
  }

});
console.log('Index created with edge_ngram mapping via signed request.');

	  
	  
      console.log('Index created with edge_ngram mapping.');
    } catch (err) {
      if (err?.meta?.body?.error?.type === 'resource_already_exists_exception') {
        console.log('Index already exists — skipping create.');
      } else {
        throw err;
      }
    }

    //Reindex from MySQL
    const [rows] = await pool.query(`
	SELECT i.itemID, i.name, i.description, i.categoryID, i.price, i.imageUrl,
         c.name AS categoryName,
         GROUP_CONCAT(t.name) AS tags
	FROM item i
	JOIN category c ON i.categoryID = c.categoryID
	LEFT JOIN category_tag ct ON c.categoryID = ct.categoryID
	LEFT JOIN tag t ON ct.tagID = t.tagID
	GROUP BY i.itemID
	`);


    let successCount = 0;

    for (const row of rows) {
      const doc = {
		itemID: row.itemID,
		name: row.name,
		description: row.description || '',
		categoryID: row.categoryID,
		categoryName: row.categoryName,
		price: row.price,
		imageUrl: row.imageUrl || null,
		tags: row.tags ? row.tags.split(',') : []
		};


      await indexDocument('item', doc);
      successCount++;
    }

    res.status(200).json({
      message: `Reindexed ${successCount} items successfully`
    });
  } catch (err) {
    console.error('Error during reindex:', err);
    res.status(500).json({ error: 'Reindexing failed' });
  }
});


router.delete('/deleteIndex', async (req, res) => {
  try {
    const result = await deleteIndex('item');
    res.status(200).send(`Index deleted: ${result}`);
  } catch (err) {
    if (err.toString().includes('index_not_found_exception')) {
      res.status(200).send('Index not found — nothing to delete.');
    } else {
      console.error('Delete index error:', err);
      res.status(500).json({ error: 'Failed to delete index' });
    }
  }
});

router.get('/indices', async (req, res) => {
  try {
    const response = await sendSignedRequest('GET', '/_cat/indices?v');
    res.status(200).send(response);
  } catch (err) {
    console.error('Failed to fetch indices:', err);
    res.status(500).json({ error: 'Failed to fetch index list' });
  }
});


export default router;

