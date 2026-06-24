import conMain from "../config/database.mjs";
import conMainMssql from "../config/databaseMssql.mjs";
import conMainMssql2 from "../config/databaseMssql2.mjs";
import MikroServices from "./mikroServices.mjs";
import OtherServices from "./otherServices.mjs";
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import crypto from 'crypto';

class SiparislerServices {

    constructor() {
        // Basit memory cache
        this.imageCache = new Map();
    }

    // Resim dosyasını base64'e çeviren yardımcı fonksiyon
    async imageToBase64(imagePath) {
        try {
            // Memory cache'den kontrol et
            if (this.imageCache.has(imagePath)) {
                return this.imageCache.get(imagePath);
            }

            const fullPath = path.join(process.cwd(), 'public', 'uploads', 'products', imagePath);

            if (fs.existsSync(fullPath)) {
                // Resmi küçült ve sıkıştır
                const resizedImageBuffer = await sharp(fullPath)
                    .resize(100, 100, { // 100x100 piksel boyutuna küçült
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .jpeg({ quality: 60 }) // JPEG kalitesini %60'a düşür
                    .toBuffer();

                const base64 = resizedImageBuffer.toString('base64');

                // Memory cache'e kaydet
                this.imageCache.set(imagePath, base64);

                return base64;
            }
            return null;
        } catch (error) {
            // console.log('Resim base64 çevirme hatası:', error.message);
            return null;
        }
    }

    // Önbelleği temizle
    clearImageCache() {
        this.imageCache.clear();
        //console.log('Resim önbelleği temizlendi');
    }

    async getSiparisler(req, res) {
        try {
            const siparisler = await conMain('siparisler_genel')
                .where({
                    musteri_id: req.params.musteri_id
                })
                .select('*')
                .orderBy('id', 'desc');

            // Kontrol edilmesi gereken siparişleri filtrele
            const kontrolEdilecek = siparisler.filter(s => s.durum != 1 && s.erp_durum == 1);
            const siparisNolar = kontrolEdilecek.map(s => s.siparis_no);

            // Toplu irsaliye kontrolü
            const { mu1Set, mu2Set } = await this.siparisIrsaliyeTopluKontrol(siparisNolar);

            const mu1UpdateIds = [];
            const mu2UpdateIds = [];

            for (const siparis of siparisler) {
                if (siparis.durum != 1 && siparis.erp_durum == 1) {
                    if (mu2Set.has(siparis.siparis_no)) {
                        siparis.irsaliye_donumus_mu = true;
                        mu2UpdateIds.push(siparis.id);
                    } else if (mu1Set.has(siparis.siparis_no)) {
                        siparis.irsaliye_donumus_mu = true;
                        mu1UpdateIds.push(siparis.id);
                    } else {
                        siparis.irsaliye_donumus_mu = false;
                    }
                }
            }

            if (mu1UpdateIds.length > 0) {
                await conMain('siparisler_genel')
                    .whereIn('id', mu1UpdateIds)
                    .update({ durum: 6 });
            }
            if (mu2UpdateIds.length > 0) {
                await conMain('siparisler_genel')
                    .whereIn('id', mu2UpdateIds)
                    .update({ durum: 1 });
            }

            const siparislerAlt = await conMain('siparisler_alt')
                .leftJoin('urun_varyant', 'siparisler_alt.varyant_id', 'urun_varyant.id')
                .leftJoin('urun_alt_bilgileri', 'siparisler_alt.urun_id', 'urun_alt_bilgileri.id')
                .leftJoin('ozel_vergi_tanimlari', 'siparisler_alt.vergi_id', 'ozel_vergi_tanimlari.id')
                .leftJoin('urun_varyant_grup as uvg', 'urun_varyant.id', 'uvg.urun_varyant_id')
                .leftJoin('urun_ana_varyant as uav', 'uvg.varyant_id', 'uav.id')
                .leftJoin('urun_ana_varyant as ust', 'uav.varyant_ust_id', 'ust.id')
                .whereIn('siparis_id', siparisler.map(siparis => siparis.id))
                .select(
                    'siparisler_alt.*',
                    'urun_varyant.stok_kodu',
                    'urun_varyant.varyant_urun_adi',
                    'urun_alt_bilgileri.urun_adi',
                    'urun_alt_bilgileri.urun_seo',
                    'ozel_vergi_tanimlari.vergi_kodu',
                    'uav.varyant_adi',
                    'ust.varyant_adi as ust_varyant_adi'
                )
                .then(async rows => {
                    // Fetch and add images for each row
                    const rowsWithImages = await Promise.all(rows.map(async row => {
                        // Check for variant image
                        const varyantResim = await conMain('urun_resimleri')
                            .where({
                                'urun_id': row.urun_id,
                                'varyant_id': row.varyant_id
                            })
                            .first();

                        // If no variant image, get default product image
                        if (!varyantResim) {
                            const varsayilanResim = await conMain('urun_resimleri')
                                .where({
                                    'urun_id': row.urun_id,
                                    'varsayilan': 1
                                })
                                .first();
                            row.resim = varsayilanResim ? varsayilanResim.resim : null;
                        } else {
                            row.resim = varyantResim.resim;
                        }
                        return row;
                    }));

                    // Group rows and process variant information
                    const groupedRows = {};
                    rowsWithImages.forEach(row => {
                        const key = row.id; // siparisler_alt tablosundaki id
                        if (!groupedRows[key]) {
                            groupedRows[key] = {
                                ...row,
                                varyant_bilgisi: []
                            };
                        }
                        if (row.varyant_adi && row.ust_varyant_adi) {
                            groupedRows[key].varyant_bilgisi.push(`${row.ust_varyant_adi} - ${row.varyant_adi}`);
                        }
                    });
                    return Object.values(groupedRows).map(row => ({
                        ...row,
                        varyant_bilgisi: row.varyant_bilgisi.join(', ')
                    }));
                });



            // Siparişleri ve alt siparişleri birleştir
            const birlesikSiparisler = siparisler.map(siparis => ({
                ...siparis,
                alt_siparisler: siparislerAlt.filter(alt => alt.siparis_id === siparis.id)
            }));

            return {
                status: 'success',
                siparisler: birlesikSiparisler
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    async createSiparis(req, res) {
        const iskonto_yuzde = req.locals.user.iskonto_yuzde;
        const fiyat_grup_id = req.locals.user.fiyat_grup_id;
        const eposta = req.locals.user.eposta;
        const trx = await conMain.transaction();

        try {
            // Helper function to generate sequential order number based on id
            const generateOrderNumber = (id) => {
                const paddedId = id.toString().padStart(5, '0');
                return `HRZ${paddedId}`;
            };

            const sepet = await trx('sepet')
                .where({
                    cartId: req.body.cartId
                })
                .select('*');

            // First insert the order to get the auto-increment id
            const [siparislerGenelId] = await trx('siparisler_genel')
                .insert({
                    siparis_no: '', // Temporary empty value
                    musteri_id: sepet[0].musteri_id,
                    adres_kargo_id: req.body.kargoAdresId,
                    adres_fatura_id: req.body.faturaAdresId,
                    aciklama: req.body.aciklama,
                    odeme: 0,
                    durum: 0,
                });

            // Generate the sequential order number based on the id
            const siparisNo = generateOrderNumber(siparislerGenelId);

            // Update the order with the generated number
            await trx('siparisler_genel')
                .where('id', siparislerGenelId)
                .update({
                    siparis_no: siparisNo
                });

            // Use Promise.all to wait for all inserts to complete
            await Promise.all(sepet.map(async item => {
                // Get price from urun_varyant table

                let varyant;

                if (item.varyant_id > 0) {

                    varyant = await trx('urun_varyant')
                        .where({
                            id: item.varyant_id,
                            urun_id: item.urun_id
                        })
                        .first();

                } else {

                    varyant = await trx('urun_ana_bilgileri')
                        .where({
                            id: item.urun_id,
                        })
                        .first();

                }



                let vergiler = await conMain('vergiler as v')
                    .leftJoin('urun_vergi_grup as uvg', 'v.id', 'uvg.vergi_id')
                    .where('uvg.urun_id', item.urun_id)
                    .where('uvg.varyant_id', item.varyant_id)
                    .select('v.vergi_orani', 'v.vergi_adi', 'v.id as vergi_id').first();

                if (!vergiler) {
                    vergiler = await conMain('vergiler')
                        .where('id', 4)
                        .select('vergi_orani', 'vergi_adi', 'id as vergi_id')
                        .first();
                }

                const ozelFiyat = await conMain('urun_ozel_fiyat_grup')
                    .where('urun_id', item.urun_id)
                    .where('varyant_id', item.varyant_id)
                    .where('ozel_fiyat_id', fiyat_grup_id)
                    .select('fiyat', 'ozel_fiyat_id').first();



                item.birim_fiyat = ozelFiyat ? ozelFiyat.fiyat : varyant.fiyat;
                item.fiyat = ozelFiyat ? ((ozelFiyat.fiyat * item.miktar) * (1 - iskonto_yuzde / 100)) * (1 + vergiler.vergi_orani / 100) : ((varyant.fiyat * item.miktar) * (1 - iskonto_yuzde / 100)) * (1 + vergiler.vergi_orani / 100);


                item.kdv_fiyat = ((item.birim_fiyat * item.miktar) * (1 - iskonto_yuzde / 100)) * (vergiler.vergi_orani / 100);
                item.iskonto_tutari = (item.birim_fiyat * item.miktar) * (iskonto_yuzde / 100);





                return trx('siparisler_alt').insert({
                    siparis_id: siparislerGenelId,
                    urun_id: item.urun_id,
                    varyant_id: item.varyant_id,
                    alis_fiyat: varyant.alis_fiyati,
                    birim_fiyat: varyant.fiyat,
                    net_birim_fiyat: ozelFiyat ? ozelFiyat.fiyat : varyant.fiyat,
                    fiyat: item.fiyat,
                    kdv_fiyat: item.kdv_fiyat,
                    vergi_id: vergiler.vergi_id,
                    iskonto_tutari: item.iskonto_tutari,
                    iskonto_yuzde: iskonto_yuzde,
                    ozel_fiyat_id: ozelFiyat ? ozelFiyat.ozel_fiyat_id : 0,
                    miktar: item.miktar
                });
            }));

            // Sepetin içindeki ürünleri sil
            await trx('sepet')
                .where({
                    cartId: req.body.cartId
                })
                .delete();

            // If everything succeeded, commit the transaction
            await trx.commit();

            const bildirimEkle = await OtherServices.bildirimEkle('Sipariş', siparislerGenelId, `${siparisNo} nolu sipariş oluşturuldu`);
            const epostaGonder = await OtherServices.epostaGonder('Sipariş', `${req.locals.user.ad} ${req.locals.user.soyad} - ${siparisNo} nolu sipariş oluşturuldu`, eposta);
            //const siparisErpAktar = await this.siparisErpAktar(siparislerGenelId);


            return {
                status: 'success',
                message: 'Sipariş başarıyla oluşturuldu',
                siparisNo: siparisNo
            };

        } catch (error) {
            // If anything fails, roll back the transaction
            await trx.rollback();
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }


    async createCmsSiparis(req, res) {


        const trx = await conMain.transaction();

        const musteriBilgileri = await conMain('musteriler')
            .where('id', req.body.musteri_id)
            .select('*')
            .first();

        const iskonto_yuzde = musteriBilgileri.iskonto_yuzde;
        const fiyat_grup_id = musteriBilgileri.fiyat_grup_id;
        const eposta = musteriBilgileri.eposta;
        try {
            // Helper function to generate sequential order number based on id
            const generateOrderNumber = (id) => {
                const paddedId = id.toString().padStart(5, '0');
                return `HRZ${paddedId}`;
            };

            // First insert the order to get the auto-increment id
            const [siparislerGenelId] = await trx('siparisler_genel')
                .insert({
                    siparis_no: '', // Temporary empty value
                    musteri_id: musteriBilgileri.id,
                    adres_kargo_id: req.body.kargo_adres_id,
                    adres_fatura_id: req.body.fatura_adres_id,
                    aciklama: '',
                    odeme: 0,
                    durum: 0,
                });

            // Generate the sequential order number based on the id
            const siparisNo = generateOrderNumber(siparislerGenelId);

            // Update the order with the generated number
            await trx('siparisler_genel')
                .where('id', siparislerGenelId)
                .update({
                    siparis_no: siparisNo
                });

            // Use Promise.all to wait for all inserts to complete
            await Promise.all(req.body.urunler.map(async item => {
                // Get price from urun_varyant table

                let varyant;

                if (item.varyant_id > 0) {

                    varyant = await trx('urun_varyant')
                        .where({
                            id: item.varyant_id,
                            urun_id: item.urun_id
                        })
                        .first();

                } else {

                    varyant = await trx('urun_ana_bilgileri')
                        .where({
                            id: item.urun_id,
                        })
                        .first();

                }



                let vergiler = await conMain('vergiler as v')
                    .leftJoin('urun_vergi_grup as uvg', 'v.id', 'uvg.vergi_id')
                    .where('uvg.urun_id', item.urun_id)
                    .where('uvg.varyant_id', item.varyant_id)
                    .select('v.vergi_orani', 'v.vergi_adi', 'v.id as vergi_id').first();

                if (!vergiler) {
                    vergiler = await conMain('vergiler')
                        .where('id', 4)
                        .select('vergi_orani', 'vergi_adi', 'id as vergi_id')
                        .first();
                }

                const ozelFiyat = await conMain('urun_ozel_fiyat_grup')
                    .where('urun_id', item.urun_id)
                    .where('varyant_id', item.varyant_id)
                    .where('ozel_fiyat_id', fiyat_grup_id)
                    .select('fiyat', 'ozel_fiyat_id').first();



                item.birim_fiyat = ozelFiyat ? ozelFiyat.fiyat : varyant.fiyat;
                item.fiyat = ozelFiyat ? ((ozelFiyat.fiyat * item.miktar) * (1 - iskonto_yuzde / 100)) * (1 + vergiler.vergi_orani / 100) : ((varyant.fiyat * item.miktar) * (1 - iskonto_yuzde / 100)) * (1 + vergiler.vergi_orani / 100);


                item.kdv_fiyat = ((item.birim_fiyat * item.miktar) * (1 - iskonto_yuzde / 100)) * (vergiler.vergi_orani / 100);
                item.iskonto_tutari = (item.birim_fiyat * item.miktar) * (iskonto_yuzde / 100);





                return trx('siparisler_alt').insert({
                    siparis_id: siparislerGenelId,
                    urun_id: item.urun_id,
                    varyant_id: item.varyant_id,
                    alis_fiyat: varyant.alis_fiyati,
                    birim_fiyat: varyant.fiyat,
                    net_birim_fiyat: ozelFiyat ? ozelFiyat.fiyat : varyant.fiyat,
                    fiyat: item.fiyat,
                    kdv_fiyat: item.kdv_fiyat,
                    vergi_id: vergiler.vergi_id,
                    iskonto_tutari: item.iskonto_tutari,
                    iskonto_yuzde: iskonto_yuzde,
                    ozel_fiyat_id: ozelFiyat ? ozelFiyat.ozel_fiyat_id : 0,
                    miktar: item.miktar
                });
            }));



            // If everything succeeded, commit the transaction
            await trx.commit();

            const bildirimEkle = await OtherServices.bildirimEkle('Sipariş', siparislerGenelId, `${siparisNo} nolu sipariş oluşturuldu`);
            const epostaGonder = await OtherServices.epostaGonder('Sipariş', `${musteriBilgileri.ad} ${musteriBilgileri.soyad} - ${siparisNo} nolu sipariş oluşturuldu`, eposta);
            //const siparisErpAktar = await this.siparisErpAktar(siparislerGenelId);


            return {
                status: 'success',
                message: 'Sipariş başarıyla oluşturuldu',
                siparisNo: siparisNo,
                id: siparislerGenelId
            };

        } catch (error) {
            // If anything fails, roll back the transaction
            await trx.rollback();
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    async updateSiparis(req, res) {
        try {
            const siparis = await conMain('siparisler')
                .where({
                    id: req.params.id
                })
                .update({
                    miktar: req.body.miktar
                });

            return {
                status: 'success',
                message: 'Sepet güncellendi',
                sepet: sepet
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    async deleteSiparis(req, res) {
        try {
            const siparis = await conMain('siparisler')
                .where({
                    id: req.params.id
                })
                .delete();

            return {
                status: 'success',
                message: 'Sepet silindi'
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }


    async getSiparislerListe(req, res) {
        try {
            // Get orders with customer info
            const siparisler = await conMain('siparisler_genel')
                .leftJoin('musteriler', 'siparisler_genel.musteri_id', 'musteriler.id')
                .select(
                    'siparisler_genel.*',
                    conMain.raw('CONCAT(musteriler.ad, " ", musteriler.soyad) as musteri_adi')
                )
                .orderBy('siparisler_genel.id', 'desc');

            // Kontrol edilmesi gereken siparişleri filtrele
            const kontrolEdilecek = siparisler.filter(s => s.durum != 1 && s.erp_durum == 1);
            const siparisNolar = kontrolEdilecek.map(s => s.siparis_no);

            // Toplu irsaliye kontrolü - tek seferde tüm siparişler için (N×7 sorgu yerine 4 sorgu)
            const { mu1Set, mu2Set } = await this.siparisIrsaliyeTopluKontrol(siparisNolar);

            // Sonuçları siparişlere uygula
            const mu1UpdateIds = []; // durum=6 yapılacaklar
            const mu2UpdateIds = []; // durum=1 yapılacaklar

            for (const siparis of siparisler) {
                if (siparis.durum != 1 && siparis.erp_durum == 1) {
                    // mu2 true ise mu1 de true'dur (mu2 subset of mu1)
                    if (mu2Set.has(siparis.siparis_no)) {
                        siparis.irsaliye_donumus_mu = true;
                        mu2UpdateIds.push(siparis.id);
                    } else if (mu1Set.has(siparis.siparis_no)) {
                        siparis.irsaliye_donumus_mu = true;
                        mu1UpdateIds.push(siparis.id);
                    } else {
                        siparis.irsaliye_donumus_mu = false;
                    }
                }
            }

            // Toplu MySQL güncellemeleri (N adet tek tek update yerine 2 toplu update)
            if (mu1UpdateIds.length > 0) {
                await conMain('siparisler_genel')
                    .whereIn('id', mu1UpdateIds)
                    .update({ durum: 6 });
            }
            if (mu2UpdateIds.length > 0) {
                await conMain('siparisler_genel')
                    .whereIn('id', mu2UpdateIds)
                    .update({ durum: 1 });
            }

            // Toplu toplam fiyat hesaplama (N adet tek tek SUM yerine 1 toplu sorgu)
            const totals = await conMain('siparisler_alt')
                .whereIn('siparis_id', siparisler.map(s => s.id))
                .groupBy('siparis_id')
                .select('siparis_id', conMain.raw('SUM(fiyat) as toplam'));

            const totalsMap = {};
            totals.forEach(t => { totalsMap[t.siparis_id] = t.toplam || 0; });

            const siparislerWithTotals = siparisler.map(siparis => ({
                ...siparis,
                toplam_fiyat: totalsMap[siparis.id] || 0
            }));

            return siparislerWithTotals;
        } catch (error) {
            throw error;
        }
    }

    async getSiparislerCmsById(req, res) {
        try {
            const siparislerGenel = await conMain('siparisler_genel')
                .leftJoin('musteriler', 'siparisler_genel.musteri_id', 'musteriler.id')
                .select(
                    'siparisler_genel.*',
                    conMain.raw('CONCAT(musteriler.ad, " ", musteriler.soyad) as musteri_adi'),
                    'musteriler.telefon',
                    'musteriler.eposta',
                    'musteriler.vkntckn',
                    'musteriler.kodu'
                ).where('siparisler_genel.id', req.params.id)
                .first();

            const kargoAdresi = await conMain('musteriler_adres')
                .where('id', siparislerGenel.adres_kargo_id)
                .select('*').first();

            const faturaAdresi = await conMain('musteriler_adres')
                .where('id', siparislerGenel.adres_fatura_id)
                .select('*').first();

            const siparislerAlt = await conMain('siparisler_alt')
                .leftJoin('urun_varyant', 'siparisler_alt.varyant_id', 'urun_varyant.id')
                .leftJoin('urun_alt_bilgileri', 'siparisler_alt.urun_id', 'urun_alt_bilgileri.id')
                .leftJoin('ozel_vergi_tanimlari', 'siparisler_alt.vergi_id', 'ozel_vergi_tanimlari.id')
                .leftJoin('urun_varyant_grup as uvg', 'urun_varyant.id', 'uvg.urun_varyant_id')
                .leftJoin('urun_ana_varyant as uav', 'uvg.varyant_id', 'uav.id')
                .leftJoin('urun_ana_varyant as ust', 'uav.varyant_ust_id', 'ust.id')
                .where('siparis_id', siparislerGenel.id)
                .select(
                    'siparisler_alt.*',
                    'urun_varyant.stok_kodu',
                    'urun_varyant.varyant_urun_adi',
                    'urun_alt_bilgileri.urun_adi',
                    'urun_alt_bilgileri.urun_seo',
                    'ozel_vergi_tanimlari.vergi_kodu',
                    'uav.varyant_adi',
                    'ust.varyant_adi as ust_varyant_adi'
                )
                .then(async rows => {
                    // Fetch and add images for each row
                    const rowsWithImages = await Promise.all(rows.map(async row => {
                        // Check for variant image
                        const varyantResim = await conMain('urun_resimleri')
                            .where({
                                'urun_id': row.urun_id,
                                'varyant_id': row.varyant_id
                            })
                            .first();

                        // If no variant image, get default product image
                        if (!varyantResim) {
                            const varsayilanResim = await conMain('urun_resimleri')
                                .where({
                                    'urun_id': row.urun_id,
                                    'varsayilan': 1
                                })
                                .first();
                            row.resim = varsayilanResim ? varsayilanResim.resim : null;
                        } else {
                            row.resim = varyantResim.resim;
                        }
                        return row;
                    }));

                    // Group rows and process variant information
                    const groupedRows = {};
                    rowsWithImages.forEach(row => {
                        const key = row.id; // siparisler_alt tablosundaki id
                        if (!groupedRows[key]) {
                            groupedRows[key] = {
                                ...row,
                                varyant_bilgisi: []
                            };
                        }
                        if (row.varyant_adi && row.ust_varyant_adi) {
                            groupedRows[key].varyant_bilgisi.push(`${row.ust_varyant_adi} - ${row.varyant_adi}`);
                        }
                    });
                    return Object.values(groupedRows).map(row => ({
                        ...row,
                        varyant_bilgisi: row.varyant_bilgisi.join(', ')
                    }));
                });



            return {
                siparislerGenel: siparislerGenel,
                kargoAdresi: kargoAdresi,
                faturaAdresi: faturaAdresi,
                siparislerAlt: siparislerAlt
            };
        } catch (error) {
            throw error;
        }
    }

    async durumCmsUpdate(req, res) {
        try {
            const siparis = await conMain('siparisler_genel')
                .where('id', req.params.id)
                .update({
                    durum: req.body.durum
                });

            return {
                status: 'success',
                message: 'Durum güncellendi'
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }


    async siparisErpAktar(req, res) {
        try {
            // Handle both cases: when req is an ID number or when it's a request object
            const siparisId = typeof req === 'object' ? req.params.id : req;

            const siparislerGenel = await conMain('siparisler_genel')
                .leftOuterJoin('musteriler', 'siparisler_genel.musteri_id', 'musteriler.id')
                .where('siparisler_genel.id', siparisId)
                .select('siparisler_genel.*', 'musteriler.kodu as musteri_kodu')
                .first();

            const siparislerAlt = await conMain('siparisler_alt')
                .where('siparis_id', siparisId)
                .select('*');

            let varyantListe = [];

            await Promise.all(siparislerAlt.map(async item => {
                const varyant = await conMain('urun_varyant')
                    .where({
                        id: item.varyant_id,
                        urun_id: item.urun_id
                    })
                    .first();

                let ozelFiyatMikroId = 0;
                try {
                    if (item.ozel_fiyat_id && item.ozel_fiyat_id > 0) {
                        const ozelFiyatMikroIdBul = await conMain('urun_ozel_fiyat_tanimlari')
                            .where('id', item.ozel_fiyat_id)
                            .select('entegre_id')
                            .first();
                        
                        if (ozelFiyatMikroIdBul && ozelFiyatMikroIdBul.entegre_id) {
                            ozelFiyatMikroId = ozelFiyatMikroIdBul.entegre_id;
                        }
                    }
                } catch (error) {
                    console.log(`Özel fiyat entegre_id alınırken hata oluştu (ozel_fiyat_id: ${item.ozel_fiyat_id}), 0 değeri kullanılacak:`, error.message);
                    ozelFiyatMikroId = 0;
                }

                varyantListe.push(
                    {
                        musteri_kodu: siparislerGenel.musteri_kodu,
                        siparis_no: siparislerGenel.siparis_no,
                        siparis_tarihi: siparislerGenel.create_date,
                        stok_kodu: varyant.stok_kodu,
                        miktar: item.miktar,
                        fiyat: item.fiyat || 0,
                        net_birim_fiyat: item.net_birim_fiyat || 0,
                        kdv_fiyat: item.kdv_fiyat || 0,
                        vergi_id: item.vergi_id || 0,
                        iskonto_tutari: item.iskonto_tutari || 0,
                        ozel_fiyat_id: ozelFiyatMikroId

                    }
                );
            }));

            const mikroResponse = await MikroServices.siparisErpAktar(varyantListe);

            if (mikroResponse.status === 'success') {
                const siparislerGenelUpdate = await conMain('siparisler_genel')
                    .where('id', siparisId)
                    .update({
                        erp_durum: 1,
                        erp_seri: 'BHRZ',
                        erp_sira: mikroResponse.data[0].pro_evrakno_sira,
                        durum: 2
                    });

                return {
                    status: 'success',
                    message: 'Sipariş başarıyla ERP sistemine aktarıldı'
                };

            } else {
                return {
                    status: 'error',
                    message: 'Bir hata oluştu: ' + mikroResponse.message
                };
            }


        } catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }


    async siparisUrunArama(req, res) {
        try {

            const musteriId = req.params.musteri_id;

            const musteri = await conMain('musteriler')
                .where('id', musteriId)
                .select('*').first();


            if (!musteri) {
                throw new Error('Müşteri bulunamadı');
            }

            const iskonto_yuzde = musteri.iskonto_yuzde;
            const fiyat_grup_id = musteri.fiyat_grup_id;


            const urunler = await conMain('urun_varyant as uv')
                .join('urun_ana_bilgileri as ana', 'uv.urun_id', 'ana.id')
                .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                .leftJoin('urun_resimleri as resim', function () {
                    this.on('ana.id', '=', 'resim.urun_id')
                        .andOn('uv.id', '=', 'resim.varyant_id')
                })
                .where(function () {
                    this.where('uv.varyant_urun_adi', 'like', '%' + req.params.arama + '%')
                        .orWhere('uv.stok_kodu', 'like', '%' + req.params.arama + '%')
                        .orWhere('alt.urun_adi', 'like', '%' + req.params.arama + '%');
                })
                .select([
                    'ana.id',
                    'ana.stok_kodu',
                    'ana.fiyat',
                    'ana.tip',
                    'alt.urun_adi',
                    'alt.urun_seo',
                    'resim.resim',
                    'uv.id as varyant_id',
                    'uv.varyant_urun_adi',
                    'uv.stok_kodu as varyant_stok_kodu',
                    'uv.fiyat as varyant_fiyat'
                ])
                .orderBy('ana.id', 'desc');



            if (urunler.length === 0) {
                return [];
            }

            // Get taxes, special prices and stock quantities for each product
            const urunlerWithDetails = await Promise.all(urunler.map(async (urun) => {

                const vergiler = await conMain('vergiler as v')
                    .leftJoin('urun_vergi_grup as uvg', 'v.id', 'uvg.vergi_id')
                    .where('uvg.urun_id', urun.id)
                    .where('uvg.varyant_id', urun.varyant_id)
                    .select('v.vergi_orani', 'v.vergi_adi')
                    .first() || { vergi_orani: 0 };


                const ozelFiyat = await conMain('urun_ozel_fiyat_grup')
                    .where('urun_id', urun.id)
                    .where('varyant_id', urun.varyant_id)
                    .where('ozel_fiyat_id', fiyat_grup_id)
                    .select('fiyat')
                    .first();


                const stokMiktarlari = await conMain('urun_stok_miktarlari')
                    .where('urun_id', urun.id)
                    .where('varyant_id', urun.varyant_id)
                    .select('miktar', 'yoldaki_miktar', 'uretim_miktar', 'miktar2')
                    .first() || { miktar: 0, yoldaki_miktar: 0, uretim_miktar: 0, miktar2: 0 };



                const basePrice = ozelFiyat ? ozelFiyat.fiyat : (urun.varyant_fiyat);

                const result = {
                    ...urun,
                    kdvsiz_fiyat: basePrice,
                    fiyat: iskonto_yuzde > 0
                        ? (basePrice * (1 - iskonto_yuzde / 100)) * (1 + vergiler.vergi_orani / 100)
                        : basePrice * (1 + vergiler.vergi_orani / 100),
                    vergi_orani: vergiler.vergi_orani,
                    vergi_adi: vergiler.vergi_adi,
                    stok_miktari: stokMiktarlari.miktar,
                    yoldaki_miktar: stokMiktarlari.yoldaki_miktar,
                    uretim_miktar: stokMiktarlari.uretim_miktar,
                    miktar2: stokMiktarlari.miktar2
                };

                return result;
            }));

            return urunlerWithDetails;

        } catch (error) {
            throw error;
        }
    }

    async siparisTopluExcelUrunListesi(req, res) {
        try {
            //console.log('=== Excel Oluşturma BAŞLADI ===');
            //console.log('Müşteri ID:', req.params.musteri_id);

            const musteriId = req.params.musteri_id;

            const musteri = await conMain('musteriler')
                .where('id', musteriId)
                .select('*').first();

            //console.log('Müşteri bulundu:', musteri ? 'Evet' : 'Hayır');

            if (!musteri) {
                throw new Error('Müşteri bulunamadı');
            }

            const iskonto_yuzde = musteri.iskonto_yuzde;
            const fiyat_grup_id = musteri.fiyat_grup_id;

            //console.log('İskonto yüzde:', iskonto_yuzde);
            //console.log('Fiyat grup ID:', fiyat_grup_id);

            /*  const urunler = await conMain('urun_varyant as uv')
                    .join('urun_ana_bilgileri as ana', 'uv.urun_id', 'ana.id')
                    .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                    .leftJoin('urun_resimleri as resim', function() {
                        this.on('uv.id', '=', 'resim.varyant_id')
                            .andOn('uv.id', '=', 'resim.varyant_id')
                    })
                    .select([
                        'ana.id',
                        'ana.stok_kodu',
                        'ana.fiyat',
                        'ana.tip',
                        'alt.urun_adi',
                        'alt.urun_seo',
                        'resim.resim',
                        'uv.id as varyant_id',
                        'uv.varyant_urun_adi',
                        'uv.stok_kodu as varyant_stok_kodu',
                        'uv.fiyat as varyant_fiyat'
                    ])
                    .orderBy('uv.stok_kodu', 'asc');
*/

            const urunler = await conMain('urun_varyant as uv')
                .join('urun_ana_bilgileri as ana', 'uv.urun_id', 'ana.id')
                .leftJoin('urun_alt_bilgileri as alt', 'ana.id', 'alt.id')
                .leftJoin(function () {
                    this.select('urun_id', 'varyant_id', conMain.raw('MIN(resim) as resim'))
                        .from('urun_resimleri')
                        .groupBy('urun_id', 'varyant_id')
                        .as('resim');
                }, function () {
                    this.on('ana.id', '=', 'resim.urun_id')
                        .andOn('uv.id', '=', 'resim.varyant_id');
                })
                .select([
                    'ana.id',
                    'ana.stok_kodu',
                    'ana.fiyat',
                    'ana.tip',
                    'alt.urun_adi',
                    'alt.urun_seo',
                    'resim.resim',
                    'uv.id as varyant_id',
                    'uv.varyant_urun_adi',
                    'uv.stok_kodu as varyant_stok_kodu',
                    'uv.fiyat as varyant_fiyat'
                ])
                .orderBy('uv.stok_kodu', 'asc');






            if (urunler.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Ürün bulunamadı'
                });
            }

            // Ürün ID'lerini ve varyant ID'lerini topla
            const urunIds = urunler.map(urun => urun.id);
            const varyantIds = urunler.map(urun => urun.varyant_id);

            // Toplu sorgular ile verileri çek
            const [vergiler, ozelFiyatlar, stokMiktarlari] = await Promise.all([
                // Vergileri toplu çek
                conMain('vergiler as v')
                    .leftJoin('urun_vergi_grup as uvg', 'v.id', 'uvg.vergi_id')
                    .whereIn('uvg.urun_id', urunIds)
                    .whereIn('uvg.varyant_id', varyantIds)
                    .select('v.vergi_orani', 'v.vergi_adi', 'uvg.urun_id', 'uvg.varyant_id'),

                // Özel fiyatları toplu çek
                conMain('urun_ozel_fiyat_grup')
                    .whereIn('urun_id', urunIds)
                    .whereIn('varyant_id', varyantIds)
                    .where('ozel_fiyat_id', fiyat_grup_id)
                    .select('fiyat', 'urun_id', 'varyant_id'),

                // Stok miktarlarını toplu çek
                conMain('urun_stok_miktarlari')
                    .whereIn('urun_id', urunIds)
                    .whereIn('varyant_id', varyantIds)
                    .select('miktar', 'yoldaki_miktar', 'uretim_miktar', 'miktar2', 'urun_id', 'varyant_id')
            ]);

            // Verileri hızlı erişim için map'lere dönüştür
            const vergiMap = new Map();
            vergiler.forEach(vergi => {
                const key = `${vergi.urun_id}-${vergi.varyant_id}`;
                vergiMap.set(key, vergi);
            });

            const ozelFiyatMap = new Map();
            ozelFiyatlar.forEach(fiyat => {
                const key = `${fiyat.urun_id}-${fiyat.varyant_id}`;
                ozelFiyatMap.set(key, fiyat);
            });

            const stokMap = new Map();
            stokMiktarlari.forEach(stok => {
                const key = `${stok.urun_id}-${stok.varyant_id}`;
                stokMap.set(key, stok);
            });

            // Ürünleri işle
            const urunlerWithDetails = urunler.map(urun => {
                const key = `${urun.id}-${urun.varyant_id}`;

                const vergi = vergiMap.get(key) || { vergi_orani: 0, vergi_adi: '' };
                const ozelFiyat = ozelFiyatMap.get(key);
                const stokMiktari = stokMap.get(key) || { miktar: 0, yoldaki_miktar: 0, uretim_miktar: 0, miktar2: 0 };

                const basePrice = ozelFiyat ? ozelFiyat.fiyat : (urun.varyant_fiyat);

                return {
                    ...urun,
                    kdvsiz_fiyat: basePrice,
                    fiyat: iskonto_yuzde > 0
                        ? (basePrice * (1 - iskonto_yuzde / 100)) * (1 + vergi.vergi_orani / 100)
                        : basePrice * (1 + vergi.vergi_orani / 100),
                    vergi_orani: vergi.vergi_orani,
                    vergi_adi: vergi.vergi_adi,
                    stok_miktari: stokMiktari.miktar,
                    yoldaki_miktar: stokMiktari.yoldaki_miktar,
                    uretim_miktar: stokMiktari.uretim_miktar,
                    miktar2: stokMiktari.miktar2
                };
            });

            // Excel dosyası oluştur
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Ürün Listesi');

            // Başlık satırını ayarla
            worksheet.columns = [
                { header: 'Image', key: 'resim', width: 5 },
                { header: 'Stock Code', key: 'stok_kodu', width: 30 },
                { header: 'Short Name', key: 'urun_adi', width: 15 },
                { header: 'Product Name', key: 'varyant_adi', width: 50 },
                // { header: 'Fiyat', key: 'fiyat', width: 15 },
                { header: 'In Stock', key: 'stok_miktari', width: 15 },
                { header: 'On The Way', key: 'yoldaki_miktar', width: 15 },
                { header: 'In Production', key: 'uretim_miktar', width: 15 },
                { header: 'Quantity In Box', key: 'miktar2', width: 15 },
                { header: 'Orderable Quantity', key: 'miktar', width: 15, hidden: true },
                { header: 'Order Quantity', key: 'duzeltilmis_miktar', width: 15 }
            ];

            // Worksheet'i koruma altına al (varsayılan olarak tüm hücreler korunur)
            worksheet.protect('', {
                selectLockedCells: true,
                selectUnlockedCells: true,
                formatCells: false,
                formatColumns: false,
                formatRows: false,
                insertColumns: false,
                insertRows: false,
                insertHyperlinks: false,
                deleteColumns: false,
                deleteRows: false,
                sort: true,
                autoFilter: true,
                pivotTables: true
            });

            // Başlık satırının stilini ayarla
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            // Başlık satırını da korunmuş yap
            worksheet.getRow(1).eachCell((cell, colNumber) => {
                cell.protection = { locked: true };
            });

            // Ürünleri Excel'e ekle
            for (let i = 0; i < urunlerWithDetails.length; i++) {
                const urun = urunlerWithDetails[i];
                const rowNumber = i + 2; // 1. satır başlık olduğu için 2'den başla



                // Satır ekle
                const row = worksheet.addRow({
                    resim: '',
                    stok_kodu: urun.varyant_stok_kodu || urun.stok_kodu,
                    urun_adi: urun.urun_adi,
                    varyant_adi: urun.varyant_urun_adi || '',
                    //  fiyat: urun.fiyat,
                    stok_miktari: Math.round(urun.stok_miktari || 0),
                    yoldaki_miktar: Math.round(urun.yoldaki_miktar || 0),
                    uretim_miktar: Math.round(urun.uretim_miktar || 0),
                    miktar2: Math.round(urun.miktar2 || 0),
                    miktar: '', // Kullanıcı dolduracak
                    duzeltilmis_miktar: '' // Formül ile düzeltilecek
                });

                // Tüm hücreleri korunmuş yap (sadece okunabilir)
                row.eachCell((cell, colNumber) => {
                    cell.protection = { locked: true };
                });

                // Sadece "Sipariş Miktarı" sütununu (J sütunu) düzenlenebilir yap
                const siparisMiktarCell = row.getCell('J');
                siparisMiktarCell.protection = { locked: false };

                // Satır renklerini ayarla (bir beyaz bir açık gri)
                if (i % 2 === 1) { // Tek indeksli satırlar (2, 4, 6, ...) açık gri
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF5F5F5' } // Açık gri
                    };
                } else { // Çift indeksli satırlar (1, 3, 5, ...) beyaz
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFFFF' } // Beyaz
                    };
                }

                // J sütununu (Sipariş Miktarı) yeşil yap ve yazıyı beyaz yap
                const jCell = row.getCell('J');
                jCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF228B22' } // Koyu Yeşil
                };
                jCell.font = {
                    color: { argb: 'FFFFFFFF' } // Beyaz
                };

                // Düzeltilmiş miktar sütununa formül ekle (koli miktarının katlarına göre otomatik düzeltme)
                const duzeltilmisMiktarCell = row.getCell('I'); // J sütunu düzeltilmiş miktar
                duzeltilmisMiktarCell.value = {
                    formula: `=IF(AND(J${rowNumber}<>"",H${rowNumber}>0),IF(MOD(J${rowNumber},H${rowNumber})=0,J${rowNumber},CEILING(J${rowNumber}/H${rowNumber},1)*H${rowNumber}),"")`
                };

                // Eğer resim varsa, Excel'e ekle
                if (urun.resim) {
                    try {
                        // Resim sütununun genişliğini ve satır yüksekliğini ayarla
                        worksheet.getColumn('A').width = 20;
                        worksheet.getRow(rowNumber).height = 45;

                        // Resmi base64'e çevir
                        const base64Image = await this.imageToBase64(urun.resim);

                        if (base64Image) {
                            // Dosya uzantısını belirle
                            const fileExtension = path.extname(urun.resim).toLowerCase().replace('.', '');
                            const extension = fileExtension === 'jpg' ? 'jpeg' : fileExtension;

                            // Resmi Excel'e ekle
                            const imageId = workbook.addImage({
                                base64: base64Image,
                                extension: extension,
                            });

                            worksheet.addImage(imageId, {
                                tl: { col: 0, row: rowNumber - 1 },
                                ext: { width: 60, height: 60 }
                            });
                        }
                    } catch (imageError) {
                        console.log('Resim eklenemedi:', urun.resim, imageError.message);
                    }
                }
            }

            // Fiyat sütunlarını para formatında ayarla
            //worksheet.getColumn('fiyat').numFmt = '#,##0.00$';
            worksheet.getColumn('miktar2').numFmt = '0';
            worksheet.getColumn('stok_miktari').numFmt = '0';
            worksheet.getColumn('yoldaki_miktar').numFmt = '0';
            worksheet.getColumn('uretim_miktar').numFmt = '0';

            // Response headers'ı ayarla
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=urun-listesi.xlsx');

            // Excel dosyasını response olarak gönder
            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error('Excel oluşturma hatası:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Excel dosyası oluşturulamadı: ' + error.message
            });
        }
    }

    async siparisTopluExcelUrunEkle(req, res) {
        try {
            //console.log('=== TOPLU ÜRÜN EKLEME BAŞLADI ===');
            //console.log('Request params:', req.params);
            //console.log('Request headers:', req.headers);
            //console.log('Request body:', req.body);
            //console.log('Request file:', req.file);
            //console.log('Request files:', req.files);

            const file = req.file;
            //console.log('Uploaded file:', file);

            if (!file) {
                //console.log('Dosya bulunamadı!');
                return {
                    status: 'error',
                    message: 'Dosya yüklenmedi'
                };
            }

            //console.log('File details:');
            //console.log('- Original name:', file.originalname);
            //console.log('- Mimetype:', file.mimetype);
            //console.log('- Size:', file.size);
            //console.log('- Buffer length:', file.buffer ? file.buffer.length : 'No buffer');

            // Dosya türünü kontrol et
            if (!file.mimetype.includes('spreadsheet') &&
                !file.mimetype.includes('excel') &&
                !file.originalname.endsWith('.xlsx') &&
                !file.originalname.endsWith('.xls')) {
                //console.log('Geçersiz dosya türü:', file.mimetype);
                return {
                    status: 'error',
                    message: 'Sadece Excel dosyaları (.xlsx, .xls) kabul edilir'
                };
            }

            //console.log('Excel dosyası okunuyor...');
            // Excel dosyasını oku
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer);

            const worksheet = workbook.getWorksheet(1); // İlk worksheet'i al
            if (!worksheet) {
                //console.log('Worksheet bulunamadı!');
                return {
                    status: 'error',
                    message: 'Excel dosyasında worksheet bulunamadı'
                };
            }

            //console.log('Worksheet bulundu, satır sayısı:', worksheet.rowCount);

            const musteriId = req.params.musteri_id;
            const urunler = [];

            // Excel'den verileri oku (başlık satırını atla)
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) { // İlk satır başlık olduğu için 2. satırdan başla
                    const stokKodu = row.getCell('B').value; // Stok Kodu sütunu
                    const miktar = row.getCell('I').result; // Miktar sütunu (formül sonucu)

                    // console.log(`Satır ${rowNumber}: Stok Kodu = ${stokKodu}, Miktar = ${miktar}`);

                    if (stokKodu && miktar && miktar > 0) {
                        urunler.push({
                            stokKodu: stokKodu.toString(),
                            miktar: parseInt(miktar)
                        });
                    }
                }
            });

            //console.log('Excel\'den okunan ürünler:', urunler);

            if (urunler.length === 0) {
                //console.log('Geçerli ürün bulunamadı!');
                return {
                    status: 'error',
                    message: 'Excel dosyasında geçerli ürün bulunamadı'
                };
            }

            //console.log('Ürünler sepete ekleniyor...');
            // Ürünleri sepete ekle
            const eklenenUrunler = [];
            const hataliUrunler = [];

            for (const urun of urunler) {
                try {
                    //console.log(`Ürün işleniyor: ${urun.stokKodu}`);
                    // Ürünü veritabanından bul
                    const urunBilgisi = await conMain('urun_varyant as uv')
                        .join('urun_ana_bilgileri as ana', 'uv.urun_id', 'ana.id')
                        .where('uv.stok_kodu', urun.stokKodu)
                        .orWhere('ana.stok_kodu', urun.stokKodu)
                        .select([
                            'ana.id as urun_id',
                            'uv.id as varyant_id',
                            'uv.stok_kodu as varyant_stok_kodu',
                            'ana.stok_kodu as ana_stok_kodu'
                        ])
                        .first();

                    if (urunBilgisi) {
                        //console.log(`Ürün bulundu: ${urun.stokKodu}`);

                        // Stok miktarı bilgilerini al
                        const stokMiktari = await conMain('urun_stok_miktarlari')
                            .where('urun_id', urunBilgisi.urun_id)
                            .where('varyant_id', urunBilgisi.varyant_id)
                            .select('miktar2')
                            .first();

                        // Koli adeti kontrolü (miktar2)
                        const koliAdeti = stokMiktari ? stokMiktari.miktar2 : 1;

                        // Miktarın koli adetinin katı olup olmadığını kontrol et
                        if (koliAdeti > 0 && urun.miktar % koliAdeti !== 0) {
                            hataliUrunler.push({
                                stokKodu: urun.stokKodu,
                                hata: `Miktar (${urun.miktar}) koli adetinin (${koliAdeti * 1}) katı değil. Geçerli miktarlar: ${koliAdeti * 1}, ${koliAdeti * 2}, ${koliAdeti * 3}, ...`
                            });
                            continue; // Bu ürünü atla ve bir sonrakine geç
                        }

                        // Sepete ekle
                        const sepetItem = await conMain('sepet')
                            .where('musteri_id', musteriId)
                            .where('urun_id', urunBilgisi.urun_id)
                            .where('varyant_id', urunBilgisi.varyant_id)
                            .first();

                        if (sepetItem) {
                            //console.log(`Mevcut ürün güncelleniyor: ${urun.stokKodu}`);
                            // Mevcut ürünü güncelle
                            await conMain('sepet')
                                .where('id', sepetItem.id)
                                .update({
                                    miktar: urun.miktar
                                });
                        } else {
                            //console.log(`Yeni ürün ekleniyor: ${urun.stokKodu}`);
                            // Yeni ürün ekle
                            await conMain('sepet').insert({
                                cartId: req.params.cart_id,
                                musteri_id: musteriId,
                                urun_id: urunBilgisi.urun_id,
                                varyant_id: urunBilgisi.varyant_id,
                                vergi_id: 0,
                                miktar: urun.miktar,
                            });
                        }

                        eklenenUrunler.push({
                            stokKodu: urun.stokKodu,
                            miktar: urun.miktar,
                            koliAdeti: koliAdeti
                        });
                    } else {
                        //console.log(`Ürün bulunamadı: ${urun.stokKodu}`);
                        hataliUrunler.push({
                            stokKodu: urun.stokKodu,
                            hata: 'Ürün bulunamadı'
                        });
                    }
                } catch (error) {
                    //console.error(`Ürün ekleme hatası (${urun.stokKodu}):`, error);
                    hataliUrunler.push({
                        stokKodu: urun.stokKodu,
                        hata: 'Ürün eklenirken hata oluştu'
                    });
                }
            }

            // console.log('İşlem tamamlandı!');
            // console.log('- Eklenen ürünler:', eklenenUrunler.length);
            // console.log('- Hatalı ürünler:', hataliUrunler.length);

            return {
                status: 'success',
                message: `${eklenenUrunler.length} ürün başarıyla sepete eklendi`,
                data: {
                    eklenenUrunler,
                    hataliUrunler,
                    toplamEklenen: eklenenUrunler.length,
                    toplamHatali: hataliUrunler.length
                }
            };

        } catch (error) {
            console.error('Toplu ürün ekleme hatası:', error);
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    async siparisTopluExcelUrunEkleCms(req, res) {
        try {
            //console.log('=== TOPLU ÜRÜN EKLEME BAŞLADI ===');
            //console.log('Request params:', req.params);
            //console.log('Request headers:', req.headers);
            //console.log('Request body:', req.body);
            //console.log('Request file:', req.file);
            //console.log('Request files:', req.files);

            const file = req.file;
            //console.log('Uploaded file:', file);

            if (!file) {
                //console.log('Dosya bulunamadı!');
                return {
                    status: 'error',
                    message: 'Dosya yüklenmedi'
                };
            }

            //console.log('File details:');
            //console.log('- Original name:', file.originalname);
            //console.log('- Mimetype:', file.mimetype);
            //console.log('- Size:', file.size);
            //console.log('- Buffer length:', file.buffer ? file.buffer.length : 'No buffer');

            // Dosya türünü kontrol et
            if (!file.mimetype.includes('spreadsheet') &&
                !file.mimetype.includes('excel') &&
                !file.originalname.endsWith('.xlsx') &&
                !file.originalname.endsWith('.xls')) {
                //console.log('Geçersiz dosya türü:', file.mimetype);
                return {
                    status: 'error',
                    message: 'Sadece Excel dosyaları (.xlsx, .xls) kabul edilir'
                };
            }

            //console.log('Excel dosyası okunuyor...');
            // Excel dosyasını oku
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer);

            const worksheet = workbook.getWorksheet(1); // İlk worksheet'i al
            if (!worksheet) {
                //console.log('Worksheet bulunamadı!');
                return {
                    status: 'error',
                    message: 'Excel dosyasında worksheet bulunamadı'
                };
            }

            //console.log('Worksheet bulundu, satır sayısı:', worksheet.rowCount);

            const musteriId = req.params.musteri_id;
            const urunler = [];

            // Excel'den verileri oku (başlık satırını atla)
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) { // İlk satır başlık olduğu için 2. satırdan başla
                    const stokKodu = row.getCell('B').value; // Stok Kodu sütunu
                    const miktar = row.getCell('I').result; // Miktar sütunu (formül sonucu)

                    // console.log(`Satır ${rowNumber}: Stok Kodu = ${stokKodu}, Miktar = ${miktar}`);

                    if (stokKodu && miktar && miktar > 0) {
                        urunler.push({
                            stokKodu: stokKodu.toString(),
                            miktar: parseInt(miktar)
                        });
                    }
                }
            });

            //console.log('Excel\'den okunan ürünler:', urunler);

            if (urunler.length === 0) {
                //console.log('Geçerli ürün bulunamadı!');
                return {
                    status: 'error',
                    message: 'Excel dosyasında geçerli ürün bulunamadı'
                };
            }


            const musteriBilgileri = await conMain('musteriler')
                .where('id', musteriId)
                .select('fiyat_grup_id', 'iskonto_yuzde')
                .first();

            //console.log('Ürünler sepete ekleniyor...');
            // Ürünleri sepete ekle
            const eklenenUrunler = [];
            const hataliUrunler = [];

            for (const urun of urunler) {
                try {
                    //console.log(`Ürün işleniyor: ${urun.stokKodu}`);
                    // Ürünü veritabanından bul
                    const urunBilgisi = await conMain('urun_varyant as uv')
                        .join('urun_ana_bilgileri as ana', 'uv.urun_id', 'ana.id')
                        .join('urun_alt_bilgileri as alt', 'uv.urun_id', 'alt.id')
                        .leftJoin('urun_resimleri as resim', function () {
                            this.on('ana.id', '=', 'resim.urun_id')
                                .andOn('uv.id', '=', 'resim.varyant_id')
                        })
                        .where('uv.stok_kodu', urun.stokKodu)
                        .select([
                            'ana.id as urun_id',
                            'uv.id as varyant_id',
                            'uv.stok_kodu as varyant_stok_kodu',
                            'ana.stok_kodu as ana_stok_kodu',
                            'uv.varyant_urun_adi as varyant_urun_adi',
                            'uv.fiyat as varyant_fiyat',
                            'resim.resim as resim',
                            'alt.urun_adi as urun_adi'
                        ])
                        .first();

                    if (urunBilgisi) {

                        // Stok miktarı bilgilerini al
                        const stokMiktari = await conMain('urun_stok_miktarlari')
                            .where('urun_id', urunBilgisi.urun_id)
                            .where('varyant_id', urunBilgisi.varyant_id)
                            .select('miktar2', 'miktar', 'yoldaki_miktar', 'uretim_miktar')
                            .first();

                        const vergiler = await conMain('vergiler as v')
                            .leftJoin('urun_vergi_grup as uvg', 'v.id', 'uvg.vergi_id')
                            .where('uvg.urun_id', urunBilgisi.urun_id)
                            .where('uvg.varyant_id', urunBilgisi.varyant_id)
                            .select('v.vergi_orani', 'v.vergi_adi')
                            .first() || { vergi_orani: 0 };



                        const ozelFiyat = await conMain('urun_ozel_fiyat_grup')
                            .where('urun_id', urunBilgisi.urun_id)
                            .where('varyant_id', urunBilgisi.varyant_id)
                            .where('ozel_fiyat_id', musteriBilgileri.fiyat_grup_id)
                            .select('fiyat')
                            .first();

                        const basePrice = ozelFiyat ? ozelFiyat.fiyat : (urunBilgisi.varyant_fiyat);



                        // Koli adeti kontrolü (miktar2)
                        const koliAdeti = stokMiktari ? stokMiktari.miktar2 : 1;



                        // Miktarın koli adetinin katı olup olmadığını kontrol et
                        if (koliAdeti > 0 && urun.miktar % koliAdeti !== 0) {
                            hataliUrunler.push({
                                stokKodu: urun.stokKodu,
                                hata: `Miktar (${urun.miktar}) koli adetinin (${koliAdeti * 1}) katı değil. Geçerli miktarlar: ${koliAdeti * 1}, ${koliAdeti * 2}, ${koliAdeti * 3}, ...`
                            });
                            continue; // Bu ürünü atla ve bir sonrakine geç
                        }


                        eklenenUrunler.push({
                            resim: urunBilgisi.resim,
                            varyant_stok_kodu: urun.stokKodu,
                            miktar: urun.miktar,
                            miktar2: koliAdeti,
                            varyant_urun_adi: urunBilgisi.varyant_urun_adi,
                            stok_miktari: stokMiktari.miktar,
                            yoldaki_miktar: stokMiktari.yoldaki_miktar,
                            uretim_miktar: stokMiktari.uretim_miktar,
                            fiyat: musteriBilgileri.iskonto_yuzde > 0
                                ? (basePrice * (1 - musteriBilgileri.iskonto_yuzde / 100)) * (1 + vergiler.vergi_orani / 100)
                                : basePrice * (1 + vergiler.vergi_orani / 100),
                            id: urunBilgisi.urun_id,
                            stok_kodu: urunBilgisi.ana_stok_kodu,
                            urun_adi: urunBilgisi.urun_adi,
                            resim: urunBilgisi.resim,
                            net_birim_fiyat: basePrice,
                            kdv_orani: vergiler.vergi_orani,
                            varyant_urun_adi: urunBilgisi.varyant_urun_adi,
                            varyant_stok_kodu: urunBilgisi.varyant_stok_kodu,
                            indirimli_fiyat: basePrice,
                            varyant_id: urunBilgisi.varyant_id,
                            vergi_orani: vergiler.vergi_orani,
                            vergi_adi: vergiler.vergi_adi,
                        });

                    } else {
                        //console.log(`Ürün bulunamadı: ${urun.stokKodu}`);
                        hataliUrunler.push({
                            stokKodu: urun.stokKodu,
                            hata: 'Ürün bulunamadı'
                        });
                    }
                } catch (error) {
                    console.error(`Ürün ekleme hatası (${urun.stokKodu}):`, error);
                    hataliUrunler.push({
                        stokKodu: urun.stokKodu,
                        hata: 'Ürün eklenirken hata oluştu'
                    });
                }
            }

            // console.log('İşlem tamamlandı!');
            // console.log('- Eklenen ürünler:', eklenenUrunler.length);
            // console.log('- Hatalı ürünler:', hataliUrunler.length);

            return {
                status: 'success',
                message: `${eklenenUrunler.length} ürün başarıyla eklendi`,
                data: {
                    eklenenUrunler,
                    hataliUrunler,
                    toplamEklenen: eklenenUrunler.length,
                    toplamHatali: hataliUrunler.length
                }
            };

        } catch (error) {
            console.error('Toplu ürün ekleme hatası:', error);
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    // Toplu irsaliye kontrol - tüm sipariş numaralarını tek seferde kontrol eder
    // Eski N×7 MSSQL sorgusu yerine sadece 4 sorgu atar
    async siparisIrsaliyeTopluKontrol(siparisNolar) {
        try {
            if (!siparisNolar || siparisNolar.length === 0) {
                return { mu1Set: new Set(), mu2Set: new Set() };
            }

            // 1) Tüm sipariş numaraları için proforma GUID'lerini tek seferde al
            const proformaGuids = await conMainMssql('PROFORMA_SIPARISLER')
                .select('pro_Guid', 'pro_belge_no')
                .whereIn('pro_belge_no', siparisNolar);

            if (proformaGuids.length === 0) {
                return { mu1Set: new Set(), mu2Set: new Set() };
            }

            // pro_Guid -> siparis_no eşleştirmesi
            const proGuidToSiparisNo = {};
            proformaGuids.forEach(item => {
                proGuidToSiparisNo[item.pro_Guid] = item.pro_belge_no;
            });

            const proGuids = proformaGuids.map(item => item.pro_Guid);

            // 2) Tüm sipariş GUID'lerini tek seferde al
            const siparisGuids = await conMainMssql('SIPARISLER')
                .select('sip_Guid', 'sip_prosip_uid')
                .whereIn('sip_prosip_uid', proGuids);

            if (siparisGuids.length === 0) {
                return { mu1Set: new Set(), mu2Set: new Set() };
            }

            // sip_Guid -> pro_Guid eşleştirmesi
            const sipGuidToProGuid = {};
            siparisGuids.forEach(item => {
                sipGuidToProGuid[item.sip_Guid] = item.sip_prosip_uid;
            });

            const sipGuids = siparisGuids.map(item => item.sip_Guid);

            // 3) Tüm stok hareketlerini tek seferde al (mssql1)
            const stokHareketleri = await conMainMssql('STOK_HAREKETLERI')
                .select('sth_sip_uid', 'sth_evrakno_seri', 'sth_evrakno_sira')
                .whereIn('sth_sip_uid', sipGuids);

            // mu1: stok hareketi bulunan sipariş numaraları
            const mu1Set = new Set();
            // Her sipariş no için ilk bulunan evrak bilgisini sakla (mu2 kontrolü için)
            const evrakBySiparisNo = {};

            stokHareketleri.forEach(sth => {
                const proGuid = sipGuidToProGuid[sth.sth_sip_uid];
                if (proGuid) {
                    const siparisNo = proGuidToSiparisNo[proGuid];
                    if (siparisNo) {
                        mu1Set.add(siparisNo);
                        if (!evrakBySiparisNo[siparisNo]) {
                            evrakBySiparisNo[siparisNo] = {
                                sth_evrakno_seri: sth.sth_evrakno_seri,
                                sth_evrakno_sira: sth.sth_evrakno_sira
                            };
                        }
                    }
                }
            });

            // 4) mu2 kontrolü: mu1'de bulunanların evrak bilgilerini mssql2'de kontrol et
            const mu2Set = new Set();

            if (mu1Set.size > 0) {
                // Benzersiz evrak çiftlerini topla
                const uniquePairs = [];
                const seenPairs = new Set();
                Object.entries(evrakBySiparisNo).forEach(([siparisNo, pair]) => {
                    const key = `${pair.sth_evrakno_seri}|${pair.sth_evrakno_sira}`;
                    if (!seenPairs.has(key)) {
                        seenPairs.add(key);
                        uniquePairs.push(pair);
                    }
                });

                // Tüm evrak çiftlerini tek sorguda mssql2'de kontrol et
                const stokHareketleri2 = await conMainMssql2('STOK_HAREKETLERI')
                    .select('sth_evrakno_seri', 'sth_evrakno_sira')
                    .where(function () {
                        uniquePairs.forEach(pair => {
                            this.orWhere({
                                'sth_evrakno_seri': pair.sth_evrakno_seri,
                                'sth_evrakno_sira': pair.sth_evrakno_sira
                            });
                        });
                    });

                // Bulunan evrak çiftlerini set'e ekle
                const foundPairs = new Set();
                stokHareketleri2.forEach(sth => {
                    foundPairs.add(`${sth.sth_evrakno_seri}|${sth.sth_evrakno_sira}`);
                });

                // Sipariş no'larına geri eşleştir
                Object.entries(evrakBySiparisNo).forEach(([siparisNo, pair]) => {
                    const key = `${pair.sth_evrakno_seri}|${pair.sth_evrakno_sira}`;
                    if (foundPairs.has(key)) {
                        mu2Set.add(siparisNo);
                    }
                });
            }

            return { mu1Set, mu2Set };
        } catch (error) {
            console.log(error);
            return { mu1Set: new Set(), mu2Set: new Set() };
        }
    }

    async siparisIrsaliyeDonumusMu1(siparisNo) {
        try {
            // Önce proforma siparişlerin GUID'lerini alalım
            const proformaGuids = await conMainMssql('PROFORMA_SIPARISLER')
                .select('pro_Guid')
                .where('pro_belge_no', siparisNo);

            // Bu GUID'ler ile siparişlerin GUID'lerini alalım
            const proGuids = proformaGuids.map(item => item.pro_Guid);
            const siparisGuids = await conMainMssql('SIPARISLER')
                .select('sip_Guid')
                .whereIn('sip_prosip_uid', proGuids);

            const sipGuids = siparisGuids.map(item => item.sip_Guid);
            let stokHareketleri = await conMainMssql('STOK_HAREKETLERI')
                .select('sth_evrakno_seri', 'sth_evrakno_sira')
                .whereIn('sth_sip_uid', sipGuids)
                .first();

            if (!stokHareketleri) {
                return false;
            }


            if (stokHareketleri) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async siparisIrsaliyeDonumusMu2(siparisNo) {
        try {
            // Önce proforma siparişlerin GUID'lerini alalım
            const proformaGuids = await conMainMssql('PROFORMA_SIPARISLER')
                .select('pro_Guid')
                .where('pro_belge_no', siparisNo);

            // Bu GUID'ler ile siparişlerin GUID'lerini alalım
            const proGuids = proformaGuids.map(item => item.pro_Guid);
            const siparisGuids = await conMainMssql('SIPARISLER')
                .select('sip_Guid')
                .whereIn('sip_prosip_uid', proGuids);

            const sipGuids = siparisGuids.map(item => item.sip_Guid);
            let stokHareketleri = await conMainMssql('STOK_HAREKETLERI')
                .select('sth_evrakno_seri', 'sth_evrakno_sira')
                .whereIn('sth_sip_uid', sipGuids)
                .first();

            if (!stokHareketleri) {
                return false;
            }

            // Sipariş GUID'leri ile stok hareketlerinden evrak bilgilerini alalım - Önce conMainMssql2'de ara
            const sipGuids1 = siparisGuids.map(item => item.sip_Guid);
            let stokHareketleri1 = await conMainMssql2('STOK_HAREKETLERI')
                .select('sth_evrakno_seri', 'sth_evrakno_sira')
                .where({
                    'sth_evrakno_seri': stokHareketleri.sth_evrakno_seri,
                    'sth_evrakno_sira': stokHareketleri.sth_evrakno_sira
                });

            if (!stokHareketleri1) {
                return false;
            }

            if (stokHareketleri1.length > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }

}

export default new SiparislerServices;