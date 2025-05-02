import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // keep file in memory

const s3 = new S3Client({ region: process.env.AWS_REGION });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const fileExt = file.originalname.split('.').pop();
    const key = `uploads/${randomUUID()}.${fileExt}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    res.json({ url });
  } catch (err) {
    console.error('S3 Upload Error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
