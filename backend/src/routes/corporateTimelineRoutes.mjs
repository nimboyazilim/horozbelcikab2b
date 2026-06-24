import express from 'express';
import multer from 'multer';
import CorporateTimelineController from '../controllers/corporateTimelineController.mjs';

const upload = multer({ dest: './public/uploads/timeline', limits: { fileSize: 10 * 1024 * 1024 } });
const router = express.Router();
router.get('/corporate-timeline/:id', CorporateTimelineController.getById);
router.get('/corporate-timeline/:lang?', CorporateTimelineController.list);
router.post('/corporate-timeline', upload.single('image'), CorporateTimelineController.create);
router.put('/corporate-timeline/:id', upload.single('image'), CorporateTimelineController.update);
router.delete('/corporate-timeline/:id', CorporateTimelineController.delete);

export default router;