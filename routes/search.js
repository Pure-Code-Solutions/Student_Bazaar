import express from 'express';
import { searchIndex } from '../services/opensearchClient.js';

const router = express.Router();

// POST /search
router.post('/shop', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing search query' });
    }

console.log("Using OpenSearch endpoint:", process.env.OPENSEARCH_ENDPOINT);

    const result = await searchIndex('item', {
      query: {
        multi_match: {
        query,
        fields: ['name', 'description', 'categoryName'],
        fuzziness: "AUTO"
        }
      }
    });


    res.send(JSON.parse(result)); // Return parsed OpenSearch results

  } catch (err) {
    console.error('OpenSearch error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;