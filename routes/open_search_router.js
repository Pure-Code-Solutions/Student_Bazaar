import express from 'express';
import { searchIndex } from '../services/opensearchClient.js';

const openSearchRouter = express.Router();
console.log("OpenSearch router is mounted");

openSearchRouter.get('/', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.redirect('/shop');

  console.log("[GET] /search query:", query);

  try {
    const raw = await searchIndex('item', {
      query: {
        bool: {
          should: [
            { match: { name: { query, fuzziness: "AUTO" } } },
            { match_phrase_prefix: { name: { query } } }
          ]
        }
      }
    });

    const results = JSON.parse(raw).hits.hits.map(hit => hit._source);

    res.render('shop', {
      query,
      products: results,
      page: 1,
      numberOfPages: 1,
      category: '',
      subcategories: null
    });
  } catch (error) {
    console.error("GET /search error:", error);
    res.status(500).send("Search failed");
  }
});


openSearchRouter.post('/', async (req, res) => {
  const { query } = req.body;
  console.log(" /search route hit with query:", query);

  try {
    const raw = await searchIndex('item', {
      query: {
        bool: {
          should: [
            { match: { name: { query, fuzziness: "AUTO" } } },
            { match_phrase_prefix: { name: { query } } }
          ]
        }
      }
    });

    const results = JSON.parse(raw).hits.hits.map(hit => hit._source);

    res.render('shop', {
      query,
      products: results,
      page: 1,
      numberOfPages: 1,
      category: '',
      subcategories: null
    });
  } catch (error) {
    console.error("OpenSearch search error:", error);
    res.status(500).send("Search failed");
  }
});

export default openSearchRouter;