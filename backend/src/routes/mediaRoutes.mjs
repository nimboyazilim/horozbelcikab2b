import express from 'express';
import multer from 'multer';
import MediaController from '../controllers/mediaController.mjs';

const upload = multer({ dest: './public/uploads/media', limits: { fileSize: 10 * 1024 * 1024 } });
const router = express.Router();

// Fotoğraf işlemleri
router.get('/photos', MediaController.photoList);
router.get('/photo/:id', MediaController.photoById);
router.post('/photo', upload.single('image'), MediaController.createPhoto);
router.put('/photo/:id', upload.single('image'), MediaController.updatePhoto);
router.delete('/photo/:id', MediaController.deletePhoto);

// Video işlemleri
router.get('/videos', MediaController.videoList);
router.get('/video/:id', MediaController.videoById);
router.post('/video', MediaController.createVideo);
router.put('/video/:id', MediaController.updateVideo);
router.delete('/video/:id', MediaController.deleteVideo);

export default router;