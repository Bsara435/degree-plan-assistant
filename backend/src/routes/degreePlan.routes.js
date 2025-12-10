import express from 'express';
import multer from 'multer';
import { analyzeTranscript } from '../controllers/degreePlan.controller.js'; // Import the named export

const router = express.Router();

// Setup Multer (Middleware to handle files)
const upload = multer({ storage: multer.memoryStorage() });

// Define the POST route
router.post('/analyze-plan', upload.single('transcript'), analyzeTranscript);

export default router;