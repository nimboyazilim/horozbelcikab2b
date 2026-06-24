import express from 'express';
import auth from '../middleware/auth.mjs';
import MenulerController from '../controllers/menulerController.mjs';

const router = express.Router();
const {
  menulerListe,
  menulerListe2
} = MenulerController;

router.get('/liste', auth, menulerListe);
router.get('/liste2/:userId', auth, menulerListe2);
export default router;
