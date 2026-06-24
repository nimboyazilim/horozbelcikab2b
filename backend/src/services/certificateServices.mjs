import conMain from "../config/database.mjs";
import fs from "fs";
import path from "path";

class CertificateServices {
    async list() {
        return await conMain('certificates').orderBy('order1', 'asc').select('*');
    }
    async byId(id) {
        return await conMain('certificates').where({ id }).first();
    }
    async create(req) {
        const { name } = req.body;
        let file = null;
        if (req.file) {
            const ext = path.extname(req.file.originalname);
            const fileName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + ext;
            const dest = path.join('./public/uploads/pdfs', fileName);
            fs.renameSync(req.file.path, dest);
            file = fileName;
        }
        const [id] = await conMain('certificates').insert({ name, file });
        return { status: 'success', id, file };
    }
    async update(req) {
        const { id } = req.params;
        const { name } = req.body;
        let updateObj = { name };
        if (req.file) {
            const old = await conMain('certificates').where({ id }).first();
            if (old?.file) {
                const oldPath = path.join('./public/uploads/pdfs', old.file);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            const ext = path.extname(req.file.originalname);
            const fileName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + ext;
            const dest = path.join('./public/uploads/pdfs', fileName);
            fs.renameSync(req.file.path, dest);
            updateObj.file = fileName;
        }
        await conMain('certificates').where({ id }).update(updateObj);
        return { status: 'success' };
    }
    async delete(id) {
        const old = await conMain('certificates').where({ id }).first();
        if (old?.file) {
            const oldPath = path.join('./public/uploads/pdfs', old.file);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        await conMain('certificates').where({ id }).del();
        return { status: 'success' };
    }
}
export default new CertificateServices();