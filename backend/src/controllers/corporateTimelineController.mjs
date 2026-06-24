import CorporateTimelineServices from '../services/corporateTimelineServices.mjs';

class CorporateTimelineController {
    async list(req, res) {
        const { lang } = req.params;
        res.json(await CorporateTimelineServices.list(lang));
    }
    async create(req, res) {
        res.json(await CorporateTimelineServices.create(req));
    }
    async update(req, res) {
        res.json(await CorporateTimelineServices.update(req));
    }
    async getById(req, res) {
        res.json(await CorporateTimelineServices.getById(req.params.id));
    }
    async delete(req, res) {
        res.json(await CorporateTimelineServices.delete(req.params.id));
    }
}
export default new CorporateTimelineController();