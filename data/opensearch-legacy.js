import { Client } from '@opensearch-project/opensearch';
import pkg from 'aws-opensearch-connector';
const { createAWSConnection } = pkg;
import AWS from 'aws-sdk';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const AWSConnection = createAWSConnection(AWS.config);

const client = new Client({
  ...AWSConnection,
  node: process.env.OPENSEARCH_ENDPOINT,
  ssl: {
    rejectUnauthorized: false
  }
});

export { client };
