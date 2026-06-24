import express from 'express';
import auth from '../middleware/auth.mjs';
import UserController from '../controllers/userController.mjs';

const router = express.Router();
const { 
  getUsers, 
  getUser,
  getUserYetki,
  saveUserYetki,
  createUser, 
  updateUser, 
  deleteUser,
  getProfile,
  updateProfile
} = UserController;

router.get('/', auth, getUsers);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/:id', auth, getUser);
router.get('/yetki/:userId', auth, getUserYetki);
router.post('/yetki', auth, saveUserYetki);
router.post('/', auth, createUser);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);

export default router;