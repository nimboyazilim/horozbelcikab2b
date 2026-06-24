import conMain from "../config/database.mjs";
import fs from 'fs';
import path from 'path';

class PopupServices {
    async popupListe() {
        return await conMain('popup').orderBy('order1', 'asc').select('*');
    }

    async createPopup(req) {
        if (!req.files || req.files.length === 0) {
            throw new Error('Yüklenecek resim bulunamadı.');
        }
        const file = req.files[0];
        const uploadDir = './public/uploads/popup';
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const fileExt = path.extname(file.originalname);
        const fileName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + fileExt;
        const filePath = path.join(uploadDir, fileName);
        await fs.promises.writeFile(filePath, file.buffer);

        const [insertedId] = await conMain('popup').insert({
            title_tr: req.body.title_tr,
            title_en: req.body.title_en,
            title_ru: req.body.title_ru,
            title_ro: req.body.title_ro,
            description_tr: req.body.description_tr,
            description_en: req.body.description_en,
            description_ru: req.body.description_ru,
            description_ro: req.body.description_ro,
            image: fileName,
            link: req.body.link || null,
            is_active: parseInt(req.body.is_active) === 1 ? 1 : 0,
            order1: parseInt(req.body.order1) || 0
        });
        return { id: insertedId, image: fileName };
    }

    async updatePopup(req) {
        const updateData = {
            title_tr: req.body.title_tr,
            title_en: req.body.title_en,
            title_ru: req.body.title_ru,
            title_ro: req.body.title_ro,
            description_tr: req.body.description_tr,
            description_en: req.body.description_en,
            description_ru: req.body.description_ru,
            description_ro: req.body.description_ro,
            link: req.body.link || null,
            is_active: parseInt(req.body.is_active) === 1 ? 1 : 0,
            order1: parseInt(req.body.order1) || 0
        };
        const uploadDir = './public/uploads/popup';
        const eskiPopup = await conMain('popup').where('id', req.params.id).first();

        if (req.files && req.files.length > 0) {
            if (eskiPopup.image) {
                const eskiResimPath = path.join(uploadDir, eskiPopup.image);
                if (fs.existsSync(eskiResimPath)) fs.unlinkSync(eskiResimPath);
            }
            const file = req.files[0];
            const fileExt = path.extname(file.originalname);
            const fileName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + fileExt;
            const filePath = path.join(uploadDir, fileName);
            await fs.promises.writeFile(filePath, file.buffer);
            updateData.image = fileName;
        }
        await conMain('popup').where('id', req.params.id).update(updateData);
        return { status: 'success', message: 'Güncelleme başarılı' };
    }

    async popupById(req) {
        return await conMain('popup').where('id', req.params.id).first();
    }

    async deletePopup(req) {
        const popup = await conMain('popup').where('id', req.params.id).first();
        if (popup && popup.image) {
            const filePath = path.join('./public/uploads/popup', popup.image);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        return await conMain('popup').where('id', req.params.id).delete();
    }

    async getActivePopup() {
        return await conMain('popup')
            .where('is_active', 1)
            .orderBy('order1', 'asc')
            .first();
    }
}

export default new PopupServices();
