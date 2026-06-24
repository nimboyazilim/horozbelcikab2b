import conMain from "../config/database.mjs";
import fs from 'fs';
import path from 'path';

class UrunlerServices {

    async urunlerListe(req, res) {
        try {
            const tumUrunler = await conMain('urun_ana_bilgileri as ana')
                .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                .leftJoin('urun_resimleri as resim', function () {
                    this.on('ana.id', '=', 'resim.urun_id')
                        .andOn(function () {
                            this.on('resim.varsayilan', '=', 1)
                                .orOnNull('resim.varsayilan');
                        });
                })
                .select([
                    'ana.id',
                    'ana.stok_kodu',
                    'ana.fiyat',
                    'ana.tip',
                    'alt.urun_adi',
                    'resim.resim as resim'
                ]);
            return tumUrunler;
        } catch (error) {
            return error;
        }
    }

    async getUrunById(req, res) {
        try {
            // Ana bilgileri çek
            const urunAnaBilgileri = await conMain('urun_ana_bilgileri')
                .where('id', req.params.id)
                .select('alis_fiyati', 'fiyat', 'stok_kodu', 'barkod', 'tip', 'active')
                .first();

            const kdvOrani = await conMain('urun_vergi_grup as uvg')
                .leftJoin('vergiler as v', 'uvg.vergi_id', 'v.id')
                .where('uvg.urun_id', req.params.id)
                .where('uvg.varyant_id', 0)
                .select('v.vergi_orani', 'v.id as vergi_id')
                .first() || { vergi_orani: 0, vergi_id: 0 };

            urunAnaBilgileri.kdv_orani = kdvOrani.vergi_orani;
            urunAnaBilgileri.kdv_id = kdvOrani.vergi_id;

            // Alt bilgileri çek
            const urunAltBilgileri = await conMain('urun_alt_bilgileri')
                .where('id', req.params.id)
                .select(
                    'urun_adi',
                    'urun_seo',
                    'urun_description',
                    'urun_information',
                    'urun_meta_description',
                    'urun_meta_keywords',
                    'urun_meta_title'
                )
                .first();

            // Kategori ID'lerini çek
            const kategoriler = await conMain('kategori_urun')
                .where('urun_id', req.params.id)
                .pluck('kategori_id');

            // İstenen formatta birleştir
            return {
                id: parseInt(req.params.id),
                urunAltBilgileri: urunAltBilgileri,
                urunAnaBilgileri: urunAnaBilgileri,
                kategoriler: kategoriler
            };
        } catch (error) {
            return error;
        }
    }


    async createUrun(req, res) {
        try {
            // Transaction başlat
            const result = await conMain.transaction(async trx => {
                // Önce ürün ana bilgilerini ekle ve ID'yi al
                const [insertedId] = await trx('urun_ana_bilgileri').insert({
                    ...req.body.urunAnaBilgileri
                });

                // Ürün alt bilgilerini ekle
                await trx('urun_alt_bilgileri').insert({
                    ...req.body.urunAltBilgileri
                });

                // Stok miktarı kaydını ekle
                await trx('urun_stok_miktarlari').insert({
                    urun_id: insertedId,
                    varyant_id: 0,
                    miktar: 0
                });

                return insertedId;
            });

            return {
                status: 'success',
                message: 'Kayıt başarılı',
                id: result
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateUrun(req, res) {
        try {
            const { kdv_id, kdv_orani, ...urunAnaBilgileriUpdate } = req.body.urunAnaBilgileri;
            // Transaction başlat
            await conMain.transaction(async trx => {
                // Ürün ana bilgilerini güncelle
                await trx('urun_ana_bilgileri')
                    .where('id', req.params.id)
                    .update(urunAnaBilgileriUpdate);

                // Ürün alt bilgilerini güncelle
                await trx('urun_alt_bilgileri')
                    .where('id', req.params.id)
                    .update(req.body.urunAltBilgileri);


                // ilk önce vergi grup ekle yoksa varsa güncelle

                const vergiGrup = await trx('urun_vergi_grup')
                    .where('urun_id', req.params.id)
                    .where('varyant_id', 0)
                    .first();

                if (vergiGrup) {
                    await trx('urun_vergi_grup')
                        .where('urun_id', req.params.id)
                        .where('varyant_id', 0)
                        .update({
                            vergi_id: req.body.urunAnaBilgileri.kdv_id
                        });
                } else {
                    await trx('urun_vergi_grup').insert({
                        urun_id: req.params.id,
                        varyant_id: 0,
                        vergi_id: req.body.urunAnaBilgileri.kdv_id
                    });
                }



                // Önce bu ürüne ait tüm kategori ilişkilerini sil
                await trx('kategori_urun')
                    .where('urun_id', req.params.id)
                    .delete();

                // Yeni kategori ilişkilerini ekle
                if (req.body.kategoriler && req.body.kategoriler.length > 0) {
                    const kategoriInserts = req.body.kategoriler.map(kategoriId => ({
                        kategori_id: kategoriId,
                        urun_id: req.params.id
                    }));

                    await trx('kategori_urun').insert(kategoriInserts);
                }
            });

            return {
                status: 'success',
                message: 'Güncelleme başarılı',
                id: parseInt(req.params.id)
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            };
        }
    }

    async urunMiktarGuncelle(req, res) {
        try {
            // Update the specific variant's quantity
            await conMain('urun_stok_miktarlari')
                .where('urun_id', req.params.urunId)
                .where('varyant_id', req.params.varyantId)
                .update({ miktar: req.body.miktar });

            // Check if this product has any variants
            const hasVariants = await conMain('urun_stok_miktarlari')
                .where('urun_id', req.params.urunId)
                .where('varyant_id', '>', 0)
                .first();

            // Only calculate and update total if product has variants
            if (hasVariants) {
                const variantTotal = await conMain('urun_stok_miktarlari')
                    .where('urun_id', req.params.urunId)
                    .where('varyant_id', '>', 0)
                    .sum('miktar as total')
                    .first();

                // Update main product quantity (varyant_id = 0)
                await conMain('urun_stok_miktarlari')
                    .where('urun_id', req.params.urunId)
                    .where('varyant_id', 0)
                    .update({ miktar: variantTotal.total || 0 });
            }

            return {
                status: 'success',
                message: 'Miktar güncellendi'
            };
        } catch (error) {
            throw error;
        }
    }

    async getUrunMiktar(req, res) {
        try {
            const miktar = await conMain('urun_stok_miktarlari')
                .where('urun_id', req.params.urunId)
                .where('varyant_id', req.params.varyantId)
                .select('miktar').first();
            return miktar;
        } catch (error) {
            throw error;
        }
    }


    async getUrunVaryantListe(req, res) {
        try {
            // Önce ürün varyantlarını al
            const varyantlar = await conMain('urun_varyant as uv')
                .where('uv.urun_id', req.params.id)
                .select('uv.*');

            // Her varyant için varyant gruplarını ve ilişkili ana varyant bilgilerini al
            const varyantlarWithDetails = await Promise.all(varyantlar.map(async (varyant) => {
                const varyantGruplar = await conMain('urun_varyant_grup as uvg')
                    .where('uvg.urun_varyant_id', varyant.id)
                    .join('urun_ana_varyant as uav', 'uvg.varyant_id', 'uav.id')
                    .leftJoin('urun_ana_varyant as ust', 'uav.varyant_ust_id', 'ust.id')
                    .select([
                        'uav.id as varyant_id',
                        'uav.varyant_adi',
                        'uav.varyant_ust_id',
                        'ust.varyant_adi as ust_varyant_adi'
                    ]);

                // Stok miktarını al
                const stokMiktari = await conMain('urun_stok_miktarlari')
                    .where({
                        'urun_id': req.params.id,
                        'varyant_id': varyant.id
                    })
                    .select('miktar')
                    .first();

                // Varyant resimlerini kontrol et
                const varyantResim = await conMain('urun_resimleri')
                    .where({
                        'urun_id': req.params.id,
                        'varyant_id': varyant.id
                    })
                    .first();

                // Eğer varyant resmi yoksa varsayılan ürün resmini al
                if (!varyantResim) {
                    const varsayilanResim = await conMain('urun_resimleri')
                        .where({
                            'urun_id': req.params.id,
                            'varsayilan': 1
                        })
                        .first();
                    varyant.resim = varsayilanResim ? varsayilanResim.resim : null;
                } else {
                    varyant.resim = varyantResim.resim;
                }

                // Varyant adlarını birleştir
                const varyantAdiString = varyantGruplar
                    .map(v => `${v.ust_varyant_adi} - ${v.varyant_adi}`)
                    .join(', ');

                return {
                    ...varyant,
                    varyantAdi: varyantAdiString,
                    varyantGruplar,
                    miktar: stokMiktari ? stokMiktari.miktar : 0  // Stok miktarını ekle, yoksa 0 döndür
                };
            }));

            return {
                varyantlar: varyantlarWithDetails
            };
        } catch (error) {
            console.error('Hata:', error);
            return error;
        }
    }

    async getAnaVaryantListe(req, res) {
        try {
            // Tüm varyantları tek sorguda çek
            const tumVaryantlar = await conMain('urun_ana_varyant')
                .select('*')
                .orderBy('varyant_sira');

            // Ana varyantları (varyant_ust_id = 0) ve alt varyantlarını yapılandır
            const anaVaryantlar = tumVaryantlar
                .filter(varyant => varyant.varyant_ust_id === 0)
                .map(anaVaryant => ({
                    ...anaVaryant,
                    altVaryantlar: tumVaryantlar
                        .filter(altVaryant => altVaryant.varyant_ust_id === anaVaryant.id)
                        .sort((a, b) => a.varyant_adi.localeCompare(b.varyant_adi))
                }));


            return {
                anaVaryantlar
            };
        } catch (error) {
            console.error('Hata:', error);
            return error;
        }
    }

    async createUrunVaryant(req, res) {
        try {
            // Transaction başlat
            const result = await conMain.transaction(async trx => {
                // Ürün varyant tablosuna ana bilgileri ekle
                const [varyantId] = await trx('urun_varyant').insert({
                    urun_id: req.body.urun_id,
                    stok_kodu: req.body.urun_ana_bilgiler.stok_kodu,
                    barkod: req.body.urun_ana_bilgiler.barkod,
                    alis_fiyati: req.body.urun_ana_bilgiler.alis_fiyati,
                    fiyat: req.body.urun_ana_bilgiler.fiyat
                });

                // Varyant gruplarını ekle
                const varyantGrupInserts = req.body.varyant_id.map(varyantId1 => ({
                    urun_id: req.body.urun_id,
                    urun_varyant_id: varyantId,
                    varyant_id: varyantId1
                }));

                await trx('urun_varyant_grup').insert(varyantGrupInserts);

                // Stok miktarı kaydını ekle
                await trx('urun_stok_miktarlari').insert({
                    urun_id: req.body.urun_id,
                    varyant_id: varyantId,
                    miktar: 0
                });

                return varyantId;
            });

            return {
                status: 'success',
                message: 'Varyant kaydı başarılı'
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateUrunVaryant(req, res) {
        try {
            const updateData = {
                fiyat: req.body.fiyat,
                stok_kodu: req.body.stok_kodu,
                varyant_urun_adi: req.body.varyant_urun_adi,
                barkod: req.body.barkod,
                varsayilan: req.body.varsayilan
            };

            await conMain('urun_varyant')
                .where('id', req.params.id)
                .update(updateData);


            // ilk önce vergi grup ekle yoksa varsa güncelle

            const vergiGrup = await conMain('urun_vergi_grup')
                .where('urun_id', req.body.urun_id)
                .where('varyant_id', req.params.id)
                .first();

            if (vergiGrup) {
                await conMain('urun_vergi_grup')
                    .where('urun_id', req.body.urun_id)
                    .where('varyant_id', req.params.id)
                    .update({
                        vergi_id: req.body.kdv_id
                    });
            } else {
                await conMain('urun_vergi_grup').insert({
                    urun_id: req.body.urun_id,
                    varyant_id: req.params.id,
                    vergi_id: req.body.kdv_id
                });
            }

            return {
                status: 'success',
                message: 'Varyant güncellendi'
            };
        } catch (error) {
            return error;
        }
    }

    async getUrunVaryantById(req, res) {
        try {
            // Ana bilgileri çek
            const varyant = await conMain('urun_varyant as uv')
                .leftJoin('urun_ana_bilgileri as uab', 'uv.urun_id', 'uab.id')
                .where('uv.id', req.params.id)
                .select(
                    'uv.id',
                    'uv.urun_id',
                    'uv.varyant_urun_adi',
                    'uv.alis_fiyati',
                    'uv.fiyat',
                    'uv.stok_kodu',
                    'uv.barkod',
                    'uv.varsayilan',
                    'uab.fiyat as ana_urun_fiyat'
                )
                .first();

            const kdvOrani = await conMain('urun_vergi_grup as uvg')
                .leftJoin('vergiler as v', 'uvg.vergi_id', 'v.id')
                .where('uvg.urun_id', varyant.urun_id)
                .where('uvg.varyant_id', varyant.id)
                .select('v.vergi_orani', 'v.id as vergi_id')
                .first() || { vergi_orani: 0, vergi_id: 0 };

            varyant.kdv_orani = kdvOrani.vergi_orani;
            varyant.kdv_id = kdvOrani.vergi_id;

            // Varyant gruplarını ve ilişkili varyant bilgilerini al
            const varyantGruplar = await conMain('urun_varyant_grup as uvg')
                .where('uvg.urun_varyant_id', varyant.id)
                .join('urun_ana_varyant as uav', 'uvg.varyant_id', 'uav.id')
                .leftJoin('urun_ana_varyant as ust', 'uav.varyant_ust_id', 'ust.id')
                .select([
                    'uav.id as varyant_id',
                    'uav.varyant_adi',
                    'uav.varyant_ust_id',
                    'ust.varyant_adi as ust_varyant_adi'
                ]);

            // Varyant adlarını birleştir
            const varyantAdiString = varyantGruplar
                .map(v => `${v.ust_varyant_adi} - ${v.varyant_adi}`)
                .join(', ');

            return {
                ...varyant,
                varyant_adi: varyantAdiString,
                urunAnaBilgileri: { tip: 'standart' }
            };
        } catch (error) {
            return error;
        }
    }

    async urunVaryantSil(req, res) {
        try {
            await conMain.transaction(async trx => {
                // Önce varyantın ait olduğu ürün ID'sini bulalım
                const varyant = await trx('urun_varyant')
                    .where('id', req.params.id)
                    .select('urun_id')
                    .first();

                if (!varyant) {
                    throw new Error('Varyant bulunamadı');
                }

                // Varyantı ve ilişkili kayıtları silelim
                await trx('urun_varyant').where('id', req.params.id).delete();
                await trx('urun_varyant_grup').where('urun_varyant_id', req.params.id).delete();
                await trx('urun_stok_miktarlari').where('varyant_id', req.params.id).delete();
                await trx('urun_ozel_fiyat_grup').where('varyant_id', req.params.id).delete();
                await trx('urun_vergi_grup').where('varyant_id', req.params.id).delete();

                // Ürünün kalan varyantlarını kontrol edelim
                const hasVariants = await trx('urun_stok_miktarlari')
                    .where('urun_id', varyant.urun_id)
                    .where('varyant_id', '>', 0)
                    .first();

                if (hasVariants) {
                    // Kalan varyantların toplam stok miktarını hesaplayalım
                    const variantTotal = await trx('urun_stok_miktarlari')
                        .where('urun_id', varyant.urun_id)
                        .where('varyant_id', '>', 0)
                        .sum('miktar as total')
                        .first();

                    // Ana ürünün stok miktarını güncelleyelim
                    await trx('urun_stok_miktarlari')
                        .where('urun_id', varyant.urun_id)
                        .where('varyant_id', 0)
                        .update({ miktar: variantTotal.total || 0 });
                }
            });

            return {
                status: 'success',
                message: 'Varyant silindi'
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async getUrunOzelFiyatListe(req, res) {
        try {
            // Özel fiyatları ve tanımlarını tek sorguda çek
            const ozelFiyatlar = await conMain('urun_ozel_fiyat_grup as ofg')
                .leftJoin('urun_ozel_fiyat_tanimlari as oft', 'ofg.ozel_fiyat_id', 'oft.id')
                .select([
                    'ofg.*',
                    'oft.adi as ozel_fiyat_adi'
                ])
                .where('ofg.urun_id', req.params.urunId)
                .where('ofg.varyant_id', req.params.varyantId);

            return ozelFiyatlar;
        } catch (error) {
            console.error('Hata:', error);
            return error;
        }
    }

    async createUrunOzelFiyat(req, res) {
        try {
            // Transaction başlat
            const result = await conMain.transaction(async trx => {
                // Özel fiyat grubuna ekle
                const [insertedId] = await trx('urun_ozel_fiyat_grup').insert({
                    ozel_fiyat_id: req.body.ozel_fiyat_id,
                    urun_id: req.body.urun_id,
                    varyant_id: req.body.varyant_id,
                    fiyat: req.body.fiyat
                });

                return insertedId;
            });

            return {
                status: 'success',
                message: 'Özel fiyat kaydı başarılı',
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async createUrunResim(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                throw new Error('Yüklenecek resim bulunamadı. Content-Type: ' + req.headers['content-type']);
            }

            const result = await conMain.transaction(async trx => {
                const insertPromises = req.files.map(async file => {
                    try {
                        const uploadDir = './public/uploads/products';

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

                        const [insertedId] = await trx('urun_resimleri').insert({
                            urun_id: req.body.urunId,
                            varyant_id: 0,
                            resim: dosyaYolu,
                            varsayilan: 0
                        });

                        return {
                            id: insertedId,
                            dosyaYolu: dosyaYolu
                        };
                    } catch (err) {
                        console.error('Dosya işleme hatası:', err);
                        throw err;
                    }
                });

                return await Promise.all(insertPromises);
            });

            return {
                status: 'success',
                message: 'Resimler başarıyla kaydedildi',
                kayitlar: result
            };
        } catch (error) {
            console.error('createUrunResim hatası:', error);
            throw error;
        }
    }

    async urunResimListe(req, res) {
        try {
            const urunResimleri = await conMain('urun_resimleri')
                .where('urun_id', req.params.urunId)
                .select('*');
            return urunResimleri;
        } catch (error) {
            throw error;
        }
    }

    async urunResimSil(req, res) {
        try {
            await conMain('urun_resimleri')
                .where('id', req.params.id)
                .delete();

            return {
                status: 'success',
                message: 'Resim silindi'
            };
        } catch (error) {
            throw error;
        }
    }

    async urunResimKapakGuncelle(req, res) {
        try {

            await conMain('urun_resimleri')
                .where('urun_id', req.body.urunId)
                .update({ varsayilan: 0 });

            await conMain('urun_resimleri')
                .where('id', req.body.resimId)
                .update({ varsayilan: 1 });

            return {
                status: 'success',
                message: 'Resim kapak güncellendi'
            };
        } catch (error) {
            throw error;
        }
    }

    async urunVaryantResimSec(req, res) {
        try {

            if (req.body.secim === 'iptal') {
                await conMain('urun_resimleri')
                    .where('id', req.body.resimId)
                    .update({ varyant_id: 0 });
            } else {

                await conMain('urun_resimleri')
                    .where('id', req.body.resimId)
                    .update({ varyant_id: req.body.varyantId });

            }
            return {
                status: 'success',
                message: 'Varyant resim güncellendi'
            };
        } catch (error) {
            throw error;
        }
    }

    async createUrunOzellik(req, res) {
        try {
            // Önce aynı urun_id ve ozellik_id kombinasyonunu kontrol et
            const existingRecord = await conMain('urun_ozellikleri_grup')
                .where({
                    urun_id: req.body.urun_id,
                    ozellik_id: req.body.ozellik_id
                })
                .first();

            // Eğer kayıt yoksa ekle
            if (!existingRecord) {
                const result = await conMain('urun_ozellikleri_grup').insert(req.body);
                return {
                    status: 'success',
                    message: 'Özellik kaydı başarılı'
                };
            }

            return {
                status: 'error',
                message: 'Bu özellik zaten eklenmiş'
            };
        } catch (error) {
            throw error;
        }
    }

    async getUrunOzellikListe(req, res) {
        try {
            const result = await conMain('urun_ozellikleri_grup as og')
                .leftJoin('urun_ozellikleri_tanim as ot', 'og.ozellik_id', 'ot.id')
                .leftJoin('urun_ozellikleri_tanim as ana', 'ot.ozellik_ust_id', 'ana.id')
                .where('og.urun_id', req.params.urunId)
                .select([
                    'og.*',
                    'ot.ozellik_adi',
                    'ana.ozellik_adi as ana_ozellik_adi'
                ]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getOzellikListe(req, res) {
        try {
            // Tüm özellikleri tek sorguda çek
            const tumOzellikler = await conMain('urun_ozellikleri_tanim')
                .select('*');

            // Ana özellikleri ve alt özellikleri ayrı ayrı grupla
            const anaOzellikler = tumOzellikler
                .filter(ozellik => ozellik.ozellik_ust_id === 0)
                .map(({ id, ozellik_adi }) => ({
                    id,
                    ozellik_adi
                }));

            const altOzellikler = tumOzellikler
                .filter(ozellik => ozellik.ozellik_ust_id !== 0)
                .map(({ id, ozellik_adi, ozellik_ust_id }) => ({
                    id,
                    ozellik_adi,
                    ozellik_ust_id
                }))
                .sort((a, b) => a.ozellik_sira - b.ozellik_sira);

            return {
                anaOzellikler,
                altOzellikler
            };
        } catch (error) {
            throw error;
        }
    }

    async getUrunDosyaTanimListe(req, res) {
        try {
            const result = await conMain('urun_dosya_tanim')
                .select('*');
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getUrunDosyaListe(req, res) {
        try {
            const result = await conMain('urun_dosya_grup')
                .leftJoin('urun_dosya_tanim as dt', 'urun_dosya_grup.dosya_id', 'dt.id')
                .where('urun_dosya_grup.urun_id', req.params.urunId)
                .select([
                    'urun_dosya_grup.*',
                    'dt.dosya_baslik'
                ]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async urunAnaDurumlari(req, res) {
        try {
            const result = await conMain('urun_durumlari_tanim')
                .select('*');
            return result;
        } catch (error) {
            throw error;
        }
    }

    async urunDurumGuncelle(req, res) {
        try {
            // Önce kayıt var mı kontrol et
            const existingRecord = await conMain('urun_durumlari_grup')
                .where('urun_id', req.params.urunId)
                .first();

            let result;
            if (existingRecord) {
                // Kayıt varsa güncelle
                result = await conMain('urun_durumlari_grup')
                    .where('urun_id', req.params.urunId)
                    .update({ durum_id: req.params.durumId });
            } else {
                // Kayıt yoksa yeni kayıt ekle
                result = await conMain('urun_durumlari_grup')
                    .insert({
                        urun_id: req.params.urunId,
                        durum_id: req.params.durumId
                    });
            }

            return {
                status: 'success',
                message: existingRecord ? 'Durum güncellendi' : 'Durum eklendi',
                result
            };
        } catch (error) {
            throw error;
        }
    }

    async urunDurumGrup(req, res) {
        try {
            const result = await conMain('urun_durumlari_grup')
                .where('urun_id', req.params.urunId)
                .select('durum_id')
                .first();

            if (!result) {
                return { durum_id: 0 };
            }

            return result;
        } catch (error) {
            throw error;
        }
    }

    async urunDosyaEkle(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                throw new Error('Yüklenecek dosya bulunamadı. Content-Type: ' + req.headers['content-type']);
            }

            const result = await conMain.transaction(async trx => {
                const insertPromises = req.files.map(async file => {
                    try {
                        const uploadDir = './public/uploads/files';

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

                        const [insertedId] = await trx('urun_dosya_grup').insert({
                            urun_id: req.body.urunId,
                            dosya_id: req.body.dosyaGrupId,
                            dosya_yolu: dosyaYolu,
                            dosya_adi: req.body.dosyaAdi
                        });

                        return {
                            id: insertedId,
                            dosyaYolu: dosyaYolu
                        };
                    } catch (err) {
                        console.error('Dosya işleme hatası:', err);
                        throw err;
                    }
                });

                return await Promise.all(insertPromises);
            });

            return {
                status: 'success',
                message: 'Dosya başarıyla kaydedildi',
                kayitlar: result
            };
        } catch (error) {
            console.error('createUrunResim hatası:', error);
            throw error;
        }
    }

    async urunDosyaSil(req, res) {
        try {
            await conMain('urun_dosya_grup')
                .where('id', req.params.id)
                .delete();

            return {
                status: 'success',
                message: 'Dosya silindi'
            };
        } catch (error) {
            throw error;
        }
    }


    async webgetKategoriUrunleri(req, res) {
        try {

            if (req.params.kategoriId === 'undefined') {

                let urunler;
                let varyantFiltreler = {};
                // Önce ürünleri çek
                if (req.query.filtreler !== 'undefined') {
                    urunler = await conMain('urun_ana_bilgileri as ana')
                        .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                        .leftJoin('urun_resimleri as resim', function () {
                            this.on('ana.id', '=', 'resim.urun_id')
                                .andOn(function () {
                                    this.on('resim.varsayilan', '=', 1)
                                        .orOnNull('resim.varsayilan');
                                });
                        })
                        .leftJoin('urun_varyant_grup as uvg', 'ana.id', 'uvg.urun_id')
                        .distinct([
                            'ana.id',
                            'ana.stok_kodu',
                            'ana.fiyat',
                            'ana.tip',
                            'alt.urun_adi',
                            'alt.urun_seo',
                            'resim.resim',
                        ])
                        .whereIn('uvg.varyant_id', req.query.filtreler.split(' '))
                        .limit(50)
                        .orderBy('ana.id', 'desc');

                } else {

                    urunler = await conMain('urun_ana_bilgileri as ana')
                        .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                        .leftJoin('urun_resimleri as resim', function () {
                            this.on('ana.id', '=', 'resim.urun_id')
                                .andOn(function () {
                                    this.on('resim.varsayilan', '=', 1)
                                        .orOnNull('resim.varsayilan');
                                });
                        })
                        .select([
                            'ana.id',
                            'ana.stok_kodu',
                            'ana.fiyat',
                            'ana.tip',
                            'alt.urun_adi',
                            'alt.urun_seo',
                            'resim.resim',
                        ])
                        .limit(50)
                        .orderBy('ana.id', 'desc');


                }

                // Ürünlerin varyant bilgilerini çek
                const urunIds = urunler.map(urun => urun.id);
                const varyantBilgileri = await conMain('urun_varyant_grup as uvg')
                    .whereIn('uvg.urun_id', urunIds)
                    .join('urun_ana_varyant as alt', 'uvg.varyant_id', 'alt.id')
                    .leftJoin('urun_ana_varyant as ust', 'alt.varyant_ust_id', 'ust.id')
                    .select([
                        'uvg.urun_id',
                        'alt.id as varyant_id',
                        'alt.varyant_adi',
                        'alt.varyant_ust_id',
                        'ust.id as ust_varyant_id',
                        'ust.varyant_adi as ust_varyant_adi'
                    ]);


                // Varyant filtrelerini oluştur
                varyantBilgileri.forEach(varyant => {
                    if (varyant.ust_varyant_adi) {
                        if (!varyantFiltreler[varyant.ust_varyant_adi]) {
                            varyantFiltreler[varyant.ust_varyant_adi] = new Set();
                        }
                        varyantFiltreler[varyant.ust_varyant_adi].add(JSON.stringify({
                            id: varyant.varyant_id,
                            ad: varyant.varyant_adi
                        }));
                    }
                });

                // Set'leri Array'e çevir
                Object.keys(varyantFiltreler).forEach(key => {
                    varyantFiltreler[key] = Array.from(varyantFiltreler[key]).map(item => JSON.parse(item));
                });

                // Ürünlere varyant bilgilerini ekle
                urunler = urunler.map(urun => ({
                    ...urun,
                    varyantlar: varyantBilgileri
                        .filter(v => v.urun_id === urun.id)
                        .map(v => ({
                            varyant_id: v.varyant_id,
                            varyant_adi: v.varyant_adi,
                            ust_varyant_adi: v.ust_varyant_adi
                        }))
                }));



                return {
                    urunler,
                    filtreler: varyantFiltreler
                }

            }


            let urunler;
            let varyantFiltreler = {};

            const kategori = await conMain('kategoriler')
                .where('kategori_seo', req.params.kategoriId)
                .select('id')
                .first();

            if (!kategori) {
                throw new Error('Kategori bulunamadı');
            }



            if (req.query.filtreler !== 'undefined') {
                urunler = await conMain('kategori_urun as ku')
                    .join('urun_ana_bilgileri as ana', 'ku.urun_id', 'ana.id')
                    .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                    .leftJoin('urun_varyant_grup as uvg', 'ana.id', 'uvg.urun_id')
                    .leftJoin('urun_resimleri as resim', function () {
                        this.on('ana.id', '=', 'resim.urun_id')
                            .andOn(function () {
                                this.on('resim.varsayilan', '=', 1)
                                    .orOnNull('resim.varsayilan');
                            });
                    })
                    .where('ku.kategori_id', kategori.id)
                    .whereIn('uvg.varyant_id', req.query.filtreler.split(' '))
                    .distinct([
                        'ana.id',
                        'ana.stok_kodu',
                        'ana.fiyat',
                        'ana.tip',
                        'alt.urun_adi',
                        'alt.urun_seo',
                        'resim.resim'
                    ]);
            } else {
                urunler = await conMain('kategori_urun as ku')
                    .join('urun_ana_bilgileri as ana', 'ku.urun_id', 'ana.id')
                    .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                    .leftJoin('urun_resimleri as resim', function () {
                        this.on('ana.id', '=', 'resim.urun_id')
                            .andOn(function () {
                                this.on('resim.varsayilan', '=', 1)
                                    .orOnNull('resim.varsayilan');
                            });
                    })
                    .where('ku.kategori_id', kategori.id)
                    .select([
                        'ana.id',
                        'ana.stok_kodu',
                        'ana.fiyat',
                        'ana.tip',
                        'alt.urun_adi',
                        'alt.urun_seo',
                        'resim.resim'
                    ]);

            }

            // Ürünlerin varyant bilgilerini çek
            const urunIds = urunler.map(urun => urun.id);
            const varyantBilgileri = await conMain('urun_varyant_grup as uvg')
                .whereIn('uvg.urun_id', urunIds)
                .join('urun_ana_varyant as alt', 'uvg.varyant_id', 'alt.id')
                .leftJoin('urun_ana_varyant as ust', 'alt.varyant_ust_id', 'ust.id')
                .select([
                    'uvg.urun_id',
                    'alt.id as varyant_id',
                    'alt.varyant_adi',
                    'alt.varyant_ust_id',
                    'ust.id as ust_varyant_id',
                    'ust.varyant_adi as ust_varyant_adi'
                ]);


            // Varyant filtrelerini oluştur
            varyantBilgileri.forEach(varyant => {
                if (varyant.ust_varyant_adi) {
                    if (!varyantFiltreler[varyant.ust_varyant_adi]) {
                        varyantFiltreler[varyant.ust_varyant_adi] = new Set();
                    }
                    varyantFiltreler[varyant.ust_varyant_adi].add(JSON.stringify({
                        id: varyant.varyant_id,
                        ad: varyant.varyant_adi
                    }));
                }
            });

            // Set'leri Array'e çevir
            Object.keys(varyantFiltreler).forEach(key => {
                varyantFiltreler[key] = Array.from(varyantFiltreler[key]).map(item => JSON.parse(item));
            });

            // Ürünlere varyant bilgilerini ekle
            urunler = urunler.map(urun => ({
                ...urun,
                varyantlar: varyantBilgileri
                    .filter(v => v.urun_id === urun.id)
                    .map(v => ({
                        varyant_id: v.varyant_id,
                        varyant_adi: v.varyant_adi,
                        ust_varyant_adi: v.ust_varyant_adi
                    }))
            }));

            // console.log(varyantFiltreler);


            return {
                urunler,
                filtreler: varyantFiltreler
            }
        } catch (error) {
            throw error;
        }
    }

    async b2bgetKategoriUrunleri(req, res) {
        try {
            //console.log(req.query);
            //console.log(req.params);

            if (req.params.kategoriId === 'undefined') {

                let urunler;
                let varyantFiltreler = {};
                // Önce ürünleri çek
                if (req.query.filtreler !== 'undefined') {
                    urunler = await conMain('urun_ana_bilgileri as ana')
                        .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                        .leftJoin('urun_resimleri as resim', function () {
                            this.on('ana.id', '=', 'resim.urun_id')
                                .andOn(function () {
                                    this.on('resim.varsayilan', '=', 1)
                                        .orOnNull('resim.varsayilan');
                                });
                        })
                        .leftJoin('urun_varyant_grup as uvg', 'ana.id', 'uvg.urun_id')
                        .distinct([
                            'ana.id',
                            'ana.stok_kodu',
                            'ana.fiyat',
                            'ana.tip',
                            'alt.urun_adi',
                            'alt.urun_seo',
                            'resim.resim',
                        ])
                        .whereIn('uvg.varyant_id', req.query.filtreler.split(' '))
                        .where('ana.active', 1)
                        .limit(50)
                        .orderBy('ana.id', 'desc');

                } else {

                    urunler = await conMain('urun_ana_bilgileri as ana')
                        .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                        .leftJoin('urun_resimleri as resim', function () {
                            this.on('ana.id', '=', 'resim.urun_id')
                                .andOn(function () {
                                    this.on('resim.varsayilan', '=', 1)
                                        .orOnNull('resim.varsayilan');
                                });
                        })
                        .select([
                            'ana.id',
                            'ana.stok_kodu',
                            'ana.fiyat',
                            'ana.tip',
                            'alt.urun_adi',
                            'alt.urun_seo',
                            'resim.resim',
                        ])
                        .where('ana.active', 1)
                        .limit(50)
                        .orderBy('ana.id', 'desc');


                }

                // Ürünlerin varyant bilgilerini çek
                const urunIds = urunler.map(urun => urun.id);
                const varyantBilgileri = await conMain('urun_varyant_grup as uvg')
                    .whereIn('uvg.urun_id', urunIds)
                    .join('urun_ana_varyant as alt', 'uvg.varyant_id', 'alt.id')
                    .leftJoin('urun_ana_varyant as ust', 'alt.varyant_ust_id', 'ust.id')
                    .select([
                        'uvg.urun_id',
                        'alt.id as varyant_id',
                        'alt.varyant_adi',
                        'alt.varyant_ust_id',
                        'ust.id as ust_varyant_id',
                        'ust.varyant_adi as ust_varyant_adi'
                    ]);


                // Varyant filtrelerini oluştur
                varyantBilgileri.forEach(varyant => {
                    if (varyant.ust_varyant_adi) {
                        if (!varyantFiltreler[varyant.ust_varyant_adi]) {
                            varyantFiltreler[varyant.ust_varyant_adi] = new Set();
                        }
                        varyantFiltreler[varyant.ust_varyant_adi].add(JSON.stringify({
                            id: varyant.varyant_id,
                            ad: varyant.varyant_adi
                        }));
                    }
                });

                // Set'leri Array'e çevir
                Object.keys(varyantFiltreler).forEach(key => {
                    varyantFiltreler[key] = Array.from(varyantFiltreler[key])
                        .map(item => JSON.parse(item))
                        .sort((a, b) => {
                            // Sayısal değerleri çıkar (örn: "5W" -> "5")
                            const numA = parseInt(a.ad.match(/\d+/) || [0]);
                            const numB = parseInt(b.ad.match(/\d+/) || [0]);

                            // Eğer her ikisi de sayısal değer içeriyorsa, sayısal olarak karşılaştır
                            if (numA && numB) {
                                return numA - numB;
                            }
                            // Aksi halde normal string karşılaştırması yap
                            return a.ad.localeCompare(b.ad);
                        });
                });

                // Ürünlere varyant bilgilerini ekle
                urunler = urunler.map(urun => ({
                    ...urun,
                    varyantlar: varyantBilgileri
                        .filter(v => v.urun_id === urun.id)
                        .map(v => ({
                            varyant_id: v.varyant_id,
                            varyant_adi: v.varyant_adi,
                            ust_varyant_adi: v.ust_varyant_adi
                        }))
                }));

                //console.log(varyantFiltreler);


                return {
                    urunler,
                    filtreler: varyantFiltreler
                }

            }


            let urunler;
            let varyantFiltreler = {};

            const kategori = await conMain('kategoriler')
                .where('kategori_seo', req.params.kategoriId)
                .select('id')
                .first();

            if (!kategori) {
                throw new Error('Kategori bulunamadı');
            }



            if (req.query.filtreler !== 'undefined') {
                urunler = await conMain('kategori_urun as ku')
                    .join('urun_ana_bilgileri as ana', 'ku.urun_id', 'ana.id')
                    .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                    .leftJoin('urun_varyant_grup as uvg', 'ana.id', 'uvg.urun_id')
                    .leftJoin('urun_resimleri as resim', function () {
                        this.on('ana.id', '=', 'resim.urun_id')
                            .andOn(function () {
                                this.on('resim.varsayilan', '=', 1)
                                    .orOnNull('resim.varsayilan');
                            });
                    })
                    .where('ku.kategori_id', kategori.id)
                    .whereIn('uvg.varyant_id', req.query.filtreler.split(' '))
                    .where('ana.active', 1)
                    .distinct([
                        'ana.id',
                        'ana.stok_kodu',
                        'ana.fiyat',
                        'ana.tip',
                        'alt.urun_adi',
                        'alt.urun_seo',
                        'resim.resim'
                    ]);
            } else {
                urunler = await conMain('kategori_urun as ku')
                    .join('urun_ana_bilgileri as ana', 'ku.urun_id', 'ana.id')
                    .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                    .leftJoin('urun_resimleri as resim', function () {
                        this.on('ana.id', '=', 'resim.urun_id')
                            .andOn(function () {
                                this.on('resim.varsayilan', '=', 1)
                                    .orOnNull('resim.varsayilan');
                            });
                    })
                    .where('ku.kategori_id', kategori.id)
                    .where('ana.active', 1)
                    .select([
                        'ana.id',
                        'ana.stok_kodu',
                        'ana.fiyat',
                        'ana.tip',
                        'alt.urun_adi',
                        'alt.urun_seo',
                        'resim.resim'
                    ]);

            }

            // Ürünlerin varyant bilgilerini çek
            const urunIds = urunler.map(urun => urun.id);
            const varyantBilgileri = await conMain('urun_varyant_grup as uvg')
                .whereIn('uvg.urun_id', urunIds)
                .join('urun_ana_varyant as alt', 'uvg.varyant_id', 'alt.id')
                .leftJoin('urun_ana_varyant as ust', 'alt.varyant_ust_id', 'ust.id')
                .select([
                    'uvg.urun_id',
                    'alt.id as varyant_id',
                    'alt.varyant_adi',
                    'alt.varyant_ust_id',
                    'ust.id as ust_varyant_id',
                    'ust.varyant_adi as ust_varyant_adi'
                ]);


            // Varyant filtrelerini oluştur
            varyantBilgileri.forEach(varyant => {
                if (varyant.ust_varyant_adi) {
                    if (!varyantFiltreler[varyant.ust_varyant_adi]) {
                        varyantFiltreler[varyant.ust_varyant_adi] = new Set();
                    }
                    varyantFiltreler[varyant.ust_varyant_adi].add(JSON.stringify({
                        id: varyant.varyant_id,
                        ad: varyant.varyant_adi
                    }));
                }
            });

            // Set'leri Array'e çevir
            Object.keys(varyantFiltreler).forEach(key => {
                varyantFiltreler[key] = Array.from(varyantFiltreler[key]).map(item => JSON.parse(item));
            });

            // Ürünlere varyant bilgilerini ekle
            urunler = urunler.map(urun => ({
                ...urun,
                varyantlar: varyantBilgileri
                    .filter(v => v.urun_id === urun.id)
                    .map(v => ({
                        varyant_id: v.varyant_id,
                        varyant_adi: v.varyant_adi,
                        ust_varyant_adi: v.ust_varyant_adi
                    }))
            }));

            // console.log(varyantFiltreler);


            return {
                urunler,
                filtreler: varyantFiltreler
            }
        } catch (error) {
            throw error;
        }
    }

    async b2bgetUrunArama(req, res) {
        try {
            // Ana ürünleri ve varyantları ayrı ayrı arayıp birleştireceğiz
            const mainProductQuery = conMain('urun_ana_bilgileri as ana')
                .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                .leftJoin('urun_resimleri as resim', function () {
                    this.on('ana.id', '=', 'resim.urun_id')
                        .andOn(function () {
                            this.on('resim.varsayilan', '=', 1)
                                .orOnNull('resim.varsayilan');
                        });
                })
                .where(function () {
                    this.where('alt.urun_adi', 'like', '%' + req.params.arama + '%')
                        .orWhere('ana.stok_kodu', 'like', '%' + req.params.arama + '%');
                })
                .where('ana.active', 1)
                .select([
                    'ana.id',
                    'ana.stok_kodu',
                    'ana.fiyat',
                    'ana.tip',
                    'alt.urun_adi',
                    'alt.urun_seo',
                    'resim.resim'
                ]);

            // Varyantlarda eşleşen ürünleri bul
            const variantProductQuery = conMain('urun_varyant as uv')
                .join('urun_ana_bilgileri as ana', 'uv.urun_id', 'ana.id')
                .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                .leftJoin('urun_resimleri as resim', function () {
                    this.on('ana.id', '=', 'resim.urun_id')
                        .andOn(function () {
                            this.on('resim.varsayilan', '=', 1)
                                .orOnNull('resim.varsayilan');
                        });
                })
                .where(function () {
                    this.where('uv.varyant_urun_adi', 'like', '%' + req.params.arama + '%')
                        .orWhere('uv.stok_kodu', 'like', '%' + req.params.arama + '%');
                })
                .where('ana.active', 1)
                .select([
                    'ana.id',
                    'ana.stok_kodu',
                    'ana.fiyat',
                    'ana.tip',
                    'alt.urun_adi',
                    'alt.urun_seo',
                    'resim.resim'
                ]);

            // İki sorguyu birleştir ve tekrar eden kayıtları filtrele
            const combinedQuery = mainProductQuery.union(variantProductQuery);

            const urunler = await combinedQuery.orderBy('id', 'desc');

            const kategori = await conMain('kategoriler')
                .where(function () {
                    this.where('kategori_adi', 'like', '%' + req.params.arama + '%')
                        .orWhere('kategori_adi_en', 'like', '%' + req.params.arama + '%')
                        .orWhere('kategori_adi_tr', 'like', '%' + req.params.arama + '%');
                })
                .select('id', 'kategori_adi', 'kategori_adi_en', 'kategori_adi_tr', 'kategori_seo')

            // console.log(kategori);

            return {
                urunler,
                kategori
            };

        } catch (error) {
            throw error;
        }
    }

    async webgetUrunArama(req, res) {
        try {
            // Ana ürünleri ve varyantları ayrı ayrı arayıp birleştireceğiz
            const mainProductQuery = conMain('urun_ana_bilgileri as ana')
                .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                .leftJoin('urun_resimleri as resim', function () {
                    this.on('ana.id', '=', 'resim.urun_id')
                        .andOn(function () {
                            this.on('resim.varsayilan', '=', 1)
                                .orOnNull('resim.varsayilan');
                        });
                })
                .where(function () {
                    this.where('alt.urun_adi', 'like', '%' + req.params.arama + '%')
                        .orWhere('ana.stok_kodu', 'like', '%' + req.params.arama + '%');
                })
                .where('ana.active', 1)
                .select([
                    'ana.id',
                    'ana.stok_kodu',
                    'ana.fiyat',
                    'ana.tip',
                    'alt.urun_adi',
                    'alt.urun_seo',
                    'resim.resim'
                ]);

            // Varyantlarda eşleşen ürünleri bul
            const variantProductQuery = conMain('urun_varyant as uv')
                .join('urun_ana_bilgileri as ana', 'uv.urun_id', 'ana.id')
                .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                .leftJoin('urun_resimleri as resim', function () {
                    this.on('ana.id', '=', 'resim.urun_id')
                        .andOn(function () {
                            this.on('resim.varsayilan', '=', 1)
                                .orOnNull('resim.varsayilan');
                        });
                })
                .where(function () {
                    this.where('uv.varyant_urun_adi', 'like', '%' + req.params.arama + '%')
                        .orWhere('uv.stok_kodu', 'like', '%' + req.params.arama + '%');
                })
                .where('ana.active', 1)
                .select([
                    'ana.id',
                    'ana.stok_kodu',
                    'ana.fiyat',
                    'ana.tip',
                    'alt.urun_adi',
                    'alt.urun_seo',
                    'resim.resim'
                ]);

            // İki sorguyu birleştir ve tekrar eden kayıtları filtrele
            const combinedQuery = mainProductQuery.union(variantProductQuery);

            const urunler = await combinedQuery.orderBy('id', 'desc');

            const kategori = await conMain('kategoriler')
                .where(function () {
                    this.where('kategori_adi', 'like', '%' + req.params.arama + '%')
                        .orWhere('kategori_adi_en', 'like', '%' + req.params.arama + '%')
                        .orWhere('kategori_adi_tr', 'like', '%' + req.params.arama + '%');
                })
                .select('id', 'kategori_adi', 'kategori_adi_en', 'kategori_adi_tr', 'kategori_seo')

            // console.log(kategori);

            return {
                urunler,
                kategori
            };

        } catch (error) {
            throw error;
        }
    }

    async webgetKategoriYeniUrunler(req, res) {
        try {
            //  console.log(req.query);
            let urunler;
            let varyantFiltreler = {};

            if (req.query.filtreler !== 'undefined') {
                urunler = await conMain('urun_ana_bilgileri as ana')
                    .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                    .leftJoin('urun_varyant_grup as uvg', 'ana.id', 'uvg.urun_id')
                    .leftJoin('urun_resimleri as resim', function () {
                        this.on('ana.id', '=', 'resim.urun_id')
                            .andOn(function () {
                                this.on('resim.varsayilan', '=', 1)
                                    .orOnNull('resim.varsayilan');
                            });
                    })
                    .join('urun_durumlari_grup as dg', 'ana.id', 'dg.urun_id')
                    .where('dg.durum_id', 1)
                    .whereIn('uvg.varyant_id', req.query.filtreler.split(' '))
                    .where('ana.active', 1)
                    .distinct([
                        'ana.id',
                        'ana.stok_kodu',
                        'ana.fiyat',
                        'ana.tip',
                        'alt.urun_adi',
                        'alt.urun_seo',
                        'resim.resim'
                    ])
                    .orderBy('ana.id', 'desc');
            } else {
                urunler = await conMain('urun_ana_bilgileri as ana')
                    .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                    .leftJoin('urun_resimleri as resim', function () {
                        this.on('ana.id', '=', 'resim.urun_id')
                            .andOn(function () {
                                this.on('resim.varsayilan', '=', 1)
                                    .orOnNull('resim.varsayilan');
                            });
                    })
                    .join('urun_durumlari_grup as dg', 'ana.id', 'dg.urun_id')
                    .where('dg.durum_id', 1)
                    .where('ana.active', 1)
                    .select([
                        'ana.id',
                        'ana.stok_kodu',
                        'ana.fiyat',
                        'ana.tip',
                        'alt.urun_adi',
                        'alt.urun_seo',
                        'resim.resim'
                    ])
                    .orderBy('ana.id', 'desc');
            }
            // Ürünlerin varyant bilgilerini çek
            const urunIds = urunler.map(urun => urun.id);
            const varyantBilgileri = await conMain('urun_varyant_grup as uvg')
                .whereIn('uvg.urun_id', urunIds)
                .join('urun_ana_varyant as alt', 'uvg.varyant_id', 'alt.id')
                .leftJoin('urun_ana_varyant as ust', 'alt.varyant_ust_id', 'ust.id')
                .select([
                    'uvg.urun_id',
                    'alt.id as varyant_id',
                    'alt.varyant_adi',
                    'alt.varyant_ust_id',
                    'ust.id as ust_varyant_id',
                    'ust.varyant_adi as ust_varyant_adi'
                ]);


            // Varyant filtrelerini oluştur
            varyantBilgileri.forEach(varyant => {
                if (varyant.ust_varyant_adi) {
                    if (!varyantFiltreler[varyant.ust_varyant_adi]) {
                        varyantFiltreler[varyant.ust_varyant_adi] = new Set();
                    }
                    varyantFiltreler[varyant.ust_varyant_adi].add(JSON.stringify({
                        id: varyant.varyant_id,
                        ad: varyant.varyant_adi
                    }));
                }
            });

            // Set'leri Array'e çevir
            Object.keys(varyantFiltreler).forEach(key => {
                varyantFiltreler[key] = Array.from(varyantFiltreler[key]).map(item => JSON.parse(item));
            });

            // Ürünlere varyant bilgilerini ekle
            urunler = urunler.map(urun => ({
                ...urun,
                varyantlar: varyantBilgileri
                    .filter(v => v.urun_id === urun.id)
                    .map(v => ({
                        varyant_id: v.varyant_id,
                        varyant_adi: v.varyant_adi,
                        ust_varyant_adi: v.ust_varyant_adi
                    }))
            }));

            // console.log(varyantFiltreler);

            return {
                urunler,
                filtreler: varyantFiltreler
            }

        } catch (error) {
            throw error;
        }
    }

    async webgetKategoriOutletUrunler(req, res) {
        try {
            //  console.log(req.query);
            let urunler;
            let varyantFiltreler = {};

            if (req.query.filtreler !== 'undefined') {
                urunler = await conMain('urun_ana_bilgileri as ana')
                    .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                    .leftJoin('urun_varyant_grup as uvg', 'ana.id', 'uvg.urun_id')
                    .leftJoin('urun_resimleri as resim', function () {
                        this.on('ana.id', '=', 'resim.urun_id')
                            .andOn(function () {
                                this.on('resim.varsayilan', '=', 1)
                                    .orOnNull('resim.varsayilan');
                            });
                    })
                    .join('urun_durumlari_grup as dg', 'ana.id', 'dg.urun_id')
                    .where('dg.durum_id', 5)
                    .whereIn('uvg.varyant_id', req.query.filtreler.split(' '))
                    .where('ana.active', 1)
                    .distinct([
                        'ana.id',
                        'ana.stok_kodu',
                        'ana.fiyat',
                        'ana.tip',
                        'alt.urun_adi',
                        'alt.urun_seo',
                        'resim.resim'
                    ])
                    .orderBy('ana.id', 'desc');
            } else {
                urunler = await conMain('urun_ana_bilgileri as ana')
                    .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                    .leftJoin('urun_resimleri as resim', function () {
                        this.on('ana.id', '=', 'resim.urun_id')
                            .andOn(function () {
                                this.on('resim.varsayilan', '=', 1)
                                    .orOnNull('resim.varsayilan');
                            });
                    })
                    .join('urun_durumlari_grup as dg', 'ana.id', 'dg.urun_id')
                    .where('dg.durum_id', 5)
                    .where('ana.active', 1)
                    .select([
                        'ana.id',
                        'ana.stok_kodu',
                        'ana.fiyat',
                        'ana.tip',
                        'alt.urun_adi',
                        'alt.urun_seo',
                        'resim.resim'
                    ])
                    .orderBy('ana.id', 'desc');
            }
            // Ürünlerin varyant bilgilerini çek
            const urunIds = urunler.map(urun => urun.id);
            const varyantBilgileri = await conMain('urun_varyant_grup as uvg')
                .whereIn('uvg.urun_id', urunIds)
                .join('urun_ana_varyant as alt', 'uvg.varyant_id', 'alt.id')
                .leftJoin('urun_ana_varyant as ust', 'alt.varyant_ust_id', 'ust.id')
                .select([
                    'uvg.urun_id',
                    'alt.id as varyant_id',
                    'alt.varyant_adi',
                    'alt.varyant_ust_id',
                    'ust.id as ust_varyant_id',
                    'ust.varyant_adi as ust_varyant_adi'
                ]);


            // Varyant filtrelerini oluştur
            varyantBilgileri.forEach(varyant => {
                if (varyant.ust_varyant_adi) {
                    if (!varyantFiltreler[varyant.ust_varyant_adi]) {
                        varyantFiltreler[varyant.ust_varyant_adi] = new Set();
                    }
                    varyantFiltreler[varyant.ust_varyant_adi].add(JSON.stringify({
                        id: varyant.varyant_id,
                        ad: varyant.varyant_adi
                    }));
                }
            });

            // Set'leri Array'e çevir
            Object.keys(varyantFiltreler).forEach(key => {
                varyantFiltreler[key] = Array.from(varyantFiltreler[key]).map(item => JSON.parse(item));
            });

            // Ürünlere varyant bilgilerini ekle
            urunler = urunler.map(urun => ({
                ...urun,
                varyantlar: varyantBilgileri
                    .filter(v => v.urun_id === urun.id)
                    .map(v => ({
                        varyant_id: v.varyant_id,
                        varyant_adi: v.varyant_adi,
                        ust_varyant_adi: v.ust_varyant_adi
                    }))
            }));

            // console.log(varyantFiltreler);

            return {
                urunler,
                filtreler: varyantFiltreler
            }

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async webUrunDetay(req, res) {
        try {
            // Ana ve alt bilgileri birlikte çek
            const urunDetay = await conMain('urun_alt_bilgileri as alt')
                .join('urun_ana_bilgileri as ana', 'alt.id', 'ana.id')
                .where('alt.urun_seo', req.params.urunId)
                .select([
                    'ana.id',
                    'ana.stok_kodu',
                    'ana.fiyat',
                    'ana.tip',
                    'alt.*'
                ])
                .first();

            if (!urunDetay) {
                throw new Error('Ürün bulunamadı');
            }

            // Ürün resimlerini çek
            const urunResimleri = await conMain('urun_resimleri')
                .where('urun_id', urunDetay.id)
                .select('*')
                .orderBy('varsayilan', 'desc');

            // Ürün dosyalarını çek
            const urunDosyalari = await conMain('urun_dosya_grup as dg')
                .leftJoin('urun_dosya_tanim as dt', 'dg.dosya_id', 'dt.id')
                .where('dg.urun_id', urunDetay.id)
                .select([
                    'dg.id',
                    'dg.dosya_yolu',
                    'dg.dosya_adi',
                    'dt.dosya_baslik',
                    'dt.id as dosya_tanim_id'
                ]);

            // Ürünün kategorilerini bul
            const kategoriIliskileri = await conMain('kategori_urun')
                .where('urun_id', urunDetay.id)
                .select('kategori_id');

            // Breadcrumb için kategori ağacını oluştur
            let breadcrumb = [];
            for (const kategoriIliski of kategoriIliskileri) {
                let currentKategori = await conMain('kategoriler')
                    .where('id', kategoriIliski.kategori_id)
                    .select('*')
                    .first();

                const kategoriBreadcrumb = [];
                while (currentKategori) {
                    kategoriBreadcrumb.unshift({
                        id: currentKategori.id,
                        title: currentKategori.kategori_adi,
                        title_en: currentKategori.kategori_adi_en,
                        title_tr: currentKategori.kategori_adi_tr,
                        href: `/products/${currentKategori.kategori_seo}`
                    });

                    if (currentKategori.kategori_ust_id === 0) break;

                    currentKategori = await conMain('kategoriler')
                        .where('id', currentKategori.kategori_ust_id)
                        .select('*')
                        .first();
                }

                // Her kategori zincirini ana breadcrumb array'ine ekle
                breadcrumb = [...kategoriBreadcrumb];  // İç içe array yerine tek array olarak al
                break; // İlk kategori zincirini kullan
            }

            // Ürün özelliklerini çek
            const urunOzellikleri = await conMain('urun_ozellikleri_grup as og')
                .leftJoin('urun_ozellikleri_tanim as ot', 'og.ozellik_id', 'ot.id')
                .leftJoin('urun_ozellikleri_tanim as ana', 'ot.ozellik_ust_id', 'ana.id')
                .where('og.urun_id', urunDetay.id)
                .select([
                    'og.*',
                    'ot.ozellik_adi',
                    'ana.ozellik_adi as ana_ozellik_adi'
                ]);

            // Önce ürünün tüm varyant gruplarını ve ana varyant bilgilerini çekelim
            const varyantGruplar = await conMain('urun_varyant_grup as uvg')
                .join('urun_varyant as uv', 'uvg.urun_varyant_id', 'uv.id')
                .join('urun_ana_varyant as uav', 'uvg.varyant_id', 'uav.id')
                .leftJoin('urun_ana_varyant as ust', 'uav.varyant_ust_id', 'ust.id')
                .where('uv.urun_id', urunDetay.id)
                .select([
                    'uv.id as varyant_id',
                    'uv.stok_kodu',
                    'uv.barkod',
                    'uv.fiyat',
                    'uv.varsayilan',
                    'uav.id as alt_varyant_id',
                    'uav.varyant_adi as alt_varyant_adi',
                    'uav.varyant_ust_id',
                    'ust.id as ust_varyant_id',
                    'ust.varyant_adi as ust_varyant_adi',
                    'ust.varyant_sira'
                ])
                .orderBy('ust.varyant_sira');

            // Varyantları üst gruplara göre organize edelim
            const varyantGruplari = {};
            const varyantlar = {};
            const kombinasyonlar = {};

            varyantGruplar.forEach(item => {
                // Üst varyant grubu oluştur
                if (!varyantGruplari[item.ust_varyant_id]) {
                    varyantGruplari[item.ust_varyant_id] = {
                        id: item.ust_varyant_id,
                        adi: item.ust_varyant_adi,
                        sira: item.varyant_sira,
                        altVaryantlar: new Set()
                    };
                }

                // Alt varyantı ekle
                varyantGruplari[item.ust_varyant_id].altVaryantlar.add(JSON.stringify({
                    id: item.alt_varyant_id,
                    adi: item.alt_varyant_adi
                }));

                // Varyant detaylarını sakla
                if (!kombinasyonlar[item.varyant_id]) {
                    kombinasyonlar[item.varyant_id] = {
                        id: item.varyant_id,
                        stok_kodu: item.stok_kodu,
                        barkod: item.barkod,
                        fiyat: item.fiyat,
                        varsayilan: item.varsayilan,
                        kombinasyon: {}
                    };
                }
                kombinasyonlar[item.varyant_id].kombinasyon[item.ust_varyant_id] = {
                    id: item.alt_varyant_id,
                    adi: item.alt_varyant_adi
                };
            });

            // Set'leri normal array'e çevir ve sırala
            const formatlanmisVaryantGruplari = Object.values(varyantGruplari)
                .sort((a, b) => a.sira - b.sira)
                .map(grup => ({
                    ...grup,
                    altVaryantlar: Array.from(grup.altVaryantlar).map(item => JSON.parse(item))
                        .sort((a, b) => {
                            // Sayısal değerleri çıkar (örn: "5W" -> "5")
                            const numA = parseInt(a.adi.match(/\d+/) || [0]);
                            const numB = parseInt(b.adi.match(/\d+/) || [0]);

                            // Eğer her ikisi de sayısal değer içeriyorsa, sayısal olarak karşılaştır
                            if (numA && numB) {
                                return numA - numB;
                            }
                            // Aksi halde normal string karşılaştırması yap
                            return a.adi.localeCompare(b.adi);
                        })
                }));

            // Stok miktarlarını çek
            const stokMiktarlari = await conMain('urun_stok_miktarlari')
                .where('urun_id', urunDetay.id)
                .whereNot('varyant_id', 0)
                .select('varyant_id', 'miktar');

            // Stok miktarlarını kombinasyonlara ekle
            stokMiktarlari.forEach(stok => {
                if (kombinasyonlar[stok.varyant_id]) {
                    kombinasyonlar[stok.varyant_id].stok = stok.miktar;
                }
            });

            return {
                urunDetay,
                resimler: urunResimleri,
                dosyalar: urunDosyalari,
                breadcrumbs: breadcrumb,
                ozellikler: urunOzellikleri,
                varyantGruplari: formatlanmisVaryantGruplari,
                kombinasyonlar: Object.values(kombinasyonlar)
            };

        } catch (error) {
            throw error;
        }
    }

    async b2bUrunDetay(req, res) {
        try {
            const iskonto_yuzde = req.locals.user.iskonto_yuzde;
            const fiyat_grup_id = req.locals.user.fiyat_grup_id;

            // Ana ve alt bilgileri birlikte çek
            const urunDetay = await conMain('urun_alt_bilgileri as alt')
                .join('urun_ana_bilgileri as ana', 'alt.id', 'ana.id')
                .where('alt.urun_seo', req.params.urunId)
                .select([
                    'ana.id',
                    'ana.stok_kodu',
                    'ana.fiyat',
                    'ana.tip',
                    'alt.*'
                ])
                .first();

            const vergiler = await conMain('vergiler as v')
                .leftJoin('urun_vergi_grup as uvg', 'v.id', 'uvg.vergi_id')
                .where('uvg.urun_id', urunDetay.id)
                .where('uvg.varyant_id', 0)
                .select('v.vergi_orani', 'v.vergi_adi').first() || { vergi_orani: 0 };


            const ozelFiyat = await conMain('urun_ozel_fiyat_grup')
                .where('urun_id', urunDetay.id)
                .where('varyant_id', 0)
                .where('ozel_fiyat_id', fiyat_grup_id)
                .select('fiyat').first();

            urunDetay.kdvsiz_fiyat = ozelFiyat
                ? ozelFiyat.fiyat
                : urunDetay.fiyat;

            urunDetay.indirimli_fiyat = iskonto_yuzde > 0
                ? ozelFiyat
                    ? (ozelFiyat.fiyat * (1 - iskonto_yuzde / 100)) * (1 + vergiler.vergi_orani / 100)
                    : (urunDetay.fiyat * (1 - iskonto_yuzde / 100)) * (1 + vergiler.vergi_orani / 100)
                : 0;

            urunDetay.fiyat = ozelFiyat
                ? (ozelFiyat.fiyat * (1 + vergiler.vergi_orani / 100))
                : (urunDetay.fiyat * (1 + vergiler.vergi_orani / 100));



            if (!urunDetay) {
                throw new Error('Ürün bulunamadı');
            }

            const stokMiktari = await conMain('urun_stok_miktarlari')
                .where('urun_id', urunDetay.id)
                .where('varyant_id', 0) // Ana ürün için varyant_id = 0
                .select('miktar')
                .first();

            urunDetay.miktar = stokMiktari ? stokMiktari.miktar : 0;

            // Ürün resimlerini çek
            const urunResimleri = await conMain('urun_resimleri')
                .where('urun_id', urunDetay.id)
                .select('*')
                .orderBy('varsayilan', 'desc');

            // Ürün dosyalarını çek
            const urunDosyalari = await conMain('urun_dosya_grup as dg')
                .leftJoin('urun_dosya_tanim as dt', 'dg.dosya_id', 'dt.id')
                .where('dg.urun_id', urunDetay.id)
                .select([
                    'dg.id',
                    'dg.dosya_yolu',
                    'dg.dosya_adi',
                    'dt.dosya_baslik',
                    'dt.id as dosya_tanim_id'
                ]);

            // Ürünün kategorilerini bul
            const kategoriIliskileri = await conMain('kategori_urun')
                .where('urun_id', urunDetay.id)
                .select('kategori_id');

            // Breadcrumb için kategori ağacını oluştur
            let breadcrumb = [];
            for (const kategoriIliski of kategoriIliskileri) {
                let currentKategori = await conMain('kategoriler')
                    .where('id', kategoriIliski.kategori_id)
                    .select('*')
                    .first();

                const kategoriBreadcrumb = [];
                while (currentKategori) {
                    kategoriBreadcrumb.unshift({
                        id: currentKategori.id,
                        title: currentKategori.kategori_adi,
                        title_en: currentKategori.kategori_adi_en,
                        title_tr: currentKategori.kategori_adi_tr,
                        href: `/products/${currentKategori.kategori_seo}`
                    });

                    if (currentKategori.kategori_ust_id === 0) break;

                    currentKategori = await conMain('kategoriler')
                        .where('id', currentKategori.kategori_ust_id)
                        .select('*')
                        .first();
                }

                // Her kategori zincirini ana breadcrumb array'ine ekle
                breadcrumb = [...kategoriBreadcrumb];  // İç içe array yerine tek array olarak al
                break; // İlk kategori zincirini kullan
            }

            // Ürün özelliklerini çek
            const urunOzellikleri = await conMain('urun_ozellikleri_grup as og')
                .leftJoin('urun_ozellikleri_tanim as ot', 'og.ozellik_id', 'ot.id')
                .leftJoin('urun_ozellikleri_tanim as ana', 'ot.ozellik_ust_id', 'ana.id')
                .where('og.urun_id', urunDetay.id)
                .select([
                    'og.*',
                    'ot.ozellik_adi',
                    'ana.ozellik_adi as ana_ozellik_adi'
                ]);

            // Önce ürünün tüm varyant gruplarını ve ana varyant bilgilerini çekelim
            const varyantGruplar = await conMain('urun_varyant_grup as uvg')
                .join('urun_varyant as uv', 'uvg.urun_varyant_id', 'uv.id')
                .join('urun_ana_varyant as uav', 'uvg.varyant_id', 'uav.id')
                .leftJoin('urun_ana_varyant as ust', 'uav.varyant_ust_id', 'ust.id')
                .where('uv.urun_id', urunDetay.id)
                .select([
                    'uv.id as varyant_id',
                    'uv.varyant_urun_adi',
                    'uv.stok_kodu',
                    'uv.barkod',
                    'uv.fiyat',
                    'uv.varsayilan',
                    'uav.id as alt_varyant_id',
                    'uav.varyant_adi as alt_varyant_adi',
                    'uav.varyant_ust_id',
                    'ust.id as ust_varyant_id',
                    'ust.varyant_adi as ust_varyant_adi',
                    'ust.varyant_sira'
                ])
                .orderBy('ust.varyant_sira')
                .orderBy('ust.varyant_adi');

            // Fiyat hesaplamalarını Promise.all ile yap
            const updatedVaryantGruplar = await Promise.all(
                varyantGruplar.map(async (item) => {
                    const vergiler1 = await conMain('vergiler as v')
                        .leftJoin('urun_vergi_grup as uvg', 'v.id', 'uvg.vergi_id')
                        .where('uvg.urun_id', urunDetay.id)
                        .where('uvg.varyant_id', item.varyant_id)
                        .select('v.vergi_orani', 'v.vergi_adi')
                        .first() || { vergi_orani: 0 };

                    const ozelFiyat1 = await conMain('urun_ozel_fiyat_grup')
                        .where('urun_id', urunDetay.id)
                        .where('varyant_id', item.varyant_id)
                        .where('ozel_fiyat_id', fiyat_grup_id)
                        .select('fiyat')
                        .first() || 0;


                    return {
                        ...item,
                        kdvsiz_fiyat: ozelFiyat1
                            ? ozelFiyat1.fiyat
                            : item.fiyat, // Varyantlar için KDV'siz fiyat hesaplama
                        fiyat: ozelFiyat1
                            ? (ozelFiyat1.fiyat) * (1 + vergiler1.vergi_orani / 100)
                            : (item.fiyat) * (1 + vergiler1.vergi_orani / 100),
                        indirimli_fiyat: iskonto_yuzde > 0
                            ? ozelFiyat1
                                ? (ozelFiyat1.fiyat * (1 - iskonto_yuzde / 100)) * (1 + vergiler1.vergi_orani / 100)
                                : (item.fiyat * (1 - iskonto_yuzde / 100)) * (1 + vergiler1.vergi_orani / 100)
                            : 0
                    };

                })
            );


            const updatedVaryantGruplarWithMarka = varyantGruplar.map(item => ({
                ...item
            }));

            // Varyantları üst gruplara göre organize edelim
            const varyantGruplari = {};
            const varyantlar = {};
            const kombinasyonlar = {};

            updatedVaryantGruplar.forEach(item => {
                // Üst varyant grubu oluştur
                if (!varyantGruplari[item.ust_varyant_id]) {
                    varyantGruplari[item.ust_varyant_id] = {
                        id: item.ust_varyant_id,
                        adi: item.ust_varyant_adi,
                        sira: item.varyant_sira,
                        altVaryantlar: new Set()
                    };
                }

                // Alt varyantı ekle
                varyantGruplari[item.ust_varyant_id].altVaryantlar.add(JSON.stringify({
                    id: item.alt_varyant_id,
                    adi: item.alt_varyant_adi
                }));

                // Varyant detaylarını sakla
                if (!kombinasyonlar[item.varyant_id]) {
                    kombinasyonlar[item.varyant_id] = {
                        id: item.varyant_id,
                        varyant_urun_adi: item.varyant_urun_adi,
                        stok_kodu: item.stok_kodu,
                        barkod: item.barkod,
                        fiyat: item.fiyat,
                        kdvsiz_fiyat: item.kdvsiz_fiyat,
                        indirimli_fiyat: item.indirimli_fiyat,
                        varsayilan: item.varsayilan,
                        kombinasyon: {}
                    };
                }
                kombinasyonlar[item.varyant_id].kombinasyon[item.ust_varyant_id] = {
                    id: item.alt_varyant_id,
                    adi: item.alt_varyant_adi
                };
            });

            // Set'leri normal array'e çevir ve sırala
            const formatlanmisVaryantGruplari = Object.values(varyantGruplari)
                .sort((a, b) => a.sira - b.sira)
                .map(grup => ({
                    ...grup,
                    altVaryantlar: Array.from(grup.altVaryantlar).map(item => JSON.parse(item))
                        .sort((a, b) => {
                            // Sayısal değerleri çıkar (örn: "5W" -> "5")
                            const numA = parseInt(a.adi.match(/\d+/) || [0]);
                            const numB = parseInt(b.adi.match(/\d+/) || [0]);

                            // Eğer her ikisi de sayısal değer içeriyorsa, sayısal olarak karşılaştır
                            if (numA && numB) {
                                return numA - numB;
                            }
                            // Aksi halde normal string karşılaştırması yap
                            return a.adi.localeCompare(b.adi);
                        })
                }));

            // Stok miktarlarını çek
            const stokMiktarlari = await conMain('urun_stok_miktarlari')
                .where('urun_id', urunDetay.id)
                .whereNot('varyant_id', 0)
                .select('varyant_id', 'miktar', 'yoldaki_miktar', 'uretim_miktar', 'miktar2');



            // Stok miktarlarını kombinasyonlara ekle
            stokMiktarlari.forEach(stok => {
                if (kombinasyonlar[stok.varyant_id]) {
                    kombinasyonlar[stok.varyant_id].stok = stok.miktar;
                    kombinasyonlar[stok.varyant_id].yoldaki_miktar = stok.yoldaki_miktar;
                    kombinasyonlar[stok.varyant_id].uretim_miktar = stok.uretim_miktar;
                    kombinasyonlar[stok.varyant_id].miktar2 = stok.miktar2;
                }
            });
            return {
                urunDetay,
                resimler: urunResimleri,
                dosyalar: urunDosyalari,
                breadcrumbs: breadcrumb,
                ozellikler: urunOzellikleri,
                varyantGruplari: formatlanmisVaryantGruplari,
                kombinasyonlar: Object.values(kombinasyonlar)
            };

        } catch (error) {
            throw error;
        }
    }


    async webYeniUrunler(req, res) {
        try {
            const urunler = await conMain('urun_ana_bilgileri as ana')
                .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                .leftJoin('urun_resimleri as resim', function () {
                    this.on('ana.id', '=', 'resim.urun_id')
                        .andOn(function () {
                            this.on('resim.varsayilan', '=', 1)
                                .orOnNull('resim.varsayilan');
                        });
                })
                .join('urun_durumlari_grup as dg', 'ana.id', 'dg.urun_id')
                .where('dg.durum_id', 1)
                .where('ana.active', 1)
                .select([
                    'ana.id',
                    'ana.stok_kodu',
                    'ana.fiyat',
                    'ana.tip',
                    'alt.urun_adi',
                    'alt.urun_seo',
                    'resim.resim'
                ])
                .orderBy('ana.id', 'desc');

            return urunler;
        } catch (error) {
            throw error;
        }
    }

    async webOutletUrunler(req, res) {
        try {
            const urunler = await conMain('urun_ana_bilgileri as ana')
                .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                .leftJoin('urun_resimleri as resim', function () {
                    this.on('ana.id', '=', 'resim.urun_id')
                        .andOn(function () {
                            this.on('resim.varsayilan', '=', 1)
                                .orOnNull('resim.varsayilan');
                        });
                })
                .join('urun_durumlari_grup as dg', 'ana.id', 'dg.urun_id')
                .where('dg.durum_id', 5)
                .where('ana.active', 1)
                .select([
                    'ana.id',
                    'ana.stok_kodu',
                    'ana.fiyat',
                    'ana.tip',
                    'alt.urun_adi',
                    'alt.urun_seo',
                    'resim.resim'
                ])
                .orderBy('ana.id', 'desc');

            return urunler;
        } catch (error) {
            throw error;
        }
    }

    async webOnecikanUrunler(req, res) {
        try {
            const urunler = await conMain('urun_ana_bilgileri as ana')
                .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                .leftJoin('urun_resimleri as resim', function () {
                    this.on('ana.id', '=', 'resim.urun_id')
                        .andOn(function () {
                            this.on('resim.varsayilan', '=', 1)
                                .orOnNull('resim.varsayilan');
                        });
                })
                .join('urun_durumlari_grup as dg', 'ana.id', 'dg.urun_id')
                .where('dg.durum_id', 3)
                .where('ana.active', 1)
                .select([
                    'ana.id',
                    'ana.stok_kodu',
                    'ana.fiyat',
                    'ana.tip',
                    'alt.urun_adi',
                    'alt.urun_seo',
                    'resim.resim'
                ])
                .orderBy('ana.id', 'desc');

            return urunler;
        } catch (error) {
            throw error;
        }
    }

    async webEnCokSatanlar(req, res) {
        try {
            const urunler = await conMain('urun_ana_bilgileri as ana')
                .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                .leftJoin('urun_resimleri as resim', function () {
                    this.on('ana.id', '=', 'resim.urun_id')
                        .andOn(function () {
                            this.on('resim.varsayilan', '=', 1)
                                .orOnNull('resim.varsayilan');
                        });
                })
                .join('siparisler_alt as sa', 'ana.id', 'sa.urun_id')
                .where('ana.active', 1)
                .select([
                    'ana.id',
                    'ana.stok_kodu',
                    'ana.fiyat',
                    'ana.tip',
                    'alt.urun_adi',
                    'alt.urun_seo',
                    'resim.resim',
                    conMain.raw('SUM(sa.miktar) as toplam_miktar')
                ])
                .groupBy('ana.id', 'ana.stok_kodu', 'ana.fiyat', 'ana.tip', 'alt.urun_adi', 'alt.urun_seo', 'resim.resim')
                .orderBy('toplam_miktar', 'desc');

            return urunler;
        } catch (error) {
            throw error;
        }
    }

    async webBenzerUrunler(req, res) {
        try {
            // Önce kategori_seo'ya göre kategori ID'sini bul
            const kategori = await conMain('kategoriler')
                .where('kategori_seo', req.params.kategori_seo)
                .select('id')
                .first();

            if (!kategori) {
                return [];
            }

            // Kategori ID'si ile eşleşen ürünleri getir
            const urunler = await conMain('kategori_urun as ku')
                .join('urun_ana_bilgileri as ana', 'ku.urun_id', 'ana.id')
                .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                .leftJoin('urun_resimleri as resim', function () {
                    this.on('ana.id', '=', 'resim.urun_id')
                        .andOn(function () {
                            this.on('resim.varsayilan', '=', 1)
                                .orOnNull('resim.varsayilan');
                        });
                })
                .where('ku.kategori_id', kategori.id)
                .where('ana.active', 1)
                .select([
                    'ana.id',
                    'ana.stok_kodu',
                    'ana.fiyat',
                    'ana.tip',
                    'alt.urun_adi',
                    'alt.urun_seo',
                    'resim.resim'
                ])
                .orderBy('ana.id', 'desc');

            return urunler;
        } catch (error) {
            throw error;
        }
    }

    async webUrunlerListe(req, res) {
        try {
            // Urunleri ve alt urunlerini tek bir sorguda çek
            const tumUrunler = await conMain('urunler as u1')
                .leftJoin('urunler as u2', 'u1.urun_ust_id', 'u2.id')
                .select([
                    'u1.*',
                    'u2.urun_adi as ust_urun_adi'
                ]);

            // 0 olan urunleri ve alt urunlerini ayır
            const sonuc = {
                urunler: tumUrunler.filter(urun => urun.urun_ust_id === 0).map(urun => ({
                    ...urun,
                    altUrunler: tumUrunler.filter(altUrun => altUrun.urun_ust_id === urun.id)
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

            if (req.params.slug === 'undefined') {
                // Slug boş ise tüm urunleri getir
                const anaUrunler = await conMain('urunler')
                    .where('urun_ust_id', 0)
                    .select('urun_adi', 'urun_seo', 'id')
                    .orderBy('urun_adi');


                anaUrunler = await Promise.all(anaUrunler.map(async (urun) => {
                    const altUrunler = await conMain('urunler')
                        .where('urun_ust_id', urun.id)
                        .select('urun_adi', 'urun_seo')
                        .orderBy('urun_adi');

                    return {
                        urun_adi: urun.urun_adi,
                        urun_seo: urun.urun_seo,
                        altUrunler: altUrunler
                    };
                }));
            } else {
                // Slug dolu ise önceki mantığı uygula
                const kategoriBySlug = await conMain('kategoriler')
                    .where('kategori_seo', req.params.slug)
                    .select('*')
                    .first();

                const ustKategori = await conMain('kategoriler')
                    .where('id', kategoriBySlug.kategori_ust_id)
                    .select('kategori_adi as title', 'kategori_seo as href')
                    .first();

                if (ustKategori) {
                    breadcrumb.push({ title: ustKategori.title, href: `/products/${ustKategori.href}` });
                }
                breadcrumb.push({ title: kategoriBySlug.kategori_adi, href: `/products/${kategoriBySlug.kategori_seo}` });

                if (kategoriBySlug.kategori_ust_id === 0) {
                    // Ana kategori ise alt kategorilerini getir
                    const altKategoriler = await conMain('kategoriler')
                        .where('kategori_ust_id', kategoriBySlug.id)
                        .select('kategori_adi', 'kategori_seo')
                        .orderBy('kategori_adi');

                    anaKategori.push({
                        kategori_adi: kategoriBySlug.kategori_adi,
                        kategori_seo: kategoriBySlug.kategori_seo,
                        altKategoriler: altKategoriler
                    });
                } else {
                    // Alt kategori ise üst kategoriyi ve kardeş kategorileri getir
                    const ustUrunTam = await conMain('urunler')
                        .where('id', urun.urun_ust_id)
                        .select('urun_adi', 'urun_seo')
                        .first();

                    const kardesUrunler = await conMain('urunler')
                        .where('urun_ust_id', urun.urun_ust_id)
                        .select('urun_adi', 'urun_seo')
                        .orderBy('urun_adi');

                    anaKategori.push({
                        urun_adi: ustUrunTam.urun_adi,
                        urun_seo: ustUrunTam.urun_seo,
                        altUrunler: kardesUrunler
                    });
                }
            }

            return {
                breadcrumb,
                anaUrunler
            };
        } catch (error) {
            return error;
        }
    }

    async webHomeAnaUrunler(req, res) {
        try {
            // Sadece ana urunleri getir (urun_ust_id = 0 olanlar)
            const anaUrunler = await conMain('urunler')
                .where('urun_ust_id', 0)
                .select([
                    'urun_adi',
                    'urun_seo',
                    'urun_ikon',
                    'id'
                ])
                .orderBy('urun_adi');

            return anaUrunler

        } catch (error) {
            return error;
        }
    }

    async webKurumsalgetKategoriUrunleri(req, res) {
        try {
            //console.log(req.query);
            //console.log(req.params);

            if (req.params.kategoriId === 'undefined') {

                let urunler;
                let varyantFiltreler = {};
                // Önce ürünleri çek - sadece family name'li ana ürünler
                if (req.query.filtreler !== 'undefined') {
                    urunler = await conMain('urun_ana_bilgileri as ana')
                        .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                        .leftJoin('urun_resimleri as resim', function () {
                            this.on('ana.id', '=', 'resim.urun_id')
                                .andOn(function () {
                                    this.on('resim.varsayilan', '=', 1)
                                        .orOnNull('resim.varsayilan');
                                });
                        })
                        .leftJoin('urun_varyant_grup as uvg', 'ana.id', 'uvg.urun_id')
                        .distinct([
                            'ana.id',
                            'ana.stok_kodu',
                            'ana.fiyat',
                            'ana.tip',
                            'alt.urun_adi',
                            'alt.urun_seo',
                            'resim.resim',
                        ])
                        .whereIn('uvg.varyant_id', req.query.filtreler.split(' '))
                        .where('ana.active', 1)
                        .where('ana.tip', 1) // Sadece family name'li ana ürünler
                        .limit(50)
                        .orderBy('ana.id', 'desc');

                } else {

                    urunler = await conMain('urun_ana_bilgileri as ana')
                        .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                        .leftJoin('urun_resimleri as resim', function () {
                            this.on('ana.id', '=', 'resim.urun_id')
                                .andOn(function () {
                                    this.on('resim.varsayilan', '=', 1)
                                        .orOnNull('resim.varsayilan');
                                });
                        })
                        .select([
                            'ana.id',
                            'ana.stok_kodu',
                            'ana.fiyat',
                            'ana.tip',
                            'alt.urun_adi',
                            'alt.urun_seo',
                            'resim.resim',
                        ])
                        .where('ana.active', 1)
                        .limit(50)
                        .orderBy('ana.id', 'desc');

                }

                // Ürünlerin varyant bilgilerini çek
                const urunIds = urunler.map(urun => urun.id);
                const varyantBilgileri = await conMain('urun_varyant_grup as uvg')
                    .whereIn('uvg.urun_id', urunIds)
                    .join('urun_ana_varyant as alt', 'uvg.varyant_id', 'alt.id')
                    .leftJoin('urun_ana_varyant as ust', 'alt.varyant_ust_id', 'ust.id')
                    .select([
                        'uvg.urun_id',
                        'alt.id as varyant_id',
                        'alt.varyant_adi',
                        'alt.varyant_ust_id',
                        'ust.id as ust_varyant_id',
                        'ust.varyant_adi as ust_varyant_adi'
                    ]);


                // Varyant filtrelerini oluştur
                varyantBilgileri.forEach(varyant => {
                    if (varyant.ust_varyant_adi) {
                        if (!varyantFiltreler[varyant.ust_varyant_adi]) {
                            varyantFiltreler[varyant.ust_varyant_adi] = new Set();
                        }
                        varyantFiltreler[varyant.ust_varyant_adi].add(JSON.stringify({
                            id: varyant.varyant_id,
                            ad: varyant.varyant_adi
                        }));
                    }
                });

                // Set'leri Array'e çevir
                Object.keys(varyantFiltreler).forEach(key => {
                    varyantFiltreler[key] = Array.from(varyantFiltreler[key])
                        .map(item => JSON.parse(item))
                        .sort((a, b) => {
                            // Sayısal değerleri çıkar (örn: "5W" -> "5")
                            const numA = parseInt(a.ad.match(/\d+/) || [0]);
                            const numB = parseInt(b.ad.match(/\d+/) || [0]);

                            // Eğer her ikisi de sayısal değer içeriyorsa, sayısal olarak karşılaştır
                            if (numA && numB) {
                                return numA - numB;
                            }
                            // Aksi halde normal string karşılaştırması yap
                            return a.ad.localeCompare(b.ad);
                        });
                });

                // Ürünlere varyant bilgilerini ekle
                urunler = urunler.map(urun => ({
                    ...urun,
                    varyantlar: varyantBilgileri
                        .filter(v => v.urun_id === urun.id)
                        .map(v => ({
                            varyant_id: v.varyant_id,
                            varyant_adi: v.varyant_adi,
                            ust_varyant_adi: v.ust_varyant_adi
                        }))
                }));


                return {
                    urunler,
                    filtreler: varyantFiltreler
                }

            }


            let urunler;
            let varyantFiltreler = {};

            const kategori = await conMain('kategoriler')
                .where('kategori_seo', req.params.kategoriId)
                .select('id')
                .first();

            if (!kategori) {
                throw new Error('Kategori bulunamadı');
            }



            if (req.query.filtreler !== 'undefined') {
                urunler = await conMain('kategori_urun as ku')
                    .join('urun_ana_bilgileri as ana', 'ku.urun_id', 'ana.id')
                    .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                    .leftJoin('urun_resimleri as resim', function () {
                        this.on('ana.id', '=', 'resim.urun_id')
                            .andOn(function () {
                                this.on('resim.varsayilan', '=', 1)
                                    .orOnNull('resim.varsayilan');
                            });
                    })
                    .leftJoin('urun_varyant_grup as uvg', 'ana.id', 'uvg.urun_id')
                    .distinct([
                        'ana.id',
                        'ana.stok_kodu',
                        'ana.fiyat',
                        'ana.tip',
                        'alt.urun_adi',
                        'alt.urun_seo',
                        'resim.resim',
                    ])
                    .where('ku.kategori_id', kategori.id)
                    .whereIn('uvg.varyant_id', req.query.filtreler.split(' '))
                    .where('ana.active', 1)
                    .limit(50)
                    .orderBy('ana.id', 'desc');

            } else {

                urunler = await conMain('kategori_urun as ku')
                    .join('urun_ana_bilgileri as ana', 'ku.urun_id', 'ana.id')
                    .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                    .leftJoin('urun_resimleri as resim', function () {
                        this.on('ana.id', '=', 'resim.urun_id')
                            .andOn(function () {
                                this.on('resim.varsayilan', '=', 1)
                                    .orOnNull('resim.varsayilan');
                            });
                    })
                    .select([
                        'ana.id',
                        'ana.stok_kodu',
                        'ana.fiyat',
                        'ana.tip',
                        'alt.urun_adi',
                        'alt.urun_seo',
                        'resim.resim',
                    ])
                    .where('ku.kategori_id', kategori.id)
                    .where('ana.active', 1)
                    .limit(50)
                    .orderBy('ana.id', 'desc');

            }

            // Ürünlerin varyant bilgilerini çek
            const urunIds = urunler.map(urun => urun.id);
            const varyantBilgileri = await conMain('urun_varyant_grup as uvg')
                .whereIn('uvg.urun_id', urunIds)
                .join('urun_ana_varyant as alt', 'uvg.varyant_id', 'alt.id')
                .leftJoin('urun_ana_varyant as ust', 'alt.varyant_ust_id', 'ust.id')
                .select([
                    'uvg.urun_id',
                    'alt.id as varyant_id',
                    'alt.varyant_adi',
                    'alt.varyant_ust_id',
                    'ust.id as ust_varyant_id',
                    'ust.varyant_adi as ust_varyant_adi'
                ]);


            // Varyant filtrelerini oluştur
            varyantBilgileri.forEach(varyant => {
                if (varyant.ust_varyant_adi) {
                    if (!varyantFiltreler[varyant.ust_varyant_adi]) {
                        varyantFiltreler[varyant.ust_varyant_adi] = new Set();
                    }
                    varyantFiltreler[varyant.ust_varyant_adi].add(JSON.stringify({
                        id: varyant.varyant_id,
                        ad: varyant.varyant_adi
                    }));
                }
            });

            // Set'leri Array'e çevir
            Object.keys(varyantFiltreler).forEach(key => {
                varyantFiltreler[key] = Array.from(varyantFiltreler[key])
                    .map(item => JSON.parse(item))
                    .sort((a, b) => {
                        // Sayısal değerleri çıkar (örn: "5W" -> "5")
                        const numA = parseInt(a.ad.match(/\d+/) || [0]);
                        const numB = parseInt(b.ad.match(/\d+/) || [0]);

                        // Eğer her ikisi de sayısal değer içeriyorsa, sayısal olarak karşılaştır
                        if (numA && numB) {
                            return numA - numB;
                        }
                        // Aksi halde normal string karşılaştırması yap
                        return a.ad.localeCompare(b.ad);
                    });
            });

            // Ürünlere varyant bilgilerini ekle
            urunler = urunler.map(urun => ({
                ...urun,
                varyantlar: varyantBilgileri
                    .filter(v => v.urun_id === urun.id)
                    .map(v => ({
                        varyant_id: v.varyant_id,
                        varyant_adi: v.varyant_adi,
                        ust_varyant_adi: v.ust_varyant_adi
                    }))
            }));

            return {
                urunler,
                filtreler: varyantFiltreler
            }

        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

export default new UrunlerServices;