import ActivityLogServices from '../services/activityLogServices.mjs';

class ActivityLogController {
    async createLog(req, res) {
        try {
            const result = await ActivityLogServices.createLog(req);
            return res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async getLogs(req, res) {
        try {
            const result = await ActivityLogServices.getLogs(req);
            return res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async clearLogs(req, res) {
        try {
            const result = await ActivityLogServices.clearLogs();
            return res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
}

export default new ActivityLogController();
