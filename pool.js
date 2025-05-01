import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect using .env values
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Optional debug log
pool.getConnection()
  .then(() => console.log("✅ MySQL DB connected!"))
  .catch(err => console.error("❌ DB connection failed:", err));

//import mysql from 'mysql2/promise';

