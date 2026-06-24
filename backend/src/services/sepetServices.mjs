import conMain from "../config/database.mjs";

class SepetServices {


    async getSepet(req, res) {
        try {
            const iskonto_yuzde = req.locals.user.iskonto_yuzde;
            const fiyat_grup_id = req.locals.user.fiyat_grup_id;
            // Önce sepetteki ürünleri al
            const sepet = await conMain('sepet')
                .select(
                    'sepet.*',
                    conMain.raw('COALESCE(urun_varyant.stok_kodu, urun_ana_bilgileri.stok_kodu) as stok_kodu'),
                    conMain.raw('COALESCE(urun_varyant.varyant_urun_adi) as varyant_urun_adi'),
                    conMain.raw('COALESCE(urun_varyant.fiyat, urun_ana_bilgileri.fiyat) as fiyat'),
                    'urun_alt_bilgileri.urun_adi',
                    'urun_alt_bilgileri.urun_seo',
                )
                .leftJoin('urun_varyant', 'sepet.varyant_id', 'urun_varyant.id')
                .leftJoin('urun_alt_bilgileri', 'sepet.urun_id', 'urun_alt_bilgileri.id')
                .leftJoin('urun_ana_bilgileri', 'urun_alt_bilgileri.id', 'urun_ana_bilgileri.id')
                .where({
                    'sepet.musteri_id': req.params.musteri_id
                });



            // Her sepet ürünü için varyant detaylarını al
            const sepetWithDetails = await Promise.all(sepet.map(async (sepetItem) => {
                // Vergi satırı kontrolü
                /*  if (sepetItem.vergi_id > 0) {
                      return {
                          ...sepetItem,
                          urun_adi: sepetItem.vergi_kodu, // Vergi kodu, ürün adı olarak gösterilecek
                          fiyat: sepetItem.vergi_fiyat, // Verginin fiyatı
                          isVergi: true
                      };
                  } */


                let vergiler = await conMain('vergiler as v')
                    .leftJoin('urun_vergi_grup as uvg', 'v.id', 'uvg.vergi_id')
                    .where('uvg.urun_id', sepetItem.urun_id)
                    .where('uvg.varyant_id', sepetItem.varyant_id)
                    .select('v.vergi_orani', 'v.vergi_adi').first();

                if (!vergiler) {
                    vergiler = await conMain('vergiler')
                        .where('id', 4)
                        .select('vergi_orani', 'vergi_adi')
                        .first();
                }



                const ozelFiyat = await conMain('urun_ozel_fiyat_grup')
                    .where('urun_id', sepetItem.urun_id)
                    .where('varyant_id', sepetItem.varyant_id)
                    .where('ozel_fiyat_id', fiyat_grup_id)
                    .select('fiyat').first();


                sepetItem.birim_fiyat = ozelFiyat ? ozelFiyat.fiyat : sepetItem.fiyat;
                sepetItem.indirimli_fiyat = iskonto_yuzde > 0 ? ozelFiyat ? (ozelFiyat.fiyat) * (1 - iskonto_yuzde / 100) * (1 + vergiler.vergi_orani / 100) : (sepetItem.fiyat) * (1 - iskonto_yuzde / 100) * (1 + vergiler.vergi_orani / 100) : 0;

                sepetItem.fiyat = ozelFiyat ? (ozelFiyat.fiyat) * (1 + vergiler.vergi_orani / 100) : (sepetItem.fiyat) * (1 + vergiler.vergi_orani / 100);


                sepetItem.kdv_fiyat = ((sepetItem.birim_fiyat * sepetItem.miktar) * (1 - (iskonto_yuzde / 100))) * (vergiler.vergi_orani / 100);
                sepetItem.iskonto_tutari = (sepetItem.birim_fiyat * sepetItem.miktar) * (iskonto_yuzde / 100);
                sepetItem.ara_toplam = sepetItem.birim_fiyat * sepetItem.miktar;
                sepetItem.genel_toplam = sepetItem.ara_toplam - sepetItem.iskonto_tutari + sepetItem.kdv_fiyat;

                sepetItem.iskonto_orani = iskonto_yuzde;





                // Normal ürün işlemleri
                const varyantGruplar = await conMain('urun_varyant_grup as uvg')
                    .where('uvg.urun_varyant_id', sepetItem.varyant_id)
                    .join('urun_ana_varyant as uav', 'uvg.varyant_id', 'uav.id')
                    .leftJoin('urun_ana_varyant as ust', 'uav.varyant_ust_id', 'ust.id')
                    .select([
                        'uav.id as varyant_id',
                        'uav.varyant_adi',
                        'ust.varyant_adi as ust_varyant_adi'
                    ]);

                // Varyant adlarını birleştir (üst varyant - alt varyant formatında)
                const varyantBilgisi = varyantGruplar
                    .map(v => `${v.ust_varyant_adi} - ${v.varyant_adi}`)
                    .join(', ');

                // Stok miktarını al
                const stokMiktari = await conMain('urun_stok_miktarlari')
                    .where({
                        'urun_id': sepetItem.urun_id,
                        'varyant_id': sepetItem.varyant_id
                    })
                    .select('miktar', 'miktar2')
                    .first();

                // Varyant resimlerini kontrol et
                const varyantResim = await conMain('urun_resimleri')
                    .where({
                        'urun_id': sepetItem.urun_id,
                        'varyant_id': sepetItem.varyant_id
                    })
                    .first();

                // Eğer varyant resmi yoksa varsayılan ürün resmini al
                if (!varyantResim) {
                    const varsayilanResim = await conMain('urun_resimleri')
                        .where({
                            'urun_id': sepetItem.urun_id,
                            'varsayilan': 1
                        })
                        .first();
                    sepetItem.resim = varsayilanResim ? varsayilanResim.resim : null;
                } else {
                    sepetItem.resim = varyantResim.resim;
                }

                return {
                    ...sepetItem,
                    varyantAdi: varyantBilgisi,
                    varyantGruplar,
                    stokMiktari: stokMiktari.miktar,
                    miktar2: stokMiktari.miktar2,
                    resim: sepetItem.resim,
                    isVergi: false,
                    vergiler: vergiler
                };
            }));





            return {
                status: 'success',
                message: 'Sepet listelendi',
                sepet: sepetWithDetails
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    async createSepet(req, res) {
        // Transaction başlat
        const trx = await conMain.transaction();

        try {
            // Önce mevcut sepet kaydını kontrol et
            const existingSepet = await trx('sepet')
                .where({
                    musteri_id: req.body.musteri_id,
                    urun_id: req.body.urun_id,
                    varyant_id: req.body.varyant_id
                })
                .first();

            const urunBul = await trx('urun_varyant')
                .where({
                    id: req.body.varyant_id,
                    urun_id: req.body.urun_id
                })
                .select('*')
                .first();

            const vergiBul = await trx('ozel_vergi_tanimlari')
                .where({
                    stok_kodu: urunBul.stok_kodu
                })
                .select('id', 'vergi_kodu', 'miktar');


            let sepet;
            if (existingSepet) {
                // Mevcut kayıt varsa miktarı güncelle
                sepet = await trx('sepet')
                    .where({
                        musteri_id: req.body.musteri_id,
                        urun_id: req.body.urun_id,
                        varyant_id: req.body.varyant_id
                    })
                    .update({
                        miktar: Number(existingSepet.miktar) + Number(req.body.miktar)
                    })
                    .returning('*');

                for (const vergi of vergiBul) {
                    await trx('sepet')
                        .where({
                            musteri_id: req.body.musteri_id,
                            urun_id: req.body.urun_id,
                            varyant_id: req.body.varyant_id,
                            vergi_id: vergi.id
                        })
                        .update({
                            miktar: (Number(existingSepet.miktar) + Number(req.body.miktar)) * vergi.miktar
                        })
                        .returning('*');

                }



                // Transaction'ı onayla
                await trx.commit();

                return {
                    status: 'success',
                    message: 'Sepet güncellendi',
                    sepet: sepet
                };
            }

            // Mevcut kayıt yoksa yeni kayıt ekle
            sepet = await trx('sepet').insert({
                cartId: req.body.cartId,
                musteri_id: req.body.musteri_id,
                urun_id: req.body.urun_id,
                vergi_id: req.body.vergi_id,
                varyant_id: req.body.varyant_id,
                miktar: req.body.miktar
            }).returning('*');

            // forEach yerine for...of kullanımı
            for (const vergi of vergiBul) {
                await trx('sepet').insert({
                    cartId: req.body.cartId,
                    musteri_id: req.body.musteri_id,
                    urun_id: req.body.urun_id,
                    vergi_id: vergi.id,
                    varyant_id: req.body.varyant_id,
                    miktar: req.body.miktar * vergi.miktar
                });
            }

            // Transaction'ı onayla
            await trx.commit();

            return {
                status: 'success',
                message: 'Sepet oluşturuldu',
                sepet: sepet
            };
        } catch (error) {
            // Hata durumunda transaction'ı geri al
            await trx.rollback();
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    async updateSepet(req, res) {
        try {
            const sepet = await conMain('sepet')
                .where({
                    musteri_id: req.locals.user.id,
                    urun_id: req.params.urun_id,
                    varyant_id: req.params.varyant_id
                })
                .update({
                    miktar: req.body.miktar
                });

            const urunBul = await conMain('urun_varyant')
                .where({
                    id: req.params.varyant_id,
                    urun_id: req.params.urun_id
                })
                .select('*')
                .first();

            const vergiBul = await conMain('ozel_vergi_tanimlari')
                .where({
                    stok_kodu: urunBul.stok_kodu
                })
                .select('id', 'vergi_kodu', 'miktar');

            for (const vergi of vergiBul) {
                await conMain('sepet')
                    .where({
                        musteri_id: req.locals.user.id,
                        urun_id: req.params.urun_id,
                        varyant_id: req.params.varyant_id,
                        vergi_id: vergi.id
                    })
                    .update({
                        miktar: req.body.miktar * vergi.miktar
                    });
            }

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

    async deleteSepet(req, res) {
        try {
            const sepet = await conMain('sepet')
                .where({
                    musteri_id: req.locals.user.id,
                    urun_id: req.params.urun_id,
                    varyant_id: req.params.varyant_id
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



    async getCmsSepetListe(req, res) {
        try {
            const sepet = await conMain('sepet')
                .select('sepet.musteri_id', conMain.raw('SUM(sepet.miktar) as sepet_miktar'), 'musteriler.ad', 'musteriler.soyad', 'musteriler.eposta', 'musteriler.vkntckn', 'musteriler.kodu', 'musteriler.iskonto_yuzde', 'musteriler.fiyat_grup_id')
                .leftJoin('musteriler', 'sepet.musteri_id', 'musteriler.id')
                .groupBy('sepet.musteri_id', 'musteriler.ad', 'musteriler.soyad', 'musteriler.eposta', 'musteriler.vkntckn', 'musteriler.kodu', 'musteriler.iskonto_yuzde', 'musteriler.fiyat_grup_id');

            // Her müşteri için sepet detaylarını ve fiyat hesaplamalarını al
            const sepetWithDetails = await Promise.all(sepet.map(async (sepetItem) => {
                const iskonto_yuzde = sepetItem.iskonto_yuzde;
                const fiyat_grup_id = sepetItem.fiyat_grup_id;

                // Müşterinin sepetindeki ürünleri al
                const sepetUrunleri = await conMain('sepet')
                    .leftJoin('urun_varyant', 'sepet.varyant_id', 'urun_varyant.id')
                    .leftJoin('urun_alt_bilgileri', 'sepet.urun_id', 'urun_alt_bilgileri.id')
                    .where('sepet.musteri_id', sepetItem.musteri_id)
                    .select(
                        'sepet.*',
                        'urun_varyant.fiyat',
                        'urun_alt_bilgileri.urun_adi'
                    );

                // Her ürün için fiyat hesaplamalarını yap
                let toplam_fiyat = 0;
                let toplam_kdv = 0;
                let toplam_iskonto = 0;

                for (const urun of sepetUrunleri) {
                    // Vergi bilgisini al
                    const vergiler = await conMain('vergiler as v')
                        .leftJoin('urun_vergi_grup as uvg', 'v.id', 'uvg.vergi_id')
                        .where('uvg.urun_id', urun.urun_id)
                        .where('uvg.varyant_id', urun.varyant_id)
                        .select('v.vergi_orani', 'v.vergi_adi')
                        .first();

                    // Özel fiyat kontrolü
                    const ozelFiyat = await conMain('urun_ozel_fiyat_grup')
                        .where('urun_id', urun.urun_id)
                        .where('varyant_id', urun.varyant_id)
                        .where('ozel_fiyat_id', fiyat_grup_id)
                        .select('fiyat')
                        .first();

                    const birim_fiyat = ozelFiyat ? ozelFiyat.fiyat : urun.fiyat;
                    const vergi_orani = vergiler ? vergiler.vergi_orani : 0;

                    // Fiyat hesaplamaları
                    const urun_toplam = birim_fiyat * urun.miktar;
                    const iskonto_tutari = urun_toplam * (iskonto_yuzde / 100);
                    const kdv_tutari = (urun_toplam - iskonto_tutari) * (vergi_orani / 100);

                    toplam_fiyat += urun_toplam;
                    toplam_kdv += kdv_tutari;
                    toplam_iskonto += iskonto_tutari;
                }

                // Sepet özet bilgilerini ekle
                sepetItem.toplam_fiyat = toplam_fiyat;
                sepetItem.toplam_kdv = toplam_kdv;
                sepetItem.toplam_iskonto = toplam_iskonto;
                sepetItem.genel_toplam = toplam_fiyat - toplam_iskonto + toplam_kdv;
                sepetItem.iskonto_yuzde = iskonto_yuzde;

                return sepetItem;
            }));


            return {
                status: 'success',
                message: 'Sepet listelendi',
                sepet: sepetWithDetails
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    async getCmsSepetById(req, res) {
        try {
            const musteri = await conMain('musteriler')
                .where('id', req.params.musteri_id)
                .select('*')
                .first();

            const iskonto_yuzde = musteri.iskonto_yuzde;
            const fiyat_grup_id = musteri.fiyat_grup_id;

            const sepet = await conMain('sepet')
                .leftJoin('musteriler', 'sepet.musteri_id', 'musteriler.id')
                .select(
                    'sepet.*',
                    conMain.raw('CONCAT(musteriler.ad, " ", musteriler.soyad) as musteri_adi'),
                    'musteriler.telefon',
                    'musteriler.eposta',
                    'musteriler.vkntckn',
                    'musteriler.kodu'
                ).where('sepet.musteri_id', req.params.musteri_id)
                .first();

            const sepetAlt = await conMain('sepet')
                .leftJoin('urun_varyant', 'sepet.varyant_id', 'urun_varyant.id')
                .leftJoin('urun_alt_bilgileri', 'sepet.urun_id', 'urun_alt_bilgileri.id')
                .leftJoin('ozel_vergi_tanimlari', 'sepet.vergi_id', 'ozel_vergi_tanimlari.id')
                .leftJoin('urun_varyant_grup as uvg', 'urun_varyant.id', 'uvg.urun_varyant_id')
                .leftJoin('urun_ana_varyant as uav', 'uvg.varyant_id', 'uav.id')
                .leftJoin('urun_ana_varyant as ust', 'uav.varyant_ust_id', 'ust.id')
                .where('sepet.musteri_id', req.params.musteri_id)
                .select(
                    'sepet.*',
                    'urun_varyant.stok_kodu',
                    'urun_varyant.varyant_urun_adi',
                    'urun_varyant.fiyat',
                    'urun_alt_bilgileri.urun_adi',
                    'urun_alt_bilgileri.urun_seo',
                    'ozel_vergi_tanimlari.vergi_kodu',
                    'uav.varyant_adi',
                    'ust.varyant_adi as ust_varyant_adi'
                )
                .then(async rows => {
                    // Fetch and add images for each row
                    const rowsWithImages = await Promise.all(rows.map(async row => {
                        // Get tax information
                        let vergiler = await conMain('vergiler as v')
                            .leftJoin('urun_vergi_grup as uvg', 'v.id', 'uvg.vergi_id')
                            .where('uvg.urun_id', row.urun_id)
                            .where('uvg.varyant_id', row.varyant_id)
                            .select('v.vergi_orani', 'v.vergi_adi')
                            .first();

                        if (!vergiler) {
                            vergiler = await conMain('vergiler')
                                .where('id', 4)
                                .select('vergi_orani', 'vergi_adi')
                                .first();
                        }

                        // Get special price if exists
                        const ozelFiyat = await conMain('urun_ozel_fiyat_grup')
                            .where('urun_id', row.urun_id)
                            .where('varyant_id', row.varyant_id)
                            .where('ozel_fiyat_id', fiyat_grup_id)
                            .select('fiyat')
                            .first();

                        // Calculate prices
                        row.birim_fiyat = ozelFiyat ? ozelFiyat.fiyat : row.fiyat;

                        // Calculate discounted price
                        const indirimli_fiyat = iskonto_yuzde > 0
                            ? ozelFiyat
                                ? (ozelFiyat.fiyat) * (1 - iskonto_yuzde / 100) * (1 + vergiler.vergi_orani / 100)
                                : (row.fiyat) * (1 - iskonto_yuzde / 100) * (1 + vergiler.vergi_orani / 100)
                            : 0;

                        // Calculate regular price with tax
                        const normal_fiyat = ozelFiyat
                            ? (ozelFiyat.fiyat) * (1 + vergiler.vergi_orani / 100)
                            : (row.fiyat) * (1 + vergiler.vergi_orani / 100);

                        // Set the final price (use discounted price if available, otherwise use normal price)
                        row.fiyat = indirimli_fiyat > 0 ? indirimli_fiyat : normal_fiyat;

                        row.kdv_fiyat = ((row.birim_fiyat * row.miktar) * (1 - (iskonto_yuzde / 100))) * (vergiler.vergi_orani / 100);
                        row.iskonto_tutari = (row.birim_fiyat * row.miktar) * (iskonto_yuzde / 100);
                        row.ara_toplam = row.birim_fiyat * row.miktar;
                        row.genel_toplam = row.ara_toplam - row.iskonto_tutari + row.kdv_fiyat;
                        row.iskonto_orani = iskonto_yuzde;
                        row.vergi_orani = vergiler.vergi_orani;
                        row.vergi_adi = vergiler.vergi_adi;

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
                        const key = row.id;
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
                sepet: sepet,
                sepetAlt: sepetAlt
            };
        } catch (error) {
            throw error;
        }
    }

}

export default new SepetServices;