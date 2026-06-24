import express from 'express';
import NewsletterController from '../controllers/newsletterController.mjs';
const router = express.Router();

router.post('/subscribe', NewsletterController.subscribe);

export default router;