import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import { searchIndex } from '../services/opensearchClient.js';

import { client } from '../data/open_search.js';


export const openSearchRouter = express.Router();
console.log("OpenSearch router is mounted");

openSearchRouter.post('/search', async (req, res) => {
  const { query } = req.body;

  console.log(' [OpenSearch] Received search query:', query);

  try {
    const raw = await searchIndex('item', {
      query: {
        match: {
          name: {
            query,
            fuzziness: "AUTO"
          }
        }
      }
    });

    const results = JSON.parse(raw).hits.hits.map(hit => hit._source);

    res.render('search-results', {
      query,
      results
    });
  } catch (error) {
    console.error('OpenSearch search error:', error);
    res.status(500).send('Search failed');
  }
});


openSearchRouter.post('/search', async (req, res) => {
  const { query } = req.body;

  try {
    const raw = await searchIndex('item', {
      query: {
        match_phrase_prefix: {
          name: {
            query: query
          }
        }
      }
    });

    const results = JSON.parse(raw).hits.hits.map(hit => hit._source);

    res.render('search-results', {
      query,
      results
    });
  } catch (error) {
    console.error('OpenSearch search error:', error);
    res.status(500).send('Search failed');
  }
});


export default openSearchRouter;
