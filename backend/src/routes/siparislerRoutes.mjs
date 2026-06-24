import express from 'express';
import auth from '../middleware/auth.mjs';
import SiparislerController from '../controllers/siparislerController.mjs';
import authb2b from '../middleware/authb2b.mjs';
import multer from 'multer';

const router = express.Router();
const {
    getSiparisler,
    createSiparis,
    updateSiparis,
    deleteSiparis,
    getSiparislerListe,
    getSiparislerCmsById,
    durumCmsUpdate,
    siparisErpAktar,
    siparisUrunArama,
    createCmsSiparis,
    siparisTopluExcelUrunListesi,
    siparisTopluExcelUrunEkle,
    siparisTopluExcelUrunEkleCms
} = SiparislerController;

router.get('/getSiparisler/:musteri_id', authb2b, getSiparisler);
router.get('/getSiparislerCms/:id', auth, getSiparislerCmsById);
router.get('/getSiparislerListe/liste', auth, getSiparislerListe);
router.get('/urunArama/:musteri_id/:arama', auth, siparisUrunArama);
router.get('/toplu-urun-listesi/:musteri_id', siparisTopluExcelUrunListesi);
router.post('/toplu-urun-ekle/:musteri_id/:cart_id', multer().single('file'), siparisTopluExcelUrunEkle);
router.post('/toplu-urun-ekle-cms/:musteri_id', multer().single('file'), siparisTopluExcelUrunEkleCms);
router.post('/create', authb2b, createSiparis);
router.post('/createCms', auth, createCmsSiparis);
router.put('/updateSiparis/:id', authb2b, updateSiparis);
router.put('/durumCmsUpdate/:id', auth, durumCmsUpdate);
router.put('/erpAktar/:id', auth, siparisErpAktar);
router.delete('/deleteSiparis/:id', authb2b, deleteSiparis);
export default router;
