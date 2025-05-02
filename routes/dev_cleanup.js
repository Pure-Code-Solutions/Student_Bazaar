import express from 'express';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const s3 = new S3Client({ region: process.env.AWS_REGION });

router.delete('/cleanup-uploads', async (req, res) => {
  try {
    const listParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: 'uploads/'
    };

    const listResult = await s3.send(new ListObjectsV2Command(listParams));
    const keys = listResult.Contents?.map(obj => ({ Key: obj.Key })) || [];

    if (keys.length === 0) {
      return res.json({ message: 'No files to delete.' });
    }

    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Delete: {
        Objects: keys
      }
    };

    await s3.send(new DeleteObjectsCommand(deleteParams));
    res.json({ message: 'Deleted all test uploads.', count: keys.length });
  } catch (err) {
    console.error('S3 Cleanup Error:', err);
    res.status(500).json({ error: 'Failed to delete uploads' });
  }
});

export default router;
