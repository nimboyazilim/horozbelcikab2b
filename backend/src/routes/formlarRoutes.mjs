import express from 'express';
import FormlarController from '../controllers/formlarController.mjs';
import auth from '../middleware/auth.mjs';

const router = express.Router();
const {
    formlarServisFormu
    } = FormlarController;

router.get('/servis-formu/:id', auth, formlarServisFormu);

export default router;