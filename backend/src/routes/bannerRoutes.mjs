import express from 'express';
import auth from '../middleware/auth.mjs';
import BannerController from '../controllers/bannerController.mjs';
import multer from 'multer';
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

const router = express.Router();
const {
    bannerListe,
    createBanner,
    updateBanner,
    bannerById,
    deleteBanner,
    webBannerGetir
} = BannerController;

router.get('/liste', auth, bannerListe);
router.post('/create', auth, upload.array('image'), createBanner);
router.put('/:id', auth, upload.array('image'), updateBanner);
router.get('/:id', auth, bannerById);
router.delete('/:id', auth, deleteBanner);
router.get('/web/webBannerGetir', webBannerGetir);

export default router;