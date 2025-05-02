//Connects to the database
import * as dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2'
/*
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
*/

// Load .env from the parent directory
//dotenv.config({ path: path.resolve(__dirname, '../.env') });
//console.log(process.env.USER);

/*export const pool = mysql.createPool({
    host            : '127.0.0.1',
    user            : 'root',
    password        : '',
    database: 'studentbazaardb',
    port: '3307',

}).promise();*/

export const pool = mysql.createPool({
    //host            : '127.0.0.1',
	user            : process.env.DB_USER,
    password        : process.env.DB_PASSWORD,
	host			: process.env.DB_HOST,
	port			: process.env.DB_PORT,
    database		: process.env.DB_NAME,
	/*
	database: 'studentbazaardb',
    port: '3307'
	*/
}).promise();
