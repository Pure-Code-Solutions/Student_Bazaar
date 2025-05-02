import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import mysql from 'mysql2/promise'; // if not already present

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const s3 = new S3Client({ region: process.env.AWS_REGION });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const { name, description, categoryID } = req.body;
    if (!name || !description || !categoryID) {
      return res.status(400).json({ error: 'Missing item fields' });
    }
	
	// TEMP FIX: Manually assign sellerID (user and seller_profile not linked)
	const sellerID = 777;
	
    const fileExt = file.originalname.split('.').pop();
    const key = `uploads/${randomUUID()}.${fileExt}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // Insert into DB
    const [result] = await pool.query(
  `INSERT INTO item (name, description, categoryID, imageUrl, sellerID) VALUES (?, ?, ?, ?, ?)`,
  [name, description, categoryID, imageUrl, sellerID]
);


    res.status(200).json({ message: 'Item created successfully', itemID: result.insertId, imageUrl });
  } catch (err) {
    console.error('Upload/Insert Error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;

