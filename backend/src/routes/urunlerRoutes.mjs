import express from 'express';
import auth from '../middleware/auth.mjs';
import authb2b from '../middleware/authb2b.mjs';
import UrunlerController from '../controllers/urunlerController.mjs';
import multer from 'multer';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const router = express.Router();
const {
  urunlerListe,
  createUrun,
  getUrunById,
  getUrunVaryantListe,
  getAnaVaryantListe,
  updateUrun,
  createUrunVaryant,
  urunVaryantSil,
  getUrunVaryantById,
  updateUrunVaryant,
  createUrunOzelFiyat,
  getUrunOzelFiyatListe,
  createUrunResim,
  urunResimListe,
  urunResimSil,
  urunResimKapakGuncelle,
  urunVaryantResimSec,
  createUrunOzellik,
  getUrunOzellikListe,
  getOzellikListe,
  getUrunDosyaTanimListe,
  urunDosyaEkle,
  getUrunDosyaListe,
  urunDosyaSil,
  urunMiktarGuncelle,
  getUrunMiktar,
  urunAnaDurumlari,
  urunDurumGuncelle,
  urunDurumGrup,
  webgetKategoriUrunleri,
  webUrunDetay,
  webYeniUrunler,
  webOnecikanUrunler,
  webBenzerUrunler,
  webEnCokSatanlar,
  webgetKategoriYeniUrunler,
  b2bgetKategoriUrunleri,
  b2bUrunDetay,
  b2bgetUrunArama,
  webgetUrunArama,
  webKurumsalgetKategoriUrunleri,
  webOutletUrunler,
  webgetKategoriOutletUrunler,
} = UrunlerController;

router.get('/liste', auth, urunlerListe);
router.get('/varyant/anaListe', auth, getAnaVaryantListe);
router.get('/:id', auth, getUrunById);
router.get('/varyant/:id', auth, getUrunVaryantListe);
router.get('/varyant/detay/:id', auth, getUrunVaryantById);
router.get('/ozelFiyat/liste/:urunId/:varyantId', auth, getUrunOzelFiyatListe);
router.get('/resim/liste/:urunId', auth, urunResimListe);
router.get('/ozellik/liste/:urunId', auth, getUrunOzellikListe);
router.get('/ozellik/tumListe', auth, getOzellikListe);
router.get('/dosyaTanim/liste', auth, getUrunDosyaTanimListe);
router.get('/urunDosya/liste/:urunId', auth, getUrunDosyaListe);
router.get('/miktar/:urunId/:varyantId', auth, getUrunMiktar);
router.get('/durum/anaDurumlar', auth, urunAnaDurumlari);
router.get('/durum/grup/:urunId', auth, urunDurumGrup);
router.get('/web/kategoriUrunleri/:kategoriId', webgetKategoriUrunleri);
router.get('/web/kurumsalKategoriUrunleri/:kategoriId', webKurumsalgetKategoriUrunleri);
router.get('/b2b/kategoriUrunleri/:kategoriId', authb2b, b2bgetKategoriUrunleri);
router.get('/web/urunDetay/:urunId', webUrunDetay);
router.get('/b2b/urunDetay/:urunId', authb2b, b2bUrunDetay);
router.get('/web/yeniUrunler', webYeniUrunler);
router.get('/web/outletUrunler', webOutletUrunler);
router.get('/web/onecikanUrunler', webOnecikanUrunler);
router.get('/web/enCokSatanlar', webEnCokSatanlar);
router.get('/web/benzerUrunler/:kategori_seo', webBenzerUrunler);
router.get('/web/kategoriYeniUrunler/:kategoriId', webgetKategoriYeniUrunler);
router.get('/web/kategoriOutletUrunler/:kategoriId', webgetKategoriOutletUrunler);
router.get('/b2b/urunArama/:arama', b2bgetUrunArama);
router.get('/web/urunArama/:arama', webgetUrunArama);
router.post('/create', auth, createUrun);
router.post('/varyant/createUrunVaryant', auth, createUrunVaryant);
router.post('/ozelFiyat/create', auth, createUrunOzelFiyat);
router.post('/resim/kapak', auth, urunResimKapakGuncelle);
router.post('/varyant/resim/sec', auth, urunVaryantResimSec);
router.post('/resim/create', auth, upload.array('image'), createUrunResim);
router.post('/ozellik/create', auth, createUrunOzellik);
router.post('/urunDosya/create', auth, upload.array('image'), urunDosyaEkle);
router.put('/:id', auth, updateUrun);
router.put('/varyant/update/:id', auth, updateUrunVaryant);
router.put('/miktar/guncelle/:urunId/:varyantId', auth, urunMiktarGuncelle);
router.put('/durum/guncelle/:urunId/:durumId', auth, urunDurumGuncelle);
router.delete('/varyant/:id', auth, urunVaryantSil);
router.delete('/resim/:id', auth, urunResimSil);
router.delete('/urunDosya/:id', auth, urunDosyaSil);

export default router;
