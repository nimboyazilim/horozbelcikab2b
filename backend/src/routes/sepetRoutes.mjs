import express from 'express';
import auth from '../middleware/auth.mjs';
import SepetController from '../controllers/sepetController.mjs';
import authb2b from '../middleware/authb2b.mjs';

const router = express.Router();
const {
    getSepet,
    createSepet,
    updateSepet,
    deleteSepet,
    getCmsSepetListe,
    getCmsSepetById
} = SepetController;

router.get('/getSepet/:musteri_id', authb2b, getSepet);
router.get('/getCmsSepetListe', auth, getCmsSepetListe);
router.get('/getCmsSepetById/:musteri_id', auth, getCmsSepetById);
router.post('/create', authb2b, createSepet);
router.put('/updateSepet/:urun_id/:varyant_id', authb2b, updateSepet);
router.delete('/deleteSepetItem/:urun_id/:varyant_id', authb2b, deleteSepet);
export default router;
