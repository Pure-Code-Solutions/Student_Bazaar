import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';

import { client } from '../data/open_search.js';


export const openSearchRouter = express.Router();

openSearchRouter.get('/search/test', async (req, res) => {
  try {
    const result = await client.index({
      index: 'listings',
      id: '1',
      body: {
        title: 'Test Item',
        description: 'This is a test item indexed into OpenSearch.',
        price: 20,
        createdAt: new Date()
      }
    });

    res.json({ message: 'Document indexed!', result });
  } catch (error) {
    console.error('OpenSearch Error:', error);
    res.status(500).json({ error: 'Failed to index document' });
  }
});

export default openSearchRouter;
