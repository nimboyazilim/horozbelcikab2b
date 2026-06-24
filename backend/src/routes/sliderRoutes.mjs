import express from 'express';
import auth from '../middleware/auth.mjs';
import SliderController from '../controllers/sliderController.mjs';
import multer from 'multer';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  }
});

const router = express.Router();
const {
  sliderListe,
  b2bsliderListe,
  createSlider,
  b2bcreateSlider,
  updateSlider,
  sliderById,
  deleteSlider,
  webSliderGetir,
  b2bSliderGetir,
  b2bSliderById,
  b2bdeleteSlider,
  b2bupdateSlider
} = SliderController;

router.get('/web/liste', auth, sliderListe);
router.get('/b2b/liste', auth, b2bsliderListe);
router.get('/web/webSliderGetir', webSliderGetir);
router.get('/b2b/b2bSliderGetir', b2bSliderGetir);
router.post('/web/create', auth, upload.array('images'), createSlider);
router.post('/b2b/create', auth, upload.array('images'), b2bcreateSlider);
router.get('/web/:id', auth, sliderById);
router.get('/b2b/:id', auth, b2bSliderById);
router.put('/web/:id', auth, upload.array('images'), updateSlider);
router.put('/b2b/:id', auth, upload.array('images'), b2bupdateSlider);
router.delete('/web/:id', auth, deleteSlider);
router.delete('/b2b/:id', auth, b2bdeleteSlider);
export default router;
