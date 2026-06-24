import express from 'express';
import auth from '../middleware/auth.mjs';
import authb2b from '../middleware/authb2b.mjs';
import MusterilerController from '../controllers/musterilerController.mjs';

const router = express.Router();
const {
  musterilerListe,
  musterilerAdresler,
  getProfil,
  updateProfil,
  createAdres,
  deleteAdres,
  cmsMusterilerCreate,
  cmsMusterilerById,
  cmsMusterilerUpdate,
  musterilerGrupFiyatListesi,
  yeniMusteriBasvuru,
  updateAdres,
  musterilerDelete,
  cariBakiye
} = MusterilerController;

router.get('/liste', auth, musterilerListe);
router.get('/adresler/:musteri_id', auth, musterilerAdresler);
router.get('/getProfil/:musteri_id',  getProfil);
router.get('/fiyatGrup/liste', auth, musterilerGrupFiyatListesi);
router.get('/cmsMusterilerById/:id', auth, cmsMusterilerById);
router.get('/cari-bakiye', authb2b, cariBakiye);
router.post('/createAdres', authb2b, createAdres);
router.post('/cmsMusterilerCreate', auth, cmsMusterilerCreate);
router.post('/yeniMusteriBasvuru', yeniMusteriBasvuru);
router.put('/updateProfil/:musteri_id', authb2b, updateProfil);
router.put('/cmsMusterilerUpdate/:id', auth, cmsMusterilerUpdate);
router.delete('/deleteAdres/:adres_id', auth, deleteAdres);
router.put('/updateAdres/:id', authb2b, updateAdres);
router.delete('/:id', auth, musterilerDelete);

export default router;
