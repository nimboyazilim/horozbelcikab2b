import conMain from "../config/database.mjs";
import conMainMssql2 from "../config/databaseMssql2.mjs";

class DashboardServices {

    tarihFiltreleri = {
        bugun: 'DATE(sg.create_date) = CURDATE()',
        buhafta: 'YEARWEEK(sg.create_date, 1) = YEARWEEK(CURDATE(), 1)',
        buay: 'YEAR(sg.create_date) = YEAR(CURDATE()) AND MONTH(sg.create_date) = MONTH(CURDATE())',
        buyil: 'YEAR(sg.create_date) = YEAR(CURDATE())',
        tumzamanlar: ''
    }

    tarihFiltreleri2 = {
        bugun: 'CAST(chh.cha_tarihi AS DATE) = CAST(GETDATE() AS DATE)',
        buhafta: 'DATEPART(WEEK, chh.cha_tarihi) = DATEPART(WEEK, GETDATE()) AND DATEPART(YEAR, chh.cha_tarihi) = DATEPART(YEAR, GETDATE())',
        buay: 'YEAR(chh.cha_tarihi) = YEAR(GETDATE()) AND MONTH(chh.cha_tarihi) = MONTH(GETDATE())',
        buyil: 'YEAR(chh.cha_tarihi) = YEAR(GETDATE())',
        tumzamanlar: ''
    }
    
    async satislarToplamEski(req, res) {
        try {
            const tarih = req.params.tarih;
            let query = conMain('siparisler_genel as sg')
                .select(conMain.raw('COALESCE(SUM(sa.fiyat), 0) as toplam_satis'))
                .leftJoin('siparisler_alt as sa', 'sg.id', 'sa.siparis_id')
                .where('sg.durum', 1)
                .whereNotNull('sa.fiyat');

            // Tarih filtresi ekle
            if (this.tarihFiltreleri[tarih]) {
                query.whereRaw(this.tarihFiltreleri[tarih]);
            }

            const satislar = await query;

            return {
                status: 'success',
                message: 'Satışlar başarıyla getirildi',
                data: parseFloat(satislar[0].toplam_satis || 0)
            }
        } catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    async satislarToplam(req, res) {
        try {
            const tarih = req.params.tarih;
            let query = conMainMssql2('CARI_HESAP_HAREKETLERI as chh')
                .select(conMain.raw('COALESCE(SUM(chh.cha_meblag), 0) as toplam_satis'))
                .where('chh.cha_evrak_tip', '=', 63)
                .where('chh.cha_cinsi', '=', 6)
                .where('chh.cha_tip', '=', 0)
                .where('chh.cha_normal_Iade', '=', 0)

            // Tarih filtresi ekle
            if (this.tarihFiltreleri2[tarih]) {
                query.whereRaw(this.tarihFiltreleri2[tarih]);
            }

            const satislar = await query;

            return {
                status: 'success',
                message: 'Satışlar başarıyla getirildi',
                data: parseFloat(satislar[0].toplam_satis || 0)
            }
        } catch (error) {
            console.log(error);
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    async siparislerToplam(req, res) {
        try {
            const tarih = req.params.tarih;
            let query = conMain('siparisler_genel as sg')
                .select(conMain.raw('COALESCE(SUM(sa.fiyat), 0) as toplam_satis'))
                .leftJoin('siparisler_alt as sa', 'sg.id', 'sa.siparis_id')
                .whereNotNull('sa.fiyat');

            // Tarih filtresi ekle
            if (this.tarihFiltreleri[tarih]) {
                query.whereRaw(this.tarihFiltreleri[tarih]);
            }

            const satislar = await query;

            return {
                status: 'success',
                message: 'Satışlar başarıyla getirildi',
                data: parseFloat(satislar[0].toplam_satis || 0)
            }
        } catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    async sepetlerToplam(req, res) {
        try {
            const tarih = req.params.tarih;
            let query = conMain('sepet as s')
                .select(conMain.raw('COALESCE(SUM(uv.fiyat), 0) as toplam_satis'))
                .leftJoin('urun_varyant as uv', 's.varyant_id', 'uv.id')
                .whereNotNull('uv.fiyat');

            // Tarih filtresi ekle
            if (this.tarihFiltreleri[tarih]) {
                query.whereRaw(this.tarihFiltreleri[tarih]);
            }

            const sepetler = await query;

            return {
                status: 'success',
                message: 'Sepetler başarıyla getirildi',
                data: parseFloat(sepetler[0].toplam_satis || 0) 
            }
        } catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };  
        }
    }

    async enCokSatilanUrunler(req, res) {
        try {
            const tarih = req.params.tarih;
            let query = conMain('siparisler_genel as sg')
                .select([
                    'uab.urun_adi',
                    conMain.raw('SUM(sa.miktar) as toplam_miktar'),
                    conMain.raw('SUM(sa.fiyat) as toplam_satis')
                ])
                .leftJoin('siparisler_alt as sa', 'sg.id', 'sa.siparis_id')
                .leftJoin('urun_alt_bilgileri as uab', 'sa.urun_id', 'uab.id')
                .whereNotNull('sa.fiyat')
                .groupBy('sa.urun_id', 'uab.urun_adi')
                .orderBy('toplam_miktar', 'desc')
                .limit(10);

            // Tarih filtresi ekle
            if (this.tarihFiltreleri[tarih]) {
                query.whereRaw(this.tarihFiltreleri[tarih]);
            }

            const enCokSatilanUrunler = await query;

            return {
                status: 'success',
                message: 'En çok satılan ürünler başarıyla getirildi',
                data: enCokSatilanUrunler
            }
        } catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }
    

    async sonAlinanSiparisler(req, res) {
        try {
            let query = conMain('siparisler_genel as sg')
                .select([
                    'sg.id',
                    'sg.musteri_id',
                    'sg.create_date',
                    'sg.siparis_no',
                    'm.ad',
                    'm.soyad',
                    conMain.raw('SUM(sa.fiyat) as toplam_tutar')
                ])
                .leftJoin('siparisler_alt as sa', 'sg.id', 'sa.siparis_id')
                .leftJoin('musteriler as m', 'sg.musteri_id', 'm.id')
                .groupBy('sg.id', 'sg.musteri_id', 'sg.create_date', 'sg.siparis_no', 'm.ad', 'm.soyad')
                .orderBy('sg.create_date', 'desc')
                .limit(10);

            const sonAlinanSiparisler = await query;

            return {
                status: 'success',
                message: 'Son alınan siparişler başarıyla getirildi',
                data: sonAlinanSiparisler
            }
        } catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }


    async istatistikler(req, res) {
        try {
            const toplamUrunSayisi = await conMain('urun_ana_bilgileri').count('* as count').then(result => result[0].count);
            const toplamMusteriSayisi = await conMain('musteriler').count('* as count').then(result => result[0].count);
            const toplamStokAdedi = await conMain('urun_stok_miktarlari')
                .sum('miktar as toplam')
                .whereNotNull('miktar')
                .where('varyant_id', '=', 0)
                .then(result => parseFloat(result[0].toplam || 0));
            const toplamKategoriSayisi = await conMain('kategoriler').count('* as count').then(result => result[0].count);

            return {
                status: 'success',
                message: 'İstatistikler başarıyla getirildi',
                data: {
                    toplamUrunSayisi,
                    toplamMusteriSayisi,
                    toplamStokAdedi,
                    toplamKategoriSayisi
                }
            }
        } catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }
    

    async grafik1(req, res) {
        try {
            const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                          'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

            const query = await conMain('siparisler_genel as sg')
                .select([
                    conMain.raw('MONTH(sg.create_date) as ay'),
                    conMain.raw('SUM(CASE WHEN sg.durum = 1 THEN sa.fiyat ELSE 0 END) as satis'),
                    conMain.raw('SUM(sa.fiyat) as siparis')
                ])
                .leftJoin('siparisler_alt as sa', 'sg.id', 'sa.siparis_id')
                .whereRaw('YEAR(sg.create_date) = YEAR(CURDATE())')
                .groupBy(conMain.raw('MONTH(sg.create_date)'))
                .orderBy('ay');

            const sonuclar = await query;
            
            // Veritabanı sonuçlarını ay numarasına göre map'e dönüştür
            const ayVerileri = new Map();
            sonuclar.forEach(row => {
                ayVerileri.set(row.ay, {
                    satis: parseFloat(row.satis || 0),
                    siparis: parseFloat(row.siparis || 0)
                });
            });

            // Tüm aylar için veri oluştur
            const grafik1 = aylar.map((ay, index) => ({
                month: ay,
                satis: (ayVerileri.get(index + 1) || { satis: 0 }).satis,
                siparis: (ayVerileri.get(index + 1) || { siparis: 0 }).siparis
            }));

            return {
                status: 'success',
                message: 'Grafik 1 başarıyla getirildi',
                data: grafik1
            }
        }
        catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }
    



}

export default new DashboardServices;