import { Client } from '@opensearch-project/opensearch';
import path from 'path';

import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const client = new Client({
  node: process.env.OPENSEARCH_ENDPOINT,
  ssl: {
    rejectUnauthorized: false // Required because OpenSearch over SSH uses a self-signed cert
  }
});

export { client };