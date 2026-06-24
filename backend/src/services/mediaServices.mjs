import conMain from "../config/database.mjs";
import fs from "fs";
import path from "path";

class MediaServices {
    // FOTOĞRAF
    async photoList() {
        return await conMain('media_photos').orderBy('order1', 'asc').select('*');
    }
    async photoById(id) {
        return await conMain('media_photos').where({ id }).first();
    }
    async createPhoto(req) {
        const { title } = req.body;
        let image = null;
        if (req.file) {
            const ext = path.extname(req.file.originalname);
            const fileName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + ext;
            const dest = path.join('./public/uploads/media', fileName);
            fs.renameSync(req.file.path, dest);
            image = fileName;
        }
        const [id] = await conMain('media_photos').insert({ title, image });
        return { status: 'success', id, image };
    }
    async updatePhoto(req) {
        const { id } = req.params;
        const { title } = req.body;
        let updateObj = { title };
        if (req.file) {
            // Eski dosyayı sil
            const old = await conMain('media_photos').where({ id }).first();
            if (old?.image) {
                const oldPath = path.join('./public/uploads/media', old.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            // Yeni dosyayı kaydet
            const ext = path.extname(req.file.originalname);
            const fileName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + ext;
            const dest = path.join('./public/uploads/media', fileName);
            fs.renameSync(req.file.path, dest);
            updateObj.image = fileName;
        }
        await conMain('media_photos').where({ id }).update(updateObj);
        return { status: 'success' };
    }
    async deletePhoto(id) {
        const old = await conMain('media_photos').where({ id }).first();
        if (old?.image) {
            const oldPath = path.join('./public/uploads/media', old.image);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        await conMain('media_photos').where({ id }).del();
        return { status: 'success' };
    }

    // VİDEO
    async videoList() {
        return await conMain('media_videos').orderBy('order1', 'asc').select('*');
    }
    async videoById(id) {
        return await conMain('media_videos').where({ id }).first();
    }
    async createVideo(req) {
        const { title, url } = req.body;
        const [id] = await conMain('media_videos').insert({ title, url });
        return { status: 'success', id };
    }
    async updateVideo(req) {
        const { id } = req.params;
        const { title, url } = req.body;
        await conMain('media_videos').where({ id }).update({ title, url });
        return { status: 'success' };
    }
    async deleteVideo(id) {
        await conMain('media_videos').where({ id }).del();
        return { status: 'success' };
    }
}
export default new MediaServices();