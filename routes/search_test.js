import express from 'express';
//import { client } from '../data/opensearch.js';

const router = express.Router();

router.get('/search/test', async (req, res) => {
  try {
    const result = await client.index({
      index: 'test-index',
      document: {
        title: 'Test Document',
        timestamp: new Date()
      }
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error indexing document');
  }
});

export default router;
