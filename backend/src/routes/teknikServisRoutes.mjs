import express from 'express';
import auth from '../middleware/auth.mjs';
import TeknikServisController from '../controllers/teknikServisController.mjs';

const router = express.Router();
const { 
  getTeknikServisById,
  createTeknikServis, 
  teknikServisListe,
  updateTeknikServis, 
  teknikServisTipListe,
  teknikServisTurListe,
  teknikServisCagriTurListe,
  teknikServisDurumListe,
  deleteTeknikServis
} = TeknikServisController;

router.get('/tipListe', auth, teknikServisTipListe);
router.get('/turListe', auth, teknikServisTurListe);
router.get('/cagriTurListe', auth, teknikServisCagriTurListe);
router.get('/durumListe', auth, teknikServisDurumListe);
router.get('/:id', auth, getTeknikServisById);
router.post('/liste', auth, teknikServisListe);
router.post('/create', auth, createTeknikServis);
router.put('/:id', auth, updateTeknikServis);
router.delete('/:id', auth, deleteTeknikServis);
export default router;