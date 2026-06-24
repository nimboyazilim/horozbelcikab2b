import express from 'express';
import multer from 'multer';
import ReferenceController from '../controllers/referenceController.mjs';

const upload = multer({ dest: './public/uploads/references', limits: { fileSize: 10 * 1024 * 1024 } });
const router = express.Router();

router.get('/references', ReferenceController.list);
router.get('/reference/:id', ReferenceController.byId);
router.post('/reference', upload.single('image'), ReferenceController.create);
router.put('/reference/:id', upload.single('image'), ReferenceController.update);
router.delete('/reference/:id', ReferenceController.delete);

export default router;