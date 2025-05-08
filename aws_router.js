import express from 'express';
import multer from 'multer';
import fs from 'fs';
import {s3} from '../data/aws.js'; // Import S3 configuration
import { PutObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const S3router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temporary local storage

// Upload image to S3
S3router.post('/upload', upload.single('image'), async (req, res) => {
	console.log("Received S3 upload request");
	
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileContent = fs.readFileSync(req.file.path);
    const fileName = `${Date.now()}_${req.file.originalname}`;

    const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
        ContentType: req.file.mimetype,
        //ACL: 'public-read' // Change to 'private' if using signed URLs
    };

    try {
		const uploadResult = await s3.send(new PutObjectCommand(uploadParams));
        res.status(200).json({ imageUrl: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload' });
    }
});

S3router.get('/upload', async (req, res) => {
    res.render("upload");
})