//Connects to the database
import mysql from 'mysql2'
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' })
dotenv.config();
export const pool = mysql.createPool({
    host    : process.env.HOST,
    user : 'root',
    password : '',
    database: process.env.DATABASE

}).promise();