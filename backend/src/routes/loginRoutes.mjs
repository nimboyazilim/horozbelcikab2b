import express from 'express';
import loginController from '../controllers/loginController.mjs';

const router = express.Router();
const { 
  login,
  refreshToken,
  b2bLogin,
  b2bRefreshToken
} = loginController;

router.post('/', login);
router.post('/refresh-token', refreshToken);
router.post('/b2b-login', b2bLogin);
router.post('/b2b-refresh-token', b2bRefreshToken);

export default router;