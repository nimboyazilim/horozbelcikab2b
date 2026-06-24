import CertificateServices from '../services/certificateServices.mjs';

class CertificateController {
    async list(req, res) { res.json(await CertificateServices.list()); }
    async byId(req, res) { res.json(await CertificateServices.byId(req.params.id)); }
    async create(req, res) { res.json(await CertificateServices.create(req)); }
    async update(req, res) { res.json(await CertificateServices.update(req)); }
    async delete(req, res) { res.json(await CertificateServices.delete(req.params.id)); }
}
export default new CertificateController();