import express from 'express';
import auth from '../middleware/auth.mjs';
import authb2b from '../middleware/authb2b.mjs';
import MikroController from '../controllers/mikroController.mjs';
import multer from 'multer';
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const router = express.Router();
const {
  varyantListe,
  stokVaryantEkle,
  stokVaryantGrupEkle,
  kategoriEkle,
  kategoriyeUrunBagla,
  urunFiyatlariEkle,
  urunVergiEkle,
  stokMiktarEkle,
  topluResimEkle,
  topluDosyaEkle,
  cariEkstreListe,
  urunOzelFiyatlariEkle,
  cariListe
} = MikroController;

router.get('/varyant/liste', auth, varyantListe);
router.get('/stok/ekle', auth, stokVaryantEkle);
router.get('/stok/varyant/grup/ekle', auth, stokVaryantGrupEkle);
router.get('/kategori/ekle', auth, kategoriEkle);
router.get('/kategori/urun/bagla', auth, kategoriyeUrunBagla);
router.get('/urun/fiyatlari/ekle', urunFiyatlariEkle);
router.get('/urun/ozel/fiyatlari/ekle', urunOzelFiyatlariEkle);
router.get('/urun/vergi/ekle', auth, urunVergiEkle);
router.get('/stok/miktar/ekle', stokMiktarEkle);
router.get('/toplu/resim/ekle', topluResimEkle);
router.get('/toplu/dosya/ekle', topluDosyaEkle);
router.get('/cari-ekstre/liste/:ilkTarih/:sonTarih', authb2b, cariEkstreListe);
router.get('/cari/liste/', auth, cariListe);
export default router;
