import conMain from "../config/database.mjs";
import fs from 'fs';
import path from 'path';

class KategorilerServices {
    
    async kategorilerListe(req, res) {
        try {
            // Kategorileri üst kategorileriyle birlikte çek
            const tumKategoriler = await conMain('kategoriler as k1')
                .leftJoin('kategoriler as k2', 'k1.kategori_ust_id', 'k2.id')
                .select([
                    'k1.*',
                    'k2.kategori_adi as ust_kategori_adi'
                ]);     
            return tumKategoriler;
        } catch (error) {
            return error;
        }
    }

    async getKategoriById(req, res) {
        try {
          
            const kategori = await conMain('kategoriler')
                .where('id', req.params.id)
                .select('*');
            return kategori[0];
        } catch (error) {
            return error;
        }
    }

    async createKategori(req, res) {
        try {
            // Aynı kategori adı veya SEO adı ile kayıt var mı kontrol et
            const existingKategori = await conMain('kategoriler')
                .where('kategori_adi', req.body.kategori_adi)
                .orWhere('kategori_seo', req.body.kategori_seo)
                .first();

            if (existingKategori) {
                return {
                    status: 'error',
                    message: 'Bu kategori adı veya SEO adı zaten kullanılıyor'
                };
            }

            const kategoriData = { ...req.body };

            // Upload directory for categories
            const uploadDir = './public/uploads/category';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Resim dosyalarını işle
            if (req.files) {
                // Kategori resmi işleme
                if (req.files.kategori_resim) {
                    const resimFile = req.files.kategori_resim[0];
                    const resimExt = path.extname(resimFile.originalname);
                    const resimUniqueName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + resimExt;
                    const resimPath = path.join(uploadDir, resimUniqueName);
                    
                    await fs.promises.writeFile(resimPath, resimFile.buffer);
                    kategoriData.kategori_resim = resimUniqueName;
                }

                // Kategori ikon işleme
                if (req.files.kategori_ikon) {
                    const ikonFile = req.files.kategori_ikon[0];
                    const ikonExt = path.extname(ikonFile.originalname);
                    const ikonUniqueName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + ikonExt;
                    const ikonPath = path.join(uploadDir, ikonUniqueName);
                    
                    await fs.promises.writeFile(ikonPath, ikonFile.buffer);
                    kategoriData.kategori_ikon = ikonUniqueName;
                }
            }

            const [insertedId] = await conMain('kategoriler').insert(kategoriData);
            return {
                status: 'success',
                message: 'Kayıt başarılı',
                id: insertedId
            };
        } catch (error) {
            // Hata durumunda yüklenen dosyaları temizle
            if (req.files) {
                if (req.files.kategori_resim && kategoriData.kategori_resim) {
                    fs.unlinkSync(path.join('./public/uploads/categories', kategoriData.kategori_resim));
                }
                if (req.files.kategori_ikon && kategoriData.kategori_ikon) {
                    fs.unlinkSync(path.join('./public/uploads/categories', kategoriData.kategori_ikon));
                }
            }
            throw new Error(error.message);
        }
    }

    async updateKategori(req, res) {
        try {
            const kategoriData = { ...req.body };
            const uploadDir = './public/uploads/category';

            // Eski kategori verilerini al
            const eskiKategori = await conMain('kategoriler')
                .where('id', req.params.id)
                .first();

            // Resim dosyalarını işle
            if (req.files) {
                // Kategori resmi işleme
                if (req.files.kategori_resim) {
                    // Eski resmi sil
                    if (eskiKategori.kategori_resim) {
                        const eskiResimPath = path.join(uploadDir, eskiKategori.kategori_resim);
                        if (fs.existsSync(eskiResimPath)) {
                            fs.unlinkSync(eskiResimPath);
                        }
                    }

                    // Yeni resmi kaydet
                    const resimFile = req.files.kategori_resim[0];
                    const resimExt = path.extname(resimFile.originalname);
                    const resimUniqueName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + resimExt;
                    const resimPath = path.join(uploadDir, resimUniqueName);
                    
                    await fs.promises.writeFile(resimPath, resimFile.buffer);
                    kategoriData.kategori_resim = resimUniqueName;
                }

                // Kategori ikon işleme
                if (req.files.kategori_ikon) {
                    // Eski ikonu sil
                    if (eskiKategori.kategori_ikon) {
                        const eskiIkonPath = path.join(uploadDir, eskiKategori.kategori_ikon);
                        if (fs.existsSync(eskiIkonPath)) {
                            fs.unlinkSync(eskiIkonPath);
                        }
                    }

                    // Yeni ikonu kaydet
                    const ikonFile = req.files.kategori_ikon[0];
                    const ikonExt = path.extname(ikonFile.originalname);
                    const ikonUniqueName = Date.now() + '-' + Math.random().toString(36).substring(2, 15) + ikonExt;
                    const ikonPath = path.join(uploadDir, ikonUniqueName);
                    
                    await fs.promises.writeFile(ikonPath, ikonFile.buffer);
                    kategoriData.kategori_ikon = ikonUniqueName;
                }
            }

            await conMain('kategoriler').where('id', req.params.id).update(kategoriData);
            return {
                status: 'success',
                message: 'Güncelleme başarılı'
            };
        } catch (error) {
            // Hata durumunda yüklenen yeni dosyaları temizle
            if (req.files) {
                if (req.files.kategori_resim && kategoriData.kategori_resim) {
                    const resimPath = path.join('./public/uploads/category', kategoriData.kategori_resim);
                    if (fs.existsSync(resimPath)) {
                        fs.unlinkSync(resimPath);
                    }
                }
                if (req.files.kategori_ikon && kategoriData.kategori_ikon) {
                    const ikonPath = path.join('./public/uploads/category', kategoriData.kategori_ikon);
                    if (fs.existsSync(ikonPath)) {
                        fs.unlinkSync(ikonPath);
                    }
                }
            }
            return {
                status: 'error',
                message: error.message,
            };
        }
    }

    async webKategoriListe(req, res) {
        try {
            // Kategorileri ve alt kategorilerini tek bir sorguda çek
            const tumKategoriler = await conMain('kategoriler as k1')
                .leftJoin('kategoriler as k2', 'k1.kategori_ust_id', 'k2.id')
                .select([
                    'k1.*',
                    'k2.kategori_adi as ust_kategori_adi'
                ]).orderBy('k1.sira', 'asc');

            // 0 olan kategorileri ve alt kategorilerini ayır
            const sonuc = {
                kategoriler: tumKategoriler.filter(kategori => kategori.kategori_ust_id === 0).map(kategori => ({
                    ...kategori,
                    altKategoriler: tumKategoriler.filter(altKategori => altKategori.kategori_ust_id === kategori.id).map(altKategori => ({
                        ...altKategori,
                        altKategoriler: tumKategoriler.filter(ucKategori => ucKategori.kategori_ust_id === altKategori.id)
                    }))
                }))
            };

            return sonuc;
        } catch (error) {
            return error;
        }
    }

    async webBreadcrumbListe(req, res) {
        try {
            let breadcrumb = [];
            let anaKategori = [];
            
            // Tüm kategorileri tek seferde çek
            const tumKategoriler = await conMain('kategoriler')
                .select('*')
                .orderBy('sira','asc');


            // Kategori ağacını oluştur
            const kategoriAgaci = this.buildKategoriAgaci(tumKategoriler);

            if (req.params.slug === 'undefined') {
                // Ana kategorileri getir (kategori_ust_id = 0 olanlar)
                anaKategori = kategoriAgaci.filter(kategori => kategori.kategori_ust_id === 0);
            } else {
                // Belirli bir slug için breadcrumb oluştur
                const kategoriBySlug = tumKategoriler.find(k => k.kategori_seo === req.params.slug);
                
                if (kategoriBySlug) {
                    // Breadcrumb oluşturma - tüm üst kategorileri recursive olarak bul
                    let currentKategori = kategoriBySlug;
                    while (currentKategori && currentKategori.kategori_ust_id !== 0) {
                        const ustKategori = tumKategoriler.find(k => k.id === currentKategori.kategori_ust_id);
                        
                        if (ustKategori) {
                            breadcrumb.unshift({ 
                                title: ustKategori.kategori_adi, 
                                title_en: ustKategori.kategori_adi_en, 
                                title_tr: ustKategori.kategori_adi_tr, 
                                href: `/products/${ustKategori.kategori_seo}` 
                            });
                            currentKategori = ustKategori;
                        } else {
                            break;
                        }
                    }
                    breadcrumb.push({ 
                        title: kategoriBySlug.kategori_adi, 
                        title_en: kategoriBySlug.kategori_adi_en, 
                        title_tr: kategoriBySlug.kategori_adi_tr, 
                        href: `/products/${kategoriBySlug.kategori_seo}` 
                    });

                    // Yan menü için kategori yapısı - tüm ana kategorileri getir
                    anaKategori = kategoriAgaci.filter(kategori => kategori.kategori_ust_id === 0);
                }
            }

            //console.log(anaKategori);

            return {
                breadcrumb,
                anaKategori
            };
        } catch (error) {
            return error;
        }
    }

    // Kategori ağacını oluşturan yardımcı fonksiyon
    buildKategoriAgaci(kategoriler) {
        const kategoriMap = new Map();
        
        // Önce tüm kategorileri map'e ekle
        kategoriler.forEach(kategori => {
            kategoriMap.set(kategori.id, {
                ...kategori,
                altKategoriler: []
            });
        });

        // Alt kategorileri üst kategorilere ekle (recursive yapı için)
        kategoriler.forEach(kategori => {
            if (kategori.kategori_ust_id !== 0) {
                const ustKategori = kategoriMap.get(kategori.kategori_ust_id);
                if (ustKategori) {
                    ustKategori.altKategoriler.push(kategoriMap.get(kategori.id));
                }
            }
        });

        // Alt kategorileri sırala
        const siralama = (kategoriListesi) => {
            kategoriListesi.forEach(kategori => {
                if (kategori.altKategoriler && kategori.altKategoriler.length > 0) {
                    kategori.altKategoriler.sort((a, b) => a.kategori_adi.localeCompare(b.kategori_adi));
                    siralama(kategori.altKategoriler);
                }
            });
        };

        // Sadece ana kategorileri (kategori_ust_id = 0) döndür ve sırala
        const anaKategoriler = Array.from(kategoriMap.values()).filter(kategori => kategori.kategori_ust_id === 0);
        anaKategoriler.sort((a, b) => a.sira - b.sira);
        siralama(anaKategoriler);
        
        return anaKategoriler;
    }

    async webHomeAnaKategoriler(req, res) {
        try {
            // Sadece ana kategorileri getir (kategori_ust_id = 0 olanlar)
            const anaKategoriler = await conMain('kategoriler')
                .where('kategori_ust_id', 0)
                .select([
                    'kategori_adi',
                    'kategori_adi_en',
                    'kategori_adi_tr',
                    'kategori_seo',
                    'kategori_ikon',
                    'kategori_resim',
                    'id'
                ])
                .orderBy('sira','asc');

            return anaKategoriler
            
        } catch (error) {
            return error;
        }
    }
}

export default new KategorilerServices;