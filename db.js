// db.js
const mysql = require('mysql2');

// Create a connection to MySQL
const connection = mysql.createConnection({
  host: 'localhost',    // Your MySQL server (default: localhost)
  user: 'root',         // Your MySQL username
  password: 'roottoor', // Your MySQL password (change this)
  database: 'studentBazzar' // The database you're using (change this)
});

// Connect to the MySQL database
connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

// Export the connection so other files can use it
module.exports = connection;
