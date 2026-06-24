import conMain from "../config/database.mjs";
import fs from 'fs';
import path from 'path';

class BannerServices {
    async bannerListe() {
        return await conMain('banner').orderBy('order1', 'asc').select('*');
    }

    async createBanner(req) {
        if (!req.files || req.files.length === 0) {
            throw new Error('Yüklenecek resim bulunamadı.');
        }
        const file = req.files[0];
        const uploadDir = './public/uploads/banner';
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const fileExt = path.extname(file.originalname);
        const fileName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + fileExt;
        const filePath = path.join(uploadDir, fileName);
        await isesfs.prom.writeFile(filePath, file.buffer);

        const [insertedId] = await conMain('banner').insert({
            title: req.body.title,
            title_tr: req.body.title_tr,
            title_en: req.body.title_en,
            title_ru: req.body.title_ru,
            description_tr: req.body.description_tr,
            description_en: req.body.description_en,
            description_ru: req.body.description_ru,
            description: req.body.description,
            button_text: req.body.button_text,
            button_text_tr: req.body.button_text_tr,
            button_text_en: req.body.button_text_en,
            button_text_ru: req.body.button_text_ru,
            button_url: req.body.button_url,
            image: fileName,
            order1: 0
        });
        return { id: insertedId, image: fileName };
    }

    async updateBanner(req) {
        const updateData = {
            title: req.body.title,
            title_tr: req.body.title_tr,
            title_en: req.body.title_en,
            title_ru: req.body.title_ru,
            description_tr: req.body.description_tr,
            description_en: req.body.description_en,
            description_ru: req.body.description_ru,
            description: req.body.description,
            button_text: req.body.button_text,
            button_text_tr: req.body.button_text_tr,
            button_text_en: req.body.button_text_en,
            button_text_ru: req.body.button_text_ru,
            button_url: req.body.button_url,
            order1: 0
        };
        const uploadDir = './public/uploads/banner';
        const eskiBanner = await conMain('banner').where('id', req.params.id).first();

        if (req.files && req.files.length > 0) {
            if (eskiBanner.image) {
                const eskiResimPath = path.join(uploadDir, eskiBanner.image);
                if (fs.existsSync(eskiResimPath)) fs.unlinkSync(eskiResimPath);
            }
            const file = req.files[0];
            const fileExt = path.extname(file.originalname);
            const fileName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + fileExt;
            const filePath = path.join(uploadDir, fileName);
            await fs.promises.writeFile(filePath, file.buffer);
            updateData.image = fileName;
        }
        await conMain('banner').where('id', req.params.id).update(updateData);
        return { status: 'success', message: 'Güncelleme başarılı' };
    }

    async bannerById(req) {
        return await conMain('banner').where('id', req.params.id).first();
    }

    async deleteBanner(req) {
        const banner = await conMain('banner').where('id', req.params.id).first();
        if (banner && banner.image) {
            const filePath = path.join('./public/uploads/banner', banner.image);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        return await conMain('banner').where('id', req.params.id).delete();
    }

    async webBannerGetir() {
        return await conMain('banner').orderBy('order1', 'asc').select('*');
    }
}

export default new BannerServices();