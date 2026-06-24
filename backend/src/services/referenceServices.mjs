import conMain from "../config/database.mjs";
import fs from "fs";
import path from "path";

class ReferenceServices {
    async list() {
        return await conMain('references').orderBy('order1', 'asc').select('*');
    }
    async byId(id) {
        return await conMain('references').where({ id }).first();
    }
    async create(req) {
        const { title, country } = req.body;
        let image = null;
        if (req.file) {
            const ext = path.extname(req.file.originalname);
            const fileName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + ext;
            const dest = path.join('./public/uploads/references', fileName);
            fs.renameSync(req.file.path, dest);
            image = fileName;
        }
        const [id] = await conMain('references').insert({ title, country, image });
        return { status: 'success', id, image };
    }
    async update(req) {
        const { id } = req.params;
        const { title, country } = req.body;
        let updateObj = { title, country };
        if (req.file) {
            const old = await conMain('references').where({ id }).first();
            if (old?.image) {
                const oldPath = path.join('./public/uploads/references', old.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            const ext = path.extname(req.file.originalname);
            const fileName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + ext;
            const dest = path.join('./public/uploads/references', fileName);
            fs.renameSync(req.file.path, dest);
            updateObj.image = fileName;
        }
        await conMain('references').where({ id }).update(updateObj);
        return { status: 'success' };
    }
    async delete(id) {
        const old = await conMain('references').where({ id }).first();
        if (old?.image) {
            const oldPath = path.join('./public/uploads/references', old.image);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        await conMain('references').where({ id }).del();
        return { status: 'success' };
    }
}
export default new ReferenceServices();