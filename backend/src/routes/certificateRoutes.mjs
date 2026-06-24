import express from 'express';
import multer from 'multer';
import CertificateController from '../controllers/certificateController.mjs';

const upload = multer({ dest: './public/uploads/pdfs', limits: { fileSize: 20 * 1024 * 1024 } });
const router = express.Router();

router.get('/certificates', CertificateController.list);
router.get('/certificate/:id', CertificateController.byId);
router.post('/certificate', upload.single('file'), CertificateController.create);
router.put('/certificate/:id', upload.single('file'), CertificateController.update);
router.delete('/certificate/:id', CertificateController.delete);

export default router;