import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { pool } from '../data/pool.js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const s3 = new S3Client({ region: process.env.AWS_REGION });

router.post('/upload-pfp', upload.single('profilePicture'), async (req, res) => {
  try {
    const userID = 1; // Replace with real user ID later
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const fileExt = file.originalname.split('.').pop();
    const key = `profile-pictures/${randomUUID()}.${fileExt}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    await pool.query(
      `UPDATE user SET profilePicture = ? WHERE userID = ?`,
      [url, userID]
    );

    res.status(200).json({ profilePicture: url });
  } catch (err) {
    console.error('PFP Upload Error:', err);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

export default router;