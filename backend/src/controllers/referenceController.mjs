import ReferenceServices from '../services/referenceServices.mjs';

class ReferenceController {
    async list(req, res) { res.json(await ReferenceServices.list()); }
    async byId(req, res) { res.json(await ReferenceServices.byId(req.params.id)); }
    async create(req, res) { res.json(await ReferenceServices.create(req)); }
    async update(req, res) { res.json(await ReferenceServices.update(req)); }
    async delete(req, res) { res.json(await ReferenceServices.delete(req.params.id)); }
}
export default new ReferenceController();