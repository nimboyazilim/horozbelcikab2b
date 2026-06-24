import express from 'express';
import auth from '../middleware/auth.mjs';
import DashboardController from '../controllers/dashboardController.mjs';


const router = express.Router();
const {
  satislarToplam,
  siparislerToplam,
  sepetlerToplam,   
  enCokSatilanUrunler,
  sonAlinanSiparisler,
  istatistikler,
  grafik1
} = DashboardController;

router.get('/satislar/toplam/:tarih', auth, satislarToplam);
router.get('/siparisler/toplam/:tarih', auth, siparislerToplam);
router.get('/sepetler/toplam/:tarih', auth, sepetlerToplam);
router.get('/en-cok-satilan-urunler/:tarih', auth, enCokSatilanUrunler);
router.get('/son-alinan-siparisler', auth, sonAlinanSiparisler);
router.get('/istatistikler', auth, istatistikler);
router.get('/grafik1', auth, grafik1);
export default router;
