import express from 'express';
import auth from '../middleware/auth.mjs';
import PopupController from '../controllers/popupController.mjs';
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

const router = express.Router();
const {
    popupListe,
    createPopup,
    updatePopup,
    popupById,
    deletePopup,
    getActivePopup
} = PopupController;

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ status: 'ok', message: 'Popup routes working!' });
});

router.get('/liste', auth, popupListe);
router.get('/web/active', getActivePopup);
router.post('/create', auth, upload.array('image'), createPopup);
router.put('/:id', auth, upload.array('image'), updatePopup);
router.get('/:id', auth, popupById);
router.delete('/:id', auth, deletePopup);

export default router;
