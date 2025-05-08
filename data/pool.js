//Connects to the database
import mysql from 'mysql2'
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('db user ' + process.env.USER);

/*export const pool = mysql.createPool({
    host            : '127.0.0.1',
    user            : 'root',
    password        : '',
    database: 'studentbazaardb',
    port: '3307',

}).promise();*/


export const pool = mysql.createPool({
    host            : '127.0.0.1',
    user            : process.env.DB_USER,
    password        : process.env.DB_PASSWORD,
    database: 'studentbazaardb',
    port: '3307'
}).promise();