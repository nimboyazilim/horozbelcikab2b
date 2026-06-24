import express from 'express';
import auth from '../middleware/auth.mjs';
import SayfalarController from '../controllers/sayfalarController.mjs';
import multer from 'multer';
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const router = express.Router();
const {
  katalogListe,
  createKatalog,
  updateKatalog,
  katalogById,
  deleteKatalog,
  webKatalogGetir,
  webHaberlerGetir,
  webHaberById,
  webHaberCreate,
  webHaberUpdate,
  webHaberDelete,
  webHaberlerListe,
  webHaberWebById
} = SayfalarController;

router.get('/katalog/liste', auth, katalogListe);
router.get('/katalog/webKatalogGetir', webKatalogGetir);
router.post('/katalog/create', auth, upload.fields([{ name: 'images', maxCount: 1 }, { name: 'dosya', maxCount: 1 }]), createKatalog);
router.get('/katalog/:id', auth, katalogById);
router.put('/katalog/:id', auth, upload.fields([{ name: 'images', maxCount: 1 }, { name: 'dosya', maxCount: 1 }]), updateKatalog);
router.delete('/katalog/:id', auth, deleteKatalog);

router.get('/haberler/liste', auth, webHaberlerListe);
router.get('/haberler/webHaberlerGetir', webHaberlerGetir);
router.get('/haberler/:id', auth, webHaberById);
router.get('/haberler/webHaberWebById/:id', webHaberWebById);
router.post(
  '/haberler/create',
  auth,
  upload.fields([{ name: 'images', maxCount: 1 }]),
  webHaberCreate
);

router.put(
  '/haberler/:id',
  auth,
  upload.fields([{ name: 'images', maxCount: 1 }]),
  webHaberUpdate
);

router.delete('/haberler/:id', auth, webHaberDelete);

export default router;
