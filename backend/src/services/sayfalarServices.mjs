import conMain from "../config/database.mjs";
import fs from 'fs';
import path from 'path';

class SayfalarServices {

    async katalogListe(req, res) {
        try {
            const result = await conMain('web_kataloglar').select('*').orderBy('sira', 'asc');
            return result;
        } catch (error) {
            throw error;
        }
    }

    async createKatalog(req, res) {
        let resimFile, dosyaFile; // Değişkenleri method başında tanımla
        try {
            if (!req.files || Object.keys(req.files).length === 0) {
                throw new Error('Yüklenecek dosya bulunamadı. Content-Type: ' + req.headers['content-type']);
            }

            const uploadDir = './public/uploads/catalog';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const katalogData = {
                title: req.body.title,
            };

            // Resim ve dosya işlemleri
            if (req.files.images && req.files.images.length > 0) {
                resimFile = req.files.images[0]; // İlk resim dosyasını al
                const resimExt = path.extname(resimFile.originalname);
                const resimUniqueName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + resimExt;
                const resimPath = path.join(uploadDir, resimUniqueName);

                // Dosyayı yazma işlemi
                await fs.promises.writeFile(resimPath, resimFile.buffer);
                katalogData.images = resimUniqueName; // Resim adını güncelle
            }

            if (req.files.dosya && req.files.dosya.length > 0) {
                dosyaFile = req.files.dosya[0]; // İlk dosya dosyasını al
                const dosyaExt = path.extname(dosyaFile.originalname);
                const dosyaUniqueName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + dosyaExt;
                const dosyaPath = path.join(uploadDir, dosyaUniqueName);

                // Dosyayı yazma işlemi
                await fs.promises.writeFile(dosyaPath, dosyaFile.buffer);
                katalogData.dosya = dosyaUniqueName; // Dosya adını güncelle
            } const [insertedId] = await conMain('web_kataloglar').insert(katalogData);
            return {
                status: 'success',
                message: 'Kayıt başarılı',
                id: insertedId
            };
        } catch (error) {
            // Hata durumunda yüklenen dosyaları temizle (eğer kaydetildiyse)
            // Bu durumda çok karmaşık olacağı için dosya cleanup'ı yapmıyoruz
            // Çünkü hangi dosyaların başarıyla yazıldığını takip etmek zor
            console.error('createKatalog hatası:', error);
            throw error;
        }
    }

    async updateKatalog(req, res) {
        try {
            const updateData = {
                title: req.body.title,
            };

            const uploadDir = './public/uploads/catalog';

            // Eski slider verilerini al
            const eskiKatalog = await conMain('web_kataloglar')
                .where('id', req.params.id)
                .first();

            // Resim ve dosya işlemleri
            if (req.files) { // Eğer dosya varsa
                // Eski resmi sil
                if (req.files.images && eskiKatalog.images) {
                    const eskiResimPath = path.join(uploadDir, eskiKatalog.images);
                    if (fs.existsSync(eskiResimPath)) {
                        fs.unlinkSync(eskiResimPath);
                    }

                    // Yeni resmi kaydet
                    const resimFile = req.files.images[0]; // İlk resim dosyasını al
                    if (resimFile) {
                        const resimExt = path.extname(resimFile.originalname);
                        const resimUniqueName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + resimExt;
                        const resimPath = path.join(uploadDir, resimUniqueName);

                        // Dosyayı yazma işlemi
                        await fs.promises.writeFile(resimPath, resimFile.buffer);
                        updateData.images = resimUniqueName; // Yeni resim adını güncelle
                    }
                }

                // Dosya işlemleri
                if (req.files.dosya && eskiKatalog.dosya) { // Eğer dosya varsa
                    const eskiDosyaPath = path.join(uploadDir, eskiKatalog.dosya);
                    if (fs.existsSync(eskiDosyaPath)) {
                        fs.unlinkSync(eskiDosyaPath);
                    }

                    const dosyaFile = req.files.dosya[0]; // İlk dosya dosyasını al
                    if (dosyaFile) {
                        const dosyaExt = path.extname(dosyaFile.originalname);
                        const dosyaUniqueName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + dosyaExt;
                        const dosyaPath = path.join(uploadDir, dosyaUniqueName);

                        // Dosyayı yazma işlemi
                        await fs.promises.writeFile(dosyaPath, dosyaFile.buffer);
                        updateData.dosya = dosyaUniqueName; // Dosya adını güncelle
                    }
                }
            }

            // Veritabanında güncelleme işlemi
            const updatedRows = await conMain('web_kataloglar').where('id', req.params.id).update(updateData);
            if (updatedRows === 0) {
                return {
                    status: 'error',
                    message: 'Güncelleme başarısız, kayıt bulunamadı.'
                };
            }

            return {
                status: 'success',
                message: 'Güncelleme başarılı'
            };
        } catch (error) {
            // Hata durumunda yüklenen yeni dosyayı temizle
            if (req.files) {
                if (updateData.images) {
                    const resimPath = path.join(uploadDir, updateData.images);
                    if (fs.existsSync(resimPath)) {
                        fs.unlinkSync(resimPath);
                    }
                }
                if (updateData.dosya) {
                    const dosyaPath = path.join(uploadDir, updateData.dosya);
                    if (fs.existsSync(dosyaPath)) {
                        fs.unlinkSync(dosyaPath);
                    }
                }
            }
            console.error('updateKatalog hatası:', error); // Hata mesajını konsola yazdır
            return {
                status: 'error',
                message: error.message,
            };
        }
    }

    async katalogById(req, res) {
        try {
            const result = await conMain('web_kataloglar').where('id', req.params.id).first();
            return result;
        } catch (error) {
            throw error;
        }
    }

    async deleteKatalog(req, res) {
        try {
            const result = await conMain('web_kataloglar').where('id', req.params.id).delete();
            return result;
        } catch (error) {
            throw error;
        }
    }

    async webKatalogGetir(req, res) {
        try {
            const result = await conMain('web_kataloglar').select('*').orderBy('sira', 'asc');
            return result;
        } catch (error) {
            throw error;
        }
    }

    async webHaberlerListe(req, res) {
        try {
            const result = await conMain('web_haberler').select('*');
            return result;
        } catch (error) {
            throw error;
        }
    }

    async webHaberlerGetir(req, res) {
        try {
            const result = await conMain('web_haberler').select('*').orderBy('id', 'desc');
            // HTML kodlarını temizle ve uzun yazıları kısalt
            const cleanedResult = result.map(item => {
                const cleanedArticle = item.long_article.replace(/<[^>]*>/g, ''); // HTML etiketlerini kaldır
                const cleanedArticleEn = item.long_article_en ? item.long_article_en.replace(/<[^>]*>/g, '') : item.long_article_en;
                const cleanedArticleRu = item.long_article_ru ? item.long_article_ru.replace(/<[^>]*>/g, '') : item.long_article_ru;

                return {
                    ...item,
                    long_article: cleanedArticle.length > 150 ? cleanedArticle.substring(0, 150) + '...' : cleanedArticle, // 150 karakterden sonra '...' ekle
                    long_article_en: cleanedArticleEn && cleanedArticleEn.length > 150 ? cleanedArticleEn.substring(0, 150) + '...' : cleanedArticleEn,
                    long_article_ru: cleanedArticleRu && cleanedArticleRu.length > 150 ? cleanedArticleRu.substring(0, 150) + '...' : cleanedArticleRu
                };
            });
            return cleanedResult;
        } catch (error) {
            throw error;
        }
    }

    async webHaberById(req, res) {
        try {
            const result = await conMain('web_haberler').where('id', req.params.id).first();
            return result;
        } catch (error) {
            throw error;
        }
    }

    async webHaberWebById(req, res) {
        try {
            const result = await conMain('web_haberler').where('slug', req.params.id).first();
            return result;
        } catch (error) {
            throw error;
        }
    }

    async webHaberCreate(req, res) {

        try {
            let files = [];
            if (req && req.files && req.files.images && req.files.images.length > 0) {
                files = req.files.images;
            }

            if (!files || files.length === 0) {
                throw new Error('Yüklenecek resim bulunamadı. Content-Type: ' + req.headers['content-type']);
            }

            const result = await conMain.transaction(async trx => {
                const insertPromises = files.map(async file => {
                    try {
                        const uploadDir = './public/uploads/news';

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

                        const slug = req.body.title.toLowerCase()
                            .replace(/ /g, '-')
                            .replace(/[ğ]/g, 'g')
                            .replace(/[ü]/g, 'u')
                            .replace(/[ş]/g, 's')
                            .replace(/[ı]/g, 'i')
                            .replace(/[ö]/g, 'o')
                            .replace(/[ç]/g, 'c')
                            .replace(/[^a-z0-9-]/g, '');

                        const [insertedId] = await trx('web_haberler').insert({
                            slug: slug,
                            images: dosyaYolu,
                            title: req.body.title,
                            title_en: req.body.title_en || null,
                            title_ru: req.body.title_ru || null,
                            long_article: req.body.long_article,
                            long_article_en: req.body.long_article_en || null,
                            long_article_ru: req.body.long_article_ru || null
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
            console.error('createSlider hatası:', error);
            throw error;
        }
    }

    async webHaberUpdate(req, res) {
        try {
            const updateData = {
                title: req.body.title,
                title_en: req.body.title_en || null,
                title_ru: req.body.title_ru || null,
                long_article: req.body.long_article,
                long_article_en: req.body.long_article_en || null,
                long_article_ru: req.body.long_article_ru || null
            };

            const uploadDir = './public/uploads/news';

            // Eski haber verilerini al
            const eskiHaber = await conMain('web_haberler')
                .where('id', req.params.id)
                .first();

            // Resim dosyası kontrolü
            if (req.files && req.files.images && req.files.images.length > 0) {
                // Eski resmi sil
                if (eskiHaber.images) {
                    const eskiResimPath = path.join(uploadDir, eskiHaber.images);
                    if (fs.existsSync(eskiResimPath)) {
                        fs.unlinkSync(eskiResimPath);
                    }
                }

                // Yeni resmi kaydet
                const resimFile = req.files.images[0];
                const resimExt = path.extname(resimFile.originalname);
                const resimUniqueName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + resimExt;
                const resimPath = path.join(uploadDir, resimUniqueName);

                // Dosyayı yazma işlemi
                await fs.promises.writeFile(resimPath, resimFile.buffer);
                updateData.images = resimUniqueName;
            }

            // Veritabanında güncelleme işlemi
            await conMain('web_haberler').where('id', req.params.id).update(updateData);
            
            return {
                status: 'success',
                message: 'Güncelleme başarılı'
            };
        } catch (error) {
            console.error('updateHaber hatası:', error);
            return {
                status: 'error',
                message: error.message,
            };
        }
    }

    async webHaberDelete(req) {
        try {
            const id = req.params.id;

            // Önce haberi veritabanından al
            const haber = await conMain('web_haberler').where('id', id).first();

            if (!haber) {
                return {
                    status: 'error',
                    message: 'Haber bulunamadı'
                };
            }

            // Haber resmini sil
            if (haber.images) {
                const imagePath = path.join('./public/uploads/news', haber.images);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            // Veritabanından haberi sil
            await conMain('web_haberler').where('id', id).del();

            return {
                status: 'success',
                message: 'Haber başarıyla silindi'
            };
        } catch (error) {
            console.error('webHaberDelete hatası:', error);
            return {
                status: 'error',
                message: error.message
            };
        }
    }
}

export default new SayfalarServices;