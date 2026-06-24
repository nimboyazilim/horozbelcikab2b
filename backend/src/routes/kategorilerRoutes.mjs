import express from 'express';
import auth from '../middleware/auth.mjs';
import KategorilerController from '../controllers/kategorilerController.mjs';
import multer from 'multer';
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const router = express.Router();
const {
  kategorilerListe,
  webKategoriListe,
  webHomeAnaKategoriler,
  webBreadcrumbListe,
  createKategori,
  getKategoriById,
  updateKategori
} = KategorilerController;

router.get('/liste', auth, kategorilerListe);
router.get('/web/webHomeAnaKategoriler', webHomeAnaKategoriler);
router.get('/web/liste', webKategoriListe);
router.get('/web/breadcrumb/:slug', webBreadcrumbListe);
router.get('/:id', auth, getKategoriById);
router.post('/create', auth, upload.fields([
    { name: 'kategori_resim', maxCount: 1 },
    { name: 'kategori_ikon', maxCount: 1 }
]), createKategori);
router.put('/:id', auth, upload.fields([
    { name: 'kategori_resim', maxCount: 1 },
    { name: 'kategori_ikon', maxCount: 1 }
]), updateKategori);
export default router;
