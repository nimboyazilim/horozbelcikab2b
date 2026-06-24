import express from 'express';
import auth from '../middleware/auth.mjs';
import OtherController from '../controllers/otherController.mjs';


const router = express.Router();
const {
  bildirimListele,
  epostaGonder,
  proformaFaturaPdf,
  orderPdf,
  faturaPdf,
  iletisimFormuGonder,
  kariyerBasvuruGonder
} = OtherController;

router.get('/bildirim/listele', auth, bildirimListele);
router.get('/proformaFaturaPdf/:id', proformaFaturaPdf);
router.get('/orderPdf/:id', orderPdf);
router.get('/faturaPdf/:id', faturaPdf);
router.post('/eposta/gonder', epostaGonder);
router.post('/iletisim-formu', iletisimFormuGonder);
router.post('/kariyer-basvuru-gonder', kariyerBasvuruGonder);
export default router;
