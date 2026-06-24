import conMain from "../config/database.mjs";
import fs from 'fs';
import path from 'path';

class SliderServices {

    async sliderListe(req, res) {
        try {
            const result = await conMain('web_slider').orderBy('order1', 'asc').select('*');
            return result;
        } catch (error) {
            throw error;
        }
    }

    async createSlider(req, res) {
        try {
            if ((!req.files || req.files.length === 0) && !req.body.video_url) {
                throw new Error('Yüklenecek resim veya video bulunamadı.');
            }

            const uploadDir = './public/uploads/slider';
            let fileName = null;
            let type = 'image';
            let video_url = null;

            if (req.files && req.files.length > 0) {
                const file = req.files[0];
                const fileExt = path.extname(file.originalname).toLowerCase();
                const isVideo = ['.mp4', '.webm', '.mov'].includes(fileExt);
                type = isVideo ? 'video' : 'image';

                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
                fileName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + fileExt;
                const filePath = path.join(uploadDir, fileName);
                await fs.promises.writeFile(filePath, file.buffer);

                if (isVideo) video_url = fileName;
            } else if (req.body.video_url) {
                type = 'video';
                video_url = req.body.video_url;
            }

            const [insertedId] = await conMain('web_slider').insert({
                images: fileName,
                title: req.body.title_tr || req.body.title,
                title_tr: req.body.title_tr,
                title_en: req.body.title_en,
                title_ru: req.body.title_ru,
                description: req.body.description_tr || req.body.description,
                description_tr: req.body.description_tr,
                description_en: req.body.description_en,
                description_ru: req.body.description_ru,
                url: req.body.url,
                order1: 0,
                type,
                video_url
            });

            return {
                status: 'success',
                message: 'Slider başarıyla kaydedildi',
                kayitlar: [{ id: insertedId, images: fileName, type, video_url }]
            };
        } catch (error) {
            console.error('createSlider hatası:', error);
            throw error;
        }
    }

    async updateSlider(req, res) {
        try {
            const updateData = {
                title: req.body.title_tr || req.body.title, // title_tr'yi default olarak kullan
                title_tr: req.body.title_tr,
                title_en: req.body.title_en,
                title_ru: req.body.title_ru,
                description: req.body.description_tr || req.body.description, // description_tr'yi default olarak kullan
                description_tr: req.body.description_tr,
                description_en: req.body.description_en,
                description_ru: req.body.description_ru,
                url: req.body.url,
                order1: 0,
                type: req.body.type || 'image',
                video_url: req.body.video_url || null
            };

            const uploadDir = './public/uploads/slider';
            const eskiSlider = await conMain('web_slider').where('id', req.params.id).first();

            if (req.files && req.files.length > 0) {
                if (eskiSlider.images) {
                    const eskiResimPath = path.join(uploadDir, eskiSlider.images);
                    if (fs.existsSync(eskiResimPath)) fs.unlinkSync(eskiResimPath);
                }
                const file = req.files[0];
                const fileExt = path.extname(file.originalname).toLowerCase();
                const isVideo = ['.mp4', '.webm', '.mov'].includes(fileExt);
                updateData.type = isVideo ? 'video' : 'image';
                const fileName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + fileExt;
                const filePath = path.join(uploadDir, fileName);
                await fs.promises.writeFile(filePath, file.buffer);
                updateData.images = fileName;
                if (isVideo) updateData.video_url = fileName;
            }

            await conMain('web_slider').where('id', req.params.id).update(updateData);
            return { status: 'success', message: 'Güncelleme başarılı' };
        } catch (error) {
            console.error('updateSlider hatası:', error);
            throw error;
        }
    }

    async sliderById(req, res) {
        try {
            const result = await conMain('web_slider').where('id', req.params.id).first();
            return result;
        } catch (error) {
            throw error;
        }
    }

    async deleteSlider(req, res) {
        try {
            const result = await conMain('web_slider').where('id', req.params.id).delete();
            return result;
        } catch (error) {
            throw error;
        }
    }


    async webSliderGetir(req, res) {
        try {
            const result = await conMain('web_slider').orderBy('order1', 'asc').select('*');
            return result;
        } catch (error) {
            throw error;
        }
    }

    async b2bsliderListe(req, res) {
        try {
            const result = await conMain('b2b_slider').orderBy('order1', 'asc').select('*');
            return result;
        } catch (error) {
            throw error;
        }
    }

    async b2bSliderGetir(req, res) {
        try {
            const result = await conMain('b2b_slider').orderBy('order1', 'asc').select('*');
            return result;
        } catch (error) {
            throw error;
        }
    }

    async b2bcreateSlider(req, res) {

        try {
            if (!req.files || req.files.length === 0) {
                throw new Error('Yüklenecek resim bulunamadı. Content-Type: ' + req.headers['content-type']);
            }

            const result = await conMain.transaction(async trx => {
                const insertPromises = req.files.map(async file => {
                    try {
                        const uploadDir = './public/uploads/slider';

                        if (!fs.existsSync(uploadDir)) {
                            fs.mkdirSync(uploadDir, { recursive: true });
                        }

                        // Dosya uzantısını al
                        const fileExt = path.extname(file.originalname);
                        // Benzersiz dosya adı oluştur (timestamp + random string + uzantı)
                        const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 15);
                        const fileName = uniqueId + fileExt;
                        const filePath = path.join(uploadDir, fileName);

                        await fs.promises.writeFile(filePath, file.buffer);
                        const dosyaYolu = `${fileName}`;

                        const [insertedId] = await trx('b2b_slider').insert({
                            images: dosyaYolu,
                            title: req.body.title,
                            description: req.body.description,
                            url: req.body.url,
                            order1: 0
                        });

                        return {
                            id: insertedId,
                            images: dosyaYolu
                        };
                    } catch (err) {
                        console.error('Resim işleme hatası:', err);
                        throw err;
                    }
                });

                return await Promise.all(insertPromises);
            });

            return {
                status: 'success',
                message: 'Resim başarıyla kaydedildi',
                kayitlar: result
            };
        } catch (error) {
            console.error('b2bcreateSlider hatası:', error);
            throw error;
        }


    }

    async b2bupdateSlider(req, res) {
        try {
            const updateData = {
                title: req.body.title,
                description: req.body.description,
                url: req.body.url,
                order1: 0
            };

            const uploadDir = './public/uploads/slider';

            // Eski slider verilerini al
            const eskiSlider = await conMain('b2b_slider')
                .where('id', req.params.id)
                .first();

            // Resim dosyası kontrolü
            if (req.files && req.files.length > 0) { // Eğer dosya varsa
                // Eski resmi sil
                if (eskiSlider.images) {
                    const eskiResimPath = path.join(uploadDir, eskiSlider.images);
                    if (fs.existsSync(eskiResimPath)) {
                        fs.unlinkSync(eskiResimPath);
                    }
                }

                // Yeni resmi kaydet
                const resimFile = req.files[0]; // İlk dosyayı al
                const resimExt = path.extname(resimFile.originalname);
                const resimUniqueName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + resimExt;
                const resimPath = path.join(uploadDir, resimUniqueName);

                // Dosyayı yazma işlemi
                await fs.promises.writeFile(resimPath, resimFile.buffer);
                updateData.images = resimUniqueName; // Yeni resim adını güncelle
            } else {
                // console.log('Resim dosyası yüklenmedi.'); // Hata ayıklama için
            }

            // Veritabanında güncelleme işlemi

            await conMain('b2b_slider').where('id', req.params.id).update(updateData);
            return {
                status: 'success',
                message: 'Güncelleme başarılı'
            };
        } catch (error) {
            // Hata durumunda yüklenen yeni dosyayı temizle
            if (req.files && req.files.length > 0 && updateData.images) {
                const resimPath = path.join('./public/uploads/slider', updateData.images);
                if (fs.existsSync(resimPath)) {
                    fs.unlinkSync(resimPath);
                }
            }
            console.error('updateSlider hatası:', error); // Hata mesajını konsola yazdır
            return {
                status: 'error',
                message: error.message,
            };
        }
    }

    async b2bSliderById(req, res) {
        try {
            const result = await conMain('b2b_slider').where('id', req.params.id).first();
            return result;
        } catch (error) {
            throw error;
        }
    }

    async b2bdeleteSlider(req, res) {
        try {
            const result = await conMain('b2b_slider').where('id', req.params.id).delete();
            return result;
        } catch (error) {
            throw error;
        }
    }


}
export default new SliderServices;