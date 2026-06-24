import express from 'express';
import auth from '../middleware/auth.mjs';
import ActivityLogController from '../controllers/activityLogController.mjs';

const router = express.Router();

router.post('/', auth, (req, res) => ActivityLogController.createLog(req, res));
router.get('/', auth, (req, res) => ActivityLogController.getLogs(req, res));
router.delete('/', auth, (req, res) => ActivityLogController.clearLogs(req, res));

export default router;
