import conMain from "../config/database.mjs";
import fs from "fs";
import path from "path";

class CorporateTimelineServices {
    async list() {
        return await conMain('corporate_timeline').orderBy('year', 'asc');
    }
    async create(req) {
        const {
            year,
            title_tr, title_en, title_ru,
            description_tr, description_en, description_ru
        } = req.body;
        let image = null;
        if (req.file) {
            const ext = path.extname(req.file.originalname);
            const fileName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + ext;
            const dest = path.join('./public/uploads/timeline', fileName);
            fs.renameSync(req.file.path, dest);
            image = fileName;
        }
        const insertObj = {
            year,
            title_tr, title_en, title_ru,
            description_tr, description_en, description_ru,
            image
        };
        const [id] = await conMain('corporate_timeline').insert(insertObj);
        return { status: 'success', id, image };
    }
    async update(req) {
        const { id } = req.params;
        const {
            year,
            title_tr, title_en, title_ru,
            description_tr, description_en, description_ru
        } = req.body;
        let updateObj = {
            year,
            title_tr, title_en, title_ru,
            description_tr, description_en, description_ru
        };
        if (req.file) {
            const old = await conMain('corporate_timeline').where({ id }).first();
            if (old?.image) {
                const oldPath = path.join('./public/uploads/timeline', old.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            const ext = path.extname(req.file.originalname);
            const fileName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + ext;
            const dest = path.join('./public/uploads/timeline', fileName);
            fs.renameSync(req.file.path, dest);
            updateObj.image = fileName;
        }
        await conMain('corporate_timeline').where({ id }).update(updateObj);
        return { status: 'success' };
    }
    async delete(id) {
        const old = await conMain('corporate_timeline').where({ id }).first();
        if (old?.image) {
            const oldPath = path.join('./public/uploads/timeline', old.image);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        await conMain('corporate_timeline').where({ id }).del();
        return { status: 'success' };
    }

    async getById(id) {
        return await conMain('corporate_timeline').where({ id }).first();
    }
}
export default new CorporateTimelineServices();