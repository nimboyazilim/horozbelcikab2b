import conMain from "../config/database.mjs";
import conMainMssql from "../config/databaseMssql.mjs";
import conMainMssql2 from "../config/databaseMssql2.mjs";
import DataServices from "./dataServices.mjs";
import fs from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import { fileURLToPath } from 'url';
import otherServices from "./otherServices.mjs";
    
class MikroServices {
    
    async varyantListe(req, res) {
        try {
            const columns = await conMainMssql('INFORMATION_SCHEMA.COLUMNS')
                .select('COLUMN_NAME')
                .where('TABLE_NAME', 'STOKLAR_USER')
                .whereNot('COLUMN_NAME', 'FAMILY_NAME')
                .whereNot('COLUMN_NAME', 'Record_uid');
                

            const columnNames = columns.map(col => col.COLUMN_NAME);
            const groupedResults = [];

            // Ana varyantları ekleme
            for (let i = 0; i < columnNames.length; i++) {
                const column = columnNames[i];
                // Varyant adı mevcut mu kontrol et
                const existingVariant = await conMain('urun_ana_varyant')
                    .where('varyant_adi', column) // Varyant adı kontrolü
                    .where('varyant_ust_id', 0) // Ana varyantın ID'si
                    .first();

                let insertResult;
                if (existingVariant) {
                    // Eğer varsa güncelle
                    insertResult = existingVariant.id; // ID'yi mevcut varyanttan al
                } else {
                    // Yoksa yeni ekle
                    insertResult = await conMain('urun_ana_varyant').insert({
                        varyant_adi: column, // MSSQL'den gelen sütun ismi
                        varyant_sira: i, // 0, 1, 2 şeklinde sıralama
                        varyant_ust_id: 0 // Ana varyantlar için üst varyant ID'si 0
                    });
                }

                // Alt varyantları ekleme
                const result = await conMainMssql('STOKLAR_USER')
                    .select(column)
                    .whereNot(column, null) // null olanları hariç tut
                    .where(column, '<>', '') // boş olanları hariç tut
                    .groupBy(column);

                
                for (const data of result) {
                    // Varyant adı mevcut mu kontrol et
                    if (data[column]) { // data[column] değerinin geçerli olup olmadığını kontrol et
                       // console.log('data[column]:', data[column]); // Hata ayıklama
                       // console.log('insertResult:', insertResult); // Hata ayıklama

                        // insertResult'ın bir nesne veya dizi olup olmadığını kontrol et
                        if (Array.isArray(insertResult) || typeof insertResult === 'object') {
                            console.error('insertResult bir nesne veya dizi:', insertResult);
                            insertResult = insertResult[0]; // Dizinin ilk elemanını al
                        }

                        const existingVariant = await conMain('urun_ana_varyant')
                            .where('varyant_adi', data[column]) // Varyant adı kontrolü
                            .where('varyant_ust_id', insertResult) // Ana varyantın ID'si
                            .first();

                            //console.log('existingVariant:', existingVariant);

                        if (existingVariant) {
                           // console.log(`Varyant zaten mevcut: ${data[column]}`); // Mevcut varyant durumu
                        } else {
                            // Yoksa yeni ekle
                            try {
                                await conMain('urun_ana_varyant').insert({
                                    varyant_adi: data[column], // Alt varyant ismi
                                    varyant_ust_id: insertResult, // Ana varyantın insertId'si
                                    varyant_sira: i // Alt varyant sırası
                                });
                              // console.log(`Yeni varyant eklendi: ${data[column]}`); // Başarılı ekleme durumu
                            } catch (error) {
                                console.error(`Insert hatası: ${error.message}`); // Hata mesajı
                            }
                        }
                    } else {
                        console.warn(`Geçersiz varyant adı: ${data[column]}`); // Geçersiz varyant adı için uyarı
                    }
                }
                groupedResults.push({ column, data: result });
            }

            return {
                status: 'success',
                message: 'Varyant Niteklier Senkronize Edildi'
            };
        } catch (error) {
            throw error;
        }
    }

    async stokVaryantEkle(req, res) {
        let trx;
        try {
            trx = await conMain.transaction();

            await trx('urun_ana_bilgileri').update({
                active: 0
            });

            const familyName1 = await conMainMssql('STOKLAR_USER')
                .select('STOKLAR.sto_kod','STOKLAR.sto_isim', 'STOKLAR.sto_webe_gonderilecek_fl', 'STOKLAR.sto_yabanci_isim', 'STOK_ALTERNATIFLERI.sa_alternatifkod', 'STOKLAR_USER.*')
                .leftOuterJoin('STOKLAR', 'STOKLAR.sto_Guid', 'STOKLAR_USER.Record_uid')
                .leftOuterJoin('STOK_ALTERNATIFLERI', 'STOK_ALTERNATIFLERI.sa_kod', 'STOKLAR.sto_kod')
                .whereNot('STOKLAR_USER.FAMILY_NAME', null)
                .whereNot('STOKLAR_USER.FAMILY_NAME', '')
                .where('STOKLAR.sto_webe_gonderilecek_fl', 1)
                .whereNotIn('STOKLAR.sto_kod', function() {
                    this.select('sto_yabanci_isim')
                        .from('STOKLAR')
                        .whereNotNull('sto_yabanci_isim')
                        .whereIn('sto_yabanci_isim', function() {
                            this.select('sto_kod')
                                .from('STOKLAR')
                                .where('sto_webe_gonderilecek_fl', 1);
                        });
                })
                .orderBy('STOKLAR_USER.FAMILY_NAME', 'ASC');
                //.limit(50);

              /* Eski kod
              const familyName1 = await conMainMssql('STOKLAR_USER')
                .select('STOKLAR.sto_kod','STOKLAR.sto_isim', 'STOKLAR.sto_webe_gonderilecek_fl', 'STOK_ALTERNATIFLERI.sa_alternatifkod', 'STOKLAR_USER.*')
                .leftOuterJoin('STOKLAR', 'STOKLAR.sto_Guid', 'STOKLAR_USER.Record_uid')
                .leftOuterJoin('STOK_ALTERNATIFLERI', 'STOK_ALTERNATIFLERI.sa_kod', 'STOKLAR.sto_kod')
                .whereNot('STOKLAR_USER.FAMILY_NAME', null)
                .whereNot('STOKLAR_USER.FAMILY_NAME', '')
                .where('STOKLAR.sto_webe_gonderilecek_fl', 1)
                .orderBy('STOKLAR_USER.FAMILY_NAME', 'ASC');
                //.limit(50);
                */

            // FAMILY_NAME'a göre gruplama
            const groupedFamilyNames = familyName1.reduce((acc, curr) => {
                const familyName = curr.FAMILY_NAME;
                // Kullanılacak stok kodunu belirle
                const stokKodu = curr.sa_alternatifkod || curr.sto_kod;
                
                if (!acc[familyName]) {
                    acc[familyName] = [];
                }
                // curr objesini güncellenmiş stok koduyla birlikte ekle
                acc[familyName].push({
                    ...curr,
                    sto_kod: stokKodu
                });
                return acc;
            }, {});

              // URL-friendly string oluşturma fonksiyonu
              const createSeoUrl = (text) => {
                return text
                    .toLowerCase()
                    .replace(/ğ/g, 'g')
                    .replace(/ü/g, 'u')
                    .replace(/ş/g, 's')
                    .replace(/ı/g, 'i')
                    .replace(/ö/g, 'o')
                    .replace(/ç/g, 'c')
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-+|-+$/g, ''); // Baştaki ve sondaki tireleri kaldır
            };
     
        
            for (const familyName in groupedFamilyNames) {
                const stok1 = groupedFamilyNames[familyName];
                let anaBilgiId;

                if (stok1.length > 0) {
                    // İlk kaydı urun_ana_bilgileri tablosuna ekle
                    let urunKontrol = await trx('urun_alt_bilgileri').where('urun_adi', stok1[0].FAMILY_NAME).first();

                    if (urunKontrol) {
                        anaBilgiId = urunKontrol.id;


                      await trx('urun_alt_bilgileri').where('id', anaBilgiId).update({
                        urun_adi: stok1[0].FAMILY_NAME,
                        urun_seo: createSeoUrl(stok1[0].FAMILY_NAME),
                        //urun_description: stok1[0].FAMILY_NAME,
                        //urun_information: stok1[0].FAMILY_NAME,
                        //urun_meta_description: stok1[0].FAMILY_NAME,
                        //urun_meta_keywords: stok1[0].FAMILY_NAME,
                        //urun_meta_title: stok1[0].FAMILY_NAME       
                        });

                        await trx('urun_ana_bilgileri').where('id', anaBilgiId).update({
                            active: stok1[0].sto_webe_gonderilecek_fl
                        });


                    } else {    

                    anaBilgiId = await trx('urun_ana_bilgileri').insert({
                        alis_fiyati: 0,
                        fiyat: 0,
                        stok_kodu: stok1[0].sto_kod,
                        barkod: '',
                        tip: 'varyant',
                        active: stok1[0].sto_webe_gonderilecek_fl
                    });

                  

                    // urun_alt_bilgileri eklerken
                    await trx('urun_alt_bilgileri').insert({
                        urun_adi: stok1[0].FAMILY_NAME,
                        urun_seo: createSeoUrl(stok1[0].FAMILY_NAME),
                        urun_description: stok1[0].FAMILY_NAME,
                        urun_information: stok1[0].FAMILY_NAME,
                        urun_meta_description: stok1[0].FAMILY_NAME,
                        urun_meta_keywords: stok1[0].FAMILY_NAME,
                        urun_meta_title: stok1[0].FAMILY_NAME                  
                    });

                    await trx('urun_stok_miktarlari').insert({
                        urun_id: anaBilgiId,
                        varyant_id: 0,
                        miktar: 0
                    });

                    await trx('urun_vergi_grup').insert({
                        urun_id: anaBilgiId,
                        varyant_id: 0,
                        vergi_id: 4
                    });

                  /*  await trx('urun_durumlari_grup').insert({
                        urun_id: anaBilgiId,
                        durum_id: 1
                    });*/
                    }
                }

                for (const stok of stok1) {  
                    let urunVaryantKontrol = await trx('urun_varyant').where('stok_kodu', stok.sto_kod).first();
                    let varyantId;


                    if (urunVaryantKontrol) {
                        varyantId = urunVaryantKontrol.id;
                    } else {
                        // Alt varyantları bulmak için sütun isimlerini tanım
                        varyantId = await trx('urun_varyant').insert({
                            urun_id: anaBilgiId,
                            varyant_urun_adi: stok.sto_isim,
                            alis_fiyati: 0,
                            fiyat: 0,
                            stok_kodu: stok.sto_kod,
                            barkod: '',
                            varsayilan: 0
                        });

                        await trx('urun_stok_miktarlari').insert({
                            urun_id: anaBilgiId,
                            varyant_id: varyantId,
                            miktar: 0
                        });

                        await trx('urun_vergi_grup').insert({
                            urun_id: anaBilgiId,
                            varyant_id: varyantId,
                            vergi_id: 4
                        });
                    }
                }
            }

            await trx.commit();
            return {
                status: 'success',
                message: 'Stoklar Senkronize Edildi'
            };
        } catch (error) {   
            if (trx) await trx.rollback();
            throw error;
        }
    }

    async stokVaryantGrupEkle(req, res) {
        try {
            // Transaction başlat
            const trx = await conMain.transaction();

            const columns = await conMainMssql('INFORMATION_SCHEMA.COLUMNS')
                .select('COLUMN_NAME')
                .where('TABLE_NAME', 'STOKLAR_USER')
                .whereNot('COLUMN_NAME', 'FAMILY_NAME')
                .whereNot('COLUMN_NAME', 'Record_uid');

            const columnNames = columns.map(col => col.COLUMN_NAME);

            const mikroVaryantlar =  await conMainMssql('STOKLAR_USER')
            .select('STOKLAR.sto_kod', 'STOK_ALTERNATIFLERI.sa_alternatifkod', 'STOKLAR_USER.*')
            .leftOuterJoin('STOKLAR', 'STOKLAR.sto_Guid', 'STOKLAR_USER.Record_uid')
            .leftOuterJoin('STOK_ALTERNATIFLERI', 'STOK_ALTERNATIFLERI.sa_kod', 'STOKLAR.sto_kod')
            .whereNot('STOKLAR_USER.FAMILY_NAME', null)
            .whereNot('STOKLAR_USER.FAMILY_NAME', '')
            .where('STOKLAR.sto_webe_gonderilecek_fl', 1)
            .orderBy('STOKLAR_USER.FAMILY_NAME', 'ASC');
                //.limit(50);

            const urunVaryant = await trx('urun_varyant').select('*');    
            const urunAnaVaryant = await trx('urun_ana_varyant').select('*');    
         

            const varyantGrup = [];

                    // Yeni eklenen kod: stok_kodu ile eşleştirme
                for (const varyant of urunVaryant) {
                    const matchingMikroVaryant = mikroVaryantlar.find(mv => mv.sto_kod === varyant.stok_kodu);
                    if (matchingMikroVaryant) {
                        // Sadece dolu olan sütunları filtrele
                        const doluSutunlar = columnNames.filter(sutun => matchingMikroVaryant[sutun]);

                        for (const sutun of doluSutunlar) {


                            const anaVaryantBul = urunAnaVaryant.find(av => av.varyant_adi === sutun);
                            
                            const altVaryantBul = urunAnaVaryant.find(av => av.varyant_adi === matchingMikroVaryant[sutun] && av.varyant_ust_id === anaVaryantBul.id);


                          //  console.log('urun_id', varyant.urun_id, 'id', varyant.id, 'anaVaryantBul', anaVaryantBul, 'altVaryantBul', altVaryantBul);

                            if (altVaryantBul) {
                            varyantGrup.push({
                                urun_id: varyant.urun_id,
                                urun_varyant_id: varyant.id,
                                    varyant_id: altVaryantBul.id
                                });
                            }
                            
                        }
                    }
                }

            //console.log('varyantGrup', varyantGrup);

            await trx('urun_varyant_grup').truncate();

            const BATCH_SIZE = 1000; // Her seferde eklenecek maksimum kayıt sayısı
            
            for (let i = 0; i < varyantGrup.length; i += BATCH_SIZE) {
                const batch = varyantGrup.slice(i, i + BATCH_SIZE);
                await trx.batchInsert('urun_varyant_grup', batch, BATCH_SIZE);
            }




         /*   for (const varyant of varyantGrup) {
                await trx('urun_varyant_grup').insert({
                    urun_id: varyant.urun_id,
                    urun_varyant_id: varyant.urun_varyant_id,
                    varyant_id: varyant.varyant_id
                });
            }*/


        /*    await trx('urun_varyant_grup').insert({
                urun_id: varyant.urun_id,
                urun_varyant_id: varyant.id, // varyantId yerine varyant.id kullanıldı
                varyant_id: altVaryantBul.id
            });*/
            

            // Transaction'ı onayla
            await trx.commit();

            return {
                status: 'success',
                message: 'Ürünler ile Varyant Nitelikleri Birleştirildi'
            };
        } catch (error) {   
            // Hata durumunda transaction'ı geri al
            await trx.rollback();
            throw error;
        }
    }


    async kategoriEkle(req, res) {
        try {
            // Transaction başlat
            const trx = await conMain.transaction();

            const kategoriler = await conMainMssql('STOK_KALITE_KONTROL_TANIMLARI')
                .select('KKon_kod as ktg_kod', 'KKon_ismi as ktg_isim')
                .orderBy('KKon_kod', 'ASC');

            // SEO URL oluşturma fonksiyonu
            const createSeoUrl = (text) => {
                return text
                    .toLowerCase()
                    .replace(/ğ/g, 'g')
                    .replace(/ü/g, 'u')
                    .replace(/ş/g, 's')
                    .replace(/ı/g, 'i')
                    .replace(/ö/g, 'o')
                    .replace(/ç/g, 'c')
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-+|-+$/g, ''); // Baştaki ve sondaki tireleri kaldır
            };

            // Kategori eklemek için yardımcı fonksiyon
            const kategoriEkleVeIdAl = async (kategoriAdi, ustId = 0) => {
                // Önce mevcut kategoriyi kontrol et
                const mevcutKategori = await trx('kategoriler')
                    .where({
                        kategori_adi: kategoriAdi,
                        kategori_ust_id: ustId
                    })
                    .first();

                if (mevcutKategori) {
                    // Kategori varsa güncelle
                    await trx('kategoriler')
                        .where('id', mevcutKategori.id)
                        .update({
                            kategori_seo: createSeoUrl(kategoriAdi)
                            // Diğer güncellenecek alanlar varsa buraya eklenebilir
                        });
                    return mevcutKategori.id;
                } else {
                    // Kategori yoksa yeni ekle
                    const [id] = await trx('kategoriler').insert({
                        kategori_adi: kategoriAdi,
                        kategori_ust_id: ustId,
                        kategori_seo: createSeoUrl(kategoriAdi)
                    });
                    return id;
                }
            };

            // Kategorileri işle ve veritabanına ekle
            const kategoriIdMap = new Map(); // Kategori kodlarını ve ID'lerini tutmak için

            for (const kategori of kategoriler) {
                if (!kategori.ktg_kod) continue;

                const kodParcalari = kategori.ktg_kod.split('.');
                let ustKategoriId = 0;
                let oncekiKod = '';

                // Her bir seviye için
                for (let i = 0; i < kodParcalari.length; i++) {
                    const currentKod = oncekiKod 
                        ? `${oncekiKod}.${kodParcalari[i]}` 
                        : kodParcalari[i];
                    
                    if (!kategoriIdMap.has(currentKod)) {
                        // Bu seviyedeki kategori adını bul
                        const kategoriAdi = (i === kodParcalari.length - 1)
                            ? kategori.ktg_isim
                            : `Kategori ${currentKod}`; // Ara kategoriler için geçici isim

                        // Kategoriyi ekle ve ID'sini al
                        const yeniKategoriId = await kategoriEkleVeIdAl(
                            kategoriAdi,
                            ustKategoriId
                        );
                        
                        kategoriIdMap.set(currentKod, yeniKategoriId);
                        ustKategoriId = yeniKategoriId;
                    } else {
                        ustKategoriId = kategoriIdMap.get(currentKod);
                    }
                    
                    oncekiKod = currentKod;
                }
            }

            // Transaction'ı onayla
            await trx.commit();

            return {
                status: 'success',
                message: 'Kategoriler başarıyla eklendi'
            };
        } catch (error) {
            // Hata durumunda transaction'ı geri al
            if (trx) await trx.rollback();
            return {
                status: 'error',
                message: error.message,
            }
        }
    }


   async kategoriyeUrunBagla(req, res) {
    try {
        const trx = await conMain.transaction();
        const BATCH_SIZE = 1000;

        await trx('kategori_urun').truncate();

        // Tüm kategori bilgilerini tek seferde çek ve hafızada tut
        const tumKategoriler = await trx('kategoriler')
            .select('id', 'kategori_adi', 'kategori_ust_id');
        
        // Hızlı arama için Map'e dönüştür
        const kategoriMap = new Map(
            tumKategoriler.map(k => [k.kategori_adi, k])
        );

        // Parent kategori ilişkilerini önceden hesapla
        const parentMap = new Map();
        for (const kategori of tumKategoriler) {
            const parents = [];
            let currentId = kategori.id;
            let currentKategori = tumKategoriler.find(k => k.id === currentId);
            
            while (currentKategori && currentKategori.kategori_ust_id > 0) {
                parents.push(currentKategori.kategori_ust_id);
                currentKategori = tumKategoriler.find(k => k.id === currentKategori.kategori_ust_id);
            }
            parentMap.set(kategori.id, parents);
        }

        // Tüm ürün-kategori ilişkilerini toplu olarak hazırla
        const kategoriUrunInserts = [];

        const [urunler, mikroUrunler] = await Promise.all([
            trx('urun_ana_bilgileri').select('id', 'stok_kodu'),
            conMainMssql('STOKLAR')
                .leftJoin('STOK_KALITE_KONTROL_TANIMLARI', 'STOKLAR.sto_kalkon_kodu', 'STOK_KALITE_KONTROL_TANIMLARI.KKon_kod')
                .whereNot('STOKLAR.sto_kalkon_kodu', '')
                .select('STOKLAR.sto_kod', 'STOK_KALITE_KONTROL_TANIMLARI.KKon_ismi as ktg_isim')
        ]);

        // Mikro ürünleri Map'e dönüştür
        const mikroUrunMap = new Map(
            mikroUrunler.map(m => [m.sto_kod, m])
        );

        // Her ürün için kategori ilişkilerini oluştur
        for (const urun of urunler) {
            const matchingMikroUrun = mikroUrunMap.get(urun.stok_kodu);
            
            if (matchingMikroUrun) {
                const kategori = kategoriMap.get(matchingMikroUrun.ktg_isim);
                
                if (kategori) {
                    // Ana kategoriyi ekle
                    kategoriUrunInserts.push({
                        kategori_id: kategori.id,
                        urun_id: urun.id
                    });

                    // Parent kategorileri ekle
                    const parents = parentMap.get(kategori.id);
                    if (parents) {
                        for (const parentId of parents) {
                            kategoriUrunInserts.push({
                                kategori_id: parentId,
                                urun_id: urun.id
                            });
                        }
                    }
                }
            }
        }

        // Toplu insert işlemi
        for (let i = 0; i < kategoriUrunInserts.length; i += BATCH_SIZE) {
            const batch = kategoriUrunInserts.slice(i, i + BATCH_SIZE);
            await trx.batchInsert('kategori_urun', batch, BATCH_SIZE);
        }

        await trx.commit();
        
        return {
            status: 'success',
            message: 'Ürünler kategorilere ve üst kategorilere başarıyla bağlandı',
            count: kategoriUrunInserts.length
        };
        
    } catch (error) {
        if (trx) await trx.rollback();
        return {
            status: 'error',
            message: error.message
        }
    }
}


   async urunFiyatlariEkle(req, res) {
    try {
        const trx = await conMain.transaction();
        const BATCH_SIZE = 1000;

        // Ana ürünler ve varyantları al
        const urunler = await trx('urun_ana_bilgileri')
            .select('id', 'stok_kodu');
        
        const varyantlar = await trx('urun_varyant')
            .select('id', 'stok_kodu');

        // MSSQL'den fiyat verilerini al
        const mikroUrunler = await conMainMssql('nimbo_b2b_stok_fiyatlari')
            .select('*');

        // Fiyat verilerini hızlı erişim için Map'e dönüştür
        const fiyatMap = new Map(
            mikroUrunler.map(m => [m.sfiyat_stokkod, m.sfiyat_fiyati])
        );

        let updateCounts = {
            urunler: 0,
            varyantlar: 0
        };

        // Toplu güncelleme fonksiyonu
        const batchUpdate = async (table, items, type) => {
            for (let i = 0; i < items.length; i += BATCH_SIZE) {
                const batch = items.slice(i, i + BATCH_SIZE);
                const updates = batch
                    .filter(item => fiyatMap.has(item.stok_kodu))
                    .map(item => ({
                        id: item.id,
                        fiyat: fiyatMap.get(item.stok_kodu)
                    }));

                if (updates.length > 0) {
                    const cases = updates.map(item => 
                        `WHEN id = ${item.id} THEN ${item.fiyat}`
                    ).join(' ');
                    const ids = updates.map(item => item.id);

                    await trx.raw(`
                        UPDATE ${table}
                        SET fiyat = CASE
                            ${cases}
                        END
                        WHERE id IN (${ids.join(',')})
                    `);

                    updateCounts[type] += updates.length;
                }
            }
        };

        // Ana ürünleri ve varyantları güncelle
        await batchUpdate('urun_ana_bilgileri', urunler, 'urunler');
        await batchUpdate('urun_varyant', varyantlar, 'varyantlar');

        await trx.commit();
        
        return {
            status: 'success',
            message: `${updateCounts.urunler} ana ürün ve ${updateCounts.varyantlar} alt ürün fiyatları güncellendi.`
        };

    } catch (error) {
        if (trx) await trx.rollback();
        return {
            status: 'error',
            message: error.message
        }
    }
}

   async urunOzelFiyatlariEkle(req, res) {
    try {
        const trx = await conMain.transaction();

        const urunOzelFiyatGrup = await trx('urun_ozel_fiyat_grup')
        .truncate();
        
        const cariHesaplarFiyatNo = await conMainMssql('CARI_HESAPLAR')
            .leftJoin('STOK_SATIS_FIYAT_LISTE_TANIMLARI', 'CARI_HESAPLAR.cari_satis_fk', 'STOK_SATIS_FIYAT_LISTE_TANIMLARI.sfl_sirano')
            .whereIn('cari_satis_fk', [9, 10, 12, 13, 14])
            .groupBy('cari_satis_fk', 'sfl_aciklama')
            .select('cari_satis_fk','sfl_aciklama');

            for(const cariHesap of cariHesaplarFiyatNo){

             const urunOZelFiyatTanimlariKontrol = await trx('urun_ozel_fiyat_tanimlari')
             .where('entegre_id', cariHesap.cari_satis_fk)
             .first();
             
             if(!urunOZelFiyatTanimlariKontrol){
                const urunOzelFiyatTanimlariInsert = await trx('urun_ozel_fiyat_tanimlari')
                .insert({
                    entegre_id: cariHesap.cari_satis_fk,
                    adi: cariHesap.sfl_aciklama,
                });
             } else {
                const urunOzelFiyatTanimlariUpdate = await trx('urun_ozel_fiyat_tanimlari')
                .where('entegre_id', cariHesap.cari_satis_fk)
                .update({
                    adi: cariHesap.sfl_aciklama,
                });
             }
            }

            const mikroStokSatisFiyatListeleri = await conMainMssql('STOK_SATIS_FIYAT_LISTELERI')
            .whereIn('sfiyat_listesirano', [9, 10, 12, 13, 14])
            .where('sfiyat_deposirano', '=', '1')
            .select('sfiyat_listesirano', 'sfiyat_stokkod', 'sfiyat_fiyati');

            const urunAnaBilgileri = await trx('urun_ana_bilgileri')
            .select('id', 'stok_kodu');

            const urunVaryant = await trx('urun_varyant')
            .select('id', 'stok_kodu', 'urun_id');

            const urunOzelFiyatTanimlari = await trx('urun_ozel_fiyat_tanimlari')
                .select('entegre_id', 'id');

            // Toplu insert için array
            const insertData = [];

            // Ana ürünler için fiyat eşleştirmesi ve insert data hazırlama
            for (const urun of urunAnaBilgileri) {
                const fiyatlar = mikroStokSatisFiyatListeleri.filter(
                    fiyat => fiyat.sfiyat_stokkod === urun.stok_kodu
                );

                for (const fiyat of fiyatlar) {
                    const fiyatTanimi = urunOzelFiyatTanimlari.find(
                        tanim => tanim.entegre_id === fiyat.sfiyat_listesirano
                    );

                    if (fiyatTanimi) {
                        insertData.push({
                            ozel_fiyat_id: fiyatTanimi.id,
                            urun_id: urun.id,
                            varyant_id: 0, // Ana ürün için varyant_id = 0
                            fiyat: fiyat.sfiyat_fiyati
                        });
                    }
                }
            }

            // Varyantlar için fiyat eşleştirmesi ve insert data hazırlama
            for (const varyant of urunVaryant) {
                const fiyatlar = mikroStokSatisFiyatListeleri.filter(
                    fiyat => fiyat.sfiyat_stokkod === varyant.stok_kodu
                );

                for (const fiyat of fiyatlar) {
                    const fiyatTanimi = urunOzelFiyatTanimlari.find(
                        tanim => tanim.entegre_id === fiyat.sfiyat_listesirano
                    );

                    if (fiyatTanimi) {
                        insertData.push({
                            ozel_fiyat_id: fiyatTanimi.id,
                            urun_id: varyant.urun_id,
                            varyant_id: varyant.id,
                            fiyat: fiyat.sfiyat_fiyati
                        });
                    }
                }
            }

            // Toplu insert işlemi
            if (insertData.length > 0) {
                await trx('urun_ozel_fiyat_grup').insert(insertData);
            }

            await trx.commit();
            
            return {
                status: 'success',
                message: `Özel Bayi Fiyatları başarıyla senkronize edildi.`
            };

        } catch (error) {
            if (trx) await trx.rollback();
            return {
                status: 'error',
                message: error.message
            }
        }
    }


    async urunVergiEkle(req, res) {
        let trx;
        try {
            trx = await conMain.transaction();
            const BATCH_SIZE = 1000; // Toplu işlem boyutu

            const vergiListe = await conMainMssql('STOKLAR')
                .leftJoin('STOKLAR_USER', 'STOKLAR.sto_RECid_RECno', 'STOKLAR_USER.RecID_RECno')
                .select('sto_kod', 'Vergi1_Stok_Kod', 'Vergi1_Miktar', 'Vergi1_Fiyat', 'Vergi2_Stok_Kod', 'Vergi2_Miktar', 'Vergi2_Fiyat')
                .where('Vergi1_Stok_Kod', '!=', '');

            // Vergileri ayrı satırlara ayır
            const ayristirilmisVergiListesi = [];
            vergiListe.forEach(item => {
                if (item.Vergi1_Stok_Kod) {
                    ayristirilmisVergiListesi.push({
                        stok_kodu: item.sto_kod,
                        vergi_kodu: item.Vergi1_Stok_Kod,
                        miktar: item.Vergi1_Miktar,
                        fiyat: item.Vergi1_Fiyat
                    });
                }
                if (item.Vergi2_Stok_Kod) {
                    ayristirilmisVergiListesi.push({
                        stok_kodu: item.sto_kod,
                        vergi_kodu: item.Vergi2_Stok_Kod,
                        miktar: item.Vergi2_Miktar,
                        fiyat: item.Vergi2_Fiyat
                    });
                }
            });

            // Mevcut kayıtları al
            const mevcutKayitlar = await trx('ozel_vergi_tanimlari')
                .select('stok_kodu', 'vergi_kodu');

            // Mevcut kayıtları Map'e dönüştür (hızlı arama için)
            const mevcutKayitlarMap = new Map(
                mevcutKayitlar.map(k => [`${k.stok_kodu}-${k.vergi_kodu}`, true])
            );

            // Güncellenecek ve eklenecek kayıtları ayır
            const guncellenecekler = [];
            const eklenecekler = [];

            ayristirilmisVergiListesi.forEach(vergi => {
                const key = `${vergi.stok_kodu}-${vergi.vergi_kodu}`;
                if (mevcutKayitlarMap.has(key)) {
                    guncellenecekler.push(vergi);
                } else {
                    eklenecekler.push(vergi);
                }
            });

            // Toplu güncelleme işlemi
            if (guncellenecekler.length > 0) {
                const updateCases = guncellenecekler.map(vergi => 
                    `WHEN stok_kodu = '${vergi.stok_kodu}' AND vergi_kodu = '${vergi.vergi_kodu}' 
                     THEN ${vergi.miktar}`
                ).join(' ');

                const updateFiyatCases = guncellenecekler.map(vergi => 
                    `WHEN stok_kodu = '${vergi.stok_kodu}' AND vergi_kodu = '${vergi.vergi_kodu}' 
                     THEN ${vergi.fiyat}`
                ).join(' ');

                const stokKodlari = guncellenecekler.map(v => `'${v.stok_kodu}'`).join(',');
                const vergiKodlari = guncellenecekler.map(v => `'${v.vergi_kodu}'`).join(',');

                await trx.raw(`
                    UPDATE ozel_vergi_tanimlari
                    SET 
                        miktar = CASE ${updateCases} ELSE miktar END,
                        fiyat = CASE ${updateFiyatCases} ELSE fiyat END
                    WHERE stok_kodu IN (${stokKodlari})
                    AND vergi_kodu IN (${vergiKodlari})
                `);
            }

            // Toplu ekleme işlemi
            if (eklenecekler.length > 0) {
                for (let i = 0; i < eklenecekler.length; i += BATCH_SIZE) {
                    const batch = eklenecekler.slice(i, i + BATCH_SIZE);
                    await trx.batchInsert('ozel_vergi_tanimlari', batch, BATCH_SIZE);
                }
            }

            await trx.commit();

            return {
                status: 'success',
                message: 'Vergi tanımları başarıyla eklendi/güncellendi',
                count: {
                    guncellenen: guncellenecekler.length,
                    eklenen: eklenecekler.length
                }
            };

        } catch (error) {
            if (trx) await trx.rollback();
            return {
                status: 'error',
                message: error.message
            }
        }
    }


    async siparisErpAktar(urunler) {
        let transaction;
        try {
            // MSSQL transaction başlat
            transaction = await conMainMssql.transaction();

            const siparisEvrakSira = await transaction('PROFORMA_SIPARISLER')
                .select(transaction.raw('COALESCE(MAX(pro_evrakno_sira), 0) + 1 as pro_evrakno_sira'))
                .where('pro_evrakno_seri', 'BHRZ').first();

            const mikroProformaSiparislerTabloListe = [];
            let satirNo = 0;
            for (const urun of urunler) {
                const baseTable = DataServices.mikroProformaSiparislerTablo();
                
                // Stok dağılımını al
                const stokDagilimi = await this.getStokDagilimi(transaction, urun.stok_kodu, urun.miktar);

                // Her bir stok için sipariş kalemi oluştur
                for (const stok of stokDagilimi) {
                    const siparisKalemi = {
                        ...baseTable,
                        pro_evrakno_sira: Number(siparisEvrakSira.pro_evrakno_sira),
                        pro_belge_no: String(urun.siparis_no || ''),
                        pro_mustkodu: String(urun.musteri_kodu || ''),
                        pro_stokkodu: String(stok.stok_kodu),
                        pro_bfiyati: Number(urun.net_birim_fiyat || 0),
                        pro_miktar: Number(stok.miktar),
                        pro_tutari: Number(urun.net_birim_fiyat * stok.miktar),
                        pro_vergi: Number(urun.kdv_fiyat),
                        pro_vergipntr: 1,
                        pro_iskonto1: Number(urun.iskonto_tutari),
                        pro_dovizcinsi: 0,
                        pro_altdovizkuru: Math.ceil(Number(1 / await otherServices.tcmbKurlar() * 10000)) / 10000,
                        pro_satirno: Number(satirNo),
                        pro_tarihi: urun.siparis_tarihi ? new Date(urun.siparis_tarihi).toISOString().slice(0, 10) + ' 00:00:00.000' : new Date().toISOString().slice(0, 10) + ' 00:00:00.000',
                        pro_testarihi: urun.siparis_tarihi ? new Date(urun.siparis_tarihi).toISOString().slice(0, 10) + ' 00:00:00.000' : new Date().toISOString().slice(0, 10) + ' 00:00:00.000',
                        pro_belge_tarihi: urun.siparis_tarihi ? new Date(urun.siparis_tarihi).toISOString().slice(0, 10) + ' 00:00:00.000' : new Date().toISOString().slice(0, 10) + ' 00:00:00.000',
                        pro_create_date: new Date().toISOString(),
                        pro_lastup_date: new Date().toISOString(),
                        pro_fiyat_liste_no: urun.ozel_fiyat_id || 0
                    };
                    
                    mikroProformaSiparislerTabloListe.push(siparisKalemi);
                    satirNo += 1;
                }
            }

            // MSSQL'e toplu insert işlemi ve güncelleme
            for (const siparis of mikroProformaSiparislerTabloListe) {
                // Önce siparişi ekle
                await transaction('PROFORMA_SIPARISLER').insert(siparis);
                
            }

            // Transaction'ı commit et
            await transaction.commit();
            return {
                status: 'success',
                message: 'Sipariş başarıyla ERP sistemine aktarıldı',
                data: mikroProformaSiparislerTabloListe
            }   
        } catch (error) {
            // Hata durumunda transaction'ı geri al
            if (transaction) await transaction.rollback();
            
            console.error('Sipariş ERP aktarım hatası:', error);
            return {
                status: 'error',
                message: 'Sipariş ERP aktarımı sırasında bir hata oluştu: ' + error.message
            }
        }
    }

    // Stok miktarı ve alternatiflerini kontrol eden yardımcı fonksiyon
    async getStokDagilimi(transaction, stokKodu, isteneMiktar) {
        
        const dagilim = [];
        let kalanMiktar = isteneMiktar;

        // Önce ana stok kodunun koli adetini al
        const anaStokBilgisi = await transaction('STOKLAR')
            .where('sto_kod', stokKodu)
            .select('sto_birim2_katsayi')
            .first();
        
        const anaStokKoliAdeti = Math.abs(anaStokBilgisi?.sto_birim2_katsayi) || 1;
        
        // İstenen miktarı kolilere böl
        const gerekliKoliSayisi = Math.ceil(isteneMiktar / anaStokKoliAdeti);
        const herKoliMiktari = isteneMiktar / gerekliKoliSayisi;

        // Alternatifleri kontrol et
        const stokAlternatifleri = await transaction('STOK_ALTERNATIFLERI')
            .leftJoin('STOKLAR', 'STOK_ALTERNATIFLERI.sa_kod', 'STOKLAR.sto_kod')
            .where('sa_alternatifkod', stokKodu)
            .select('sa_kod','STOKLAR.sto_birim2_katsayi');


        // Tüm alternatiflerin miktarlarını al
        const alternatiflerMiktarlar = [];
        for (const alternatif of stokAlternatifleri) {
            const alternatifMiktari = await transaction.raw(
                'Select [dbo].[fn_DepodakiMiktar](?,1,DATEFROMPARTS(YEAR(GETDATE()), 12, 31)) as DepoMiktar',
                [alternatif.sa_kod]
            );
            const mevcutMiktar = alternatifMiktari[0]?.DepoMiktar || 0;
            const koliAdeti = Math.abs(alternatif.sto_birim2_katsayi) || 1;
            
            
            if (mevcutMiktar > 0) {
                alternatiflerMiktarlar.push({
                    stok_kodu: alternatif.sa_kod,
                    miktar: mevcutMiktar,
                    koliAdeti: koliAdeti
                });
            }
        }


        // Alternatifleri stok miktarına göre artan şekilde sırala
        alternatiflerMiktarlar.sort((a, b) => a.miktar - b.miktar);

        // Her koli için alternatiflerde karşılayan var mı kontrol et
        let karşılananKoliSayisi = 0;
        for (let i = 0; i < gerekliKoliSayisi; i++) {
            
            let buKoliKarsilandi = false;
            for (const alternatif of alternatiflerMiktarlar) {
                
                // Bu alternatif bu koli miktarını karşılayabilir mi?
                // Alternatif stokun koli adeti, ana stokun koli adetiyle uyumlu olmalı
                if (alternatif.miktar >= herKoliMiktari && alternatif.koliAdeti === anaStokKoliAdeti) {
                    
                    dagilim.push({
                        stok_kodu: alternatif.stok_kodu,
                        miktar: herKoliMiktari
                    });
                    
                    alternatif.miktar -= herKoliMiktari; // Kullanılan miktarı çıkar
                    karşılananKoliSayisi++;
                    buKoliKarsilandi = true;
                    console.log(`✅ ${i+1}. koli alternatiften alındı`);
                    break;
                } else {
                    if (alternatif.koliAdeti !== anaStokKoliAdeti) {
                        console.log(`❌ Bu alternatif bu koliyi karşılayamıyor - Koli adeti uyumsuz (Ana: ${anaStokKoliAdeti}, Alternatif: ${alternatif.koliAdeti})`);
                    } else {
                        console.log(`❌ Bu alternatif bu koliyi karşılayamıyor - Yetersiz stok`);
                    }
                }
            }
            
            if (!buKoliKarsilandi) {
                console.log(`❌ ${i+1}. koli alternatiflerde karşılanamadı`);
            }
        }

        console.log(`\n--- Alternatif kontrolü bitti ---`);
        console.log(`Karşılanan koli sayısı: ${karşılananKoliSayisi}/${gerekliKoliSayisi}`);

        // Karşılanmayan kolileri ana stoktan al (depo kontrolü olmadan)
        const karşılanmayanKoliSayisi = gerekliKoliSayisi - karşılananKoliSayisi;
        if (karşılanmayanKoliSayisi > 0) {
            console.log(`\n--- Ana stoktan alınacak ---`);
            console.log(`Karşılanmayan koli sayısı: ${karşılanmayanKoliSayisi}`);
            
            const karsilanacakMiktar = karşılanmayanKoliSayisi * herKoliMiktari;
            console.log(`Ana stoktan alınacak: ${karsilanacakMiktar} adet`);
            
            dagilim.push({
                stok_kodu: stokKodu,
                miktar: karsilanacakMiktar
            });
        }
        
        console.log(`\n=== SONUÇ ===`);
        console.log('Dagilim:', dagilim);
        console.log('=== STOK DAĞILIMI BİTTİ ===\n');
        
        return dagilim;
    }

    async stokMiktarEkle(req, res) {
        let trx;
        try {
            trx = await conMain.transaction();
            const BATCH_SIZE = 1000;

            // Tüm stokları ve varyantları tek seferde al
            const stoklar = await trx('urun_ana_bilgileri')
                .select('id', 'stok_kodu');

            const tumVaryantlar = await trx('urun_varyant')
                .select('id', 'stok_kodu', 'urun_id');

            // Varyantları ürün ID'sine göre grupla
            const varyantlarByUrunId = tumVaryantlar.reduce((acc, varyant) => {
                if (!acc[varyant.urun_id]) {
                    acc[varyant.urun_id] = [];
                }
                acc[varyant.urun_id].push(varyant);
                return acc;
            }, {});

            // Toplu güncelleme için array'ler
            const updates = [];
            const anaUpdates = [];


            const merkezDepoMiktari = await conMainMssql.raw(`
              SELECT 
              S.sto_kod,
              M.DepoMiktar
              FROM 
              STOKLAR S
              CROSS APPLY 
             (SELECT [dbo].[fn_DepodakiMiktar](S.sto_kod, 1, DATEFROMPARTS(YEAR(GETDATE()), 12, 31)) AS DepoMiktar) M

            `);


            const yoldakiDepoMiktari = await conMainMssql.raw(`
                SELECT 
                    sip_stok_kod as sto_kod,
                    SUM(sip_miktar - ISNULL(sip_teslim_miktar, 0)) AS DepoMiktar 
                FROM SIPARISLER 
                WHERE (sip_evrakno_seri = 'IST') 
                   OR (sip_evrakno_seri = 'TIST') 
                   OR (sip_evrakno_seri = 'T') 
                GROUP BY sip_stok_kod
            `);

            const uretimDepoMiktari = await conMainMssql.raw(`
         	SELECT pro_stokkodu as sto_kod,
             SUM(pro_miktar)- SUM(pro_tesmiktari) AS DepoMiktar
	        from dbo.PROFORMA_SIPARISLER 
            where pro_evrakno_seri='PVS' 
            or pro_evrakno_seri='TPVS' 
            or pro_evrakno_seri='T' 
            GROUP BY pro_stokkodu
            `);


            const miktar2Sorgulama = await conMainMssql.raw(`
         	Select sto_kod,sto_birim2_katsayi 
            from STOKLAR
            `);


            const alternatifler = await conMainMssql('STOK_ALTERNATIFLERI')
            .select('sa_kod as sto_kod','sa_alternatifkod');
    

            // Her stok için işlem yap
            for (const stok of stoklar) {
                const varyantlar = varyantlarByUrunId[stok.id] || [];
                let toplamMiktar = 0;
                let toplamYoldakiMiktar = 0;
                let toplamUretimMiktar = 0;
                let toplamMiktar2 = 0;
                // Her varyant için ayrı miktar hesapla
                for (const varyant of varyantlar) {
                    let toplamDepoMiktari = 0;
                    let toplamYoldakiMiktari = 0;
                    let toplamUretimMiktari = 0;

                    // Ana ürünün miktarını al
                    const merkez = merkezDepoMiktari.find(m => m.sto_kod === varyant.stok_kodu);
                    toplamDepoMiktari += merkez?.DepoMiktar || 0;

                    // Ana ürünün yoldaki miktarını al
                    const yoldaki = yoldakiDepoMiktari.find(m => m.sto_kod === varyant.stok_kodu);
                    toplamYoldakiMiktari += yoldaki?.DepoMiktar || 0;

                    // Ana ürünün üretimde miktarlarını al
                    const uretim = uretimDepoMiktari.find(m => m.sto_kod === varyant.stok_kodu);
                    toplamUretimMiktari += uretim?.DepoMiktar || 0;

                    // Ana ürünün miktar2 değerini al
                    const miktar2 = miktar2Sorgulama.find(m => m.sto_kod === varyant.stok_kodu);
                    toplamMiktar2 = Math.abs(miktar2?.sto_birim2_katsayi || 0);

                    // Alternatif ürünleri bul ve miktarlarını topla
                    const alternatiflerBul = alternatifler.filter(a => a.sa_alternatifkod === varyant.stok_kodu);


                    // Her alternatif için miktarları topla
                    for (const alternatif of alternatiflerBul) {
                        // Alternatif ürünün depo miktarlarını al
                        const merkez = merkezDepoMiktari.find(m => m.sto_kod === alternatif.sto_kod);
                        toplamDepoMiktari += merkez?.DepoMiktar || 0;

                        // Alternatif ürünün yoldaki miktarını al
                        const yoldaki = yoldakiDepoMiktari.find(m => m.sto_kod === alternatif.sto_kod);
                        toplamYoldakiMiktari += yoldaki?.DepoMiktar || 0;

                        // Alternatif ürünün üretimde miktarlarını al
                        const uretim = uretimDepoMiktari.find(m => m.sto_kod === alternatif.sto_kod);
                        toplamUretimMiktari += uretim?.DepoMiktar || 0;
                        
                    }

                    updates.push({
                        urun_id: stok.id,
                        varyant_id: varyant.id,
                        miktar: toplamDepoMiktari,
                        yoldaki_miktar: toplamYoldakiMiktari,
                        uretim_miktar: toplamUretimMiktari,
                        miktar2: toplamMiktar2
                    });

                    toplamMiktar += toplamDepoMiktari;
                    toplamYoldakiMiktar += toplamYoldakiMiktari;
                    toplamUretimMiktar += toplamUretimMiktari;
                }

                // Ana ürün güncellemesini hazırla
                anaUpdates.push({
                    urun_id: stok.id,
                    varyant_id: 0,
                    miktar: toplamMiktar,
                    yoldaki_miktar: toplamYoldakiMiktar,
                    uretim_miktar: toplamUretimMiktar,
                    miktar2: toplamMiktar2
                });
            }

            //console.log('updates', updates);
            //console.log('anaUpdates', anaUpdates);

      // Toplu güncellemeleri yap
      if (updates.length > 0) {
        for (let i = 0; i < updates.length; i += BATCH_SIZE) {
            const batch = updates.slice(i, i + BATCH_SIZE);
            const miktarCases = batch.map(u => 
                `WHEN urun_id = ${u.urun_id} AND varyant_id = ${u.varyant_id} THEN ${u.miktar}`
            ).join(' ');
            const yoldakiCases = batch.map(u => 
                `WHEN urun_id = ${u.urun_id} AND varyant_id = ${u.varyant_id} THEN ${u.yoldaki_miktar}`
            ).join(' ');
            const uretimCases = batch.map(u => 
                `WHEN urun_id = ${u.urun_id} AND varyant_id = ${u.varyant_id} THEN ${u.uretim_miktar}`
            ).join(' ');
            const miktar2Cases = batch.map(u => 
                `WHEN urun_id = ${u.urun_id} AND varyant_id = ${u.varyant_id} THEN ${u.miktar2}`
            ).join(' ');
            await trx.raw(`
                UPDATE urun_stok_miktarlari
                SET 
                    miktar = CASE ${miktarCases} END,
                    yoldaki_miktar = CASE ${yoldakiCases} END,
                    uretim_miktar = CASE ${uretimCases} END,
                    miktar2 = CASE ${miktar2Cases} END
                WHERE (urun_id, varyant_id) IN (${batch.map(u => `(${u.urun_id}, ${u.varyant_id})`).join(',')})
            `);
            console.log('batch', batch);
        }
    }

    if (anaUpdates.length > 0) {
        for (let i = 0; i < anaUpdates.length; i += BATCH_SIZE) {
            const batch = anaUpdates.slice(i, i + BATCH_SIZE);
            const miktarCases = batch.map(u => 
                `WHEN urun_id = ${u.urun_id} AND varyant_id = ${u.varyant_id} THEN ${u.miktar}`
            ).join(' ');
            const yoldakiCases = batch.map(u => 
                `WHEN urun_id = ${u.urun_id} AND varyant_id = ${u.varyant_id} THEN ${u.yoldaki_miktar}`
            ).join(' ');
            const uretimCases = batch.map(u => 
                `WHEN urun_id = ${u.urun_id} AND varyant_id = ${u.varyant_id} THEN ${u.uretim_miktar}`
            ).join(' ');
            const miktar2Cases = batch.map(u => 
                `WHEN urun_id = ${u.urun_id} AND varyant_id = ${u.varyant_id} THEN ${u.miktar2}`
            ).join(' ');
            await trx.raw(`
                UPDATE urun_stok_miktarlari
                SET 
                    miktar = CASE ${miktarCases} END,
                    yoldaki_miktar = CASE ${yoldakiCases} END,
                    uretim_miktar = CASE ${uretimCases} END,
                    miktar2 = CASE ${miktar2Cases} END
                WHERE (urun_id, varyant_id) IN (${batch.map(u => `(${u.urun_id}, ${u.varyant_id})`).join(',')})
                `);
            }
            console.log('anaUpdates', anaUpdates);
        }

            await trx.commit();

            return {
                status: 'success',
                message: 'Stok miktarları başarıyla güncellendi',
                stats: {
                    totalUpdates: updates.length + anaUpdates.length
                }
            };
        } catch (error) {
            if (trx) await trx.rollback();
            return {
                status: 'error',
                message: error.message
            };
        }
    }


    async topluResimEkle(req, res) {
        let trx;
        try {
            trx = await conMain.transaction();

            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const csvPath = path.join(__dirname, '..', '..', 'data', 'resimler.csv');

            // CSV dosyasını oku - delimiter'ı ; olarak değiştir
            const csvData = await new Promise((resolve, reject) => {
                const results = [];
                fs.createReadStream(csvPath)
                    .pipe(parse({
                        columns: true,
                        delimiter: ';'  // virgül yerine noktalı virgül kullan
                    }))
                    .on('data', (data) => {
                        // Veri yapısını düzelt
                        const stok_kodu = Object.values(data)[0];  // İlk sütun
                        const resim = Object.values(data)[1];      // İkinci sütun
                        results.push({ stok_kodu, resim });
                    })
                    .on('end', () => resolve(results))
                    .on('error', (error) => reject(error));
            });

            console.log('csvData', csvData);

            // Varyant bilgilerini tek seferde çek
            const varyantlar = await trx('urun_varyant')
                .select('id', 'urun_id', 'stok_kodu');

            // Hızlı arama için varyantları Map'e dönüştür
            const varyantMap = new Map(
                varyantlar.map(v => [v.stok_kodu, { id: v.id, urun_id: v.urun_id }])
            );

            // Resim eklemeleri için array
            const resimEklemeleri = [];
            const urunIdSet = new Set(); // Hangi ürün ID'lerinin işlendiğini takip etmek için

            // Her CSV satırı için işlem yap
            for (const row of csvData) {
                const varyantBilgi = varyantMap.get(row.stok_kodu);
                
                if (varyantBilgi) {
                    resimEklemeleri.push({
                        urun_id: varyantBilgi.urun_id,
                        varyant_id: varyantBilgi.id,
                        resim: row.resim,
                        varsayilan: !urunIdSet.has(varyantBilgi.urun_id) ? 1 : 0 // İlk kez görülen ürün ID'si için varsayilan=1
                    });
                    urunIdSet.add(varyantBilgi.urun_id); // Ürün ID'sini sete ekle
                }
            }

            // Toplu ekleme işlemi
            if (resimEklemeleri.length > 0) {
                await trx('urun_resimleri').insert(resimEklemeleri);
            }

            await trx.commit();

            return {
                status: 'success',
                message: 'Resimler başarıyla eklendi',
                stats: {
                    totalImages: resimEklemeleri.length
                }
            };

        } catch (error) {
            if (trx) await trx.rollback();
            return {
                status: 'error',
                message: error.message
            };
        }
    }


    async topluDosyaEkle(req, res) {
        let trx;
        try {
            trx = await conMain.transaction();

            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const csvPath = path.join(__dirname, '..', '..', 'data', 'dosyalar.csv');

            // CSV dosyasını oku
            const csvData = await new Promise((resolve, reject) => {
                const results = [];
                fs.createReadStream(csvPath)
                    .pipe(parse({
                        columns: true,
                        delimiter: ';'
                    }))
                    .on('data', (data) => {
                        const family_name = Object.values(data)[0];
                        const dosya = Object.values(data)[1];
                        results.push({ family_name, dosya });
                    })
                    .on('end', () => resolve(results))
                    .on('error', (error) => reject(error));
            });

            // Ürün bilgilerini çek
            const urunler = await trx('urun_alt_bilgileri')
                .select('id as urun_id', 'urun_adi');

            // Ürünleri Map'e dönüştür
            const urunMap = new Map(
                urunler.map(u => [u.urun_adi, u.urun_id])
            );

            // Dosya eklemeleri için array
            const dosyaEklemeleri = [];

            // Her CSV satırı için işlem yap
            for (const row of csvData) {
                const urunId = urunMap.get(row.family_name);
                
                if (urunId) {
                    // Dosya adından uzantıyı kaldır
                    const dosyaAdi = row.dosya.substring(0, row.dosya.lastIndexOf('.'));
                    
                    dosyaEklemeleri.push({
                        urun_id: urunId,
                        dosya_id: 1, // Sabit değer olarak 1
                        dosya_adi: dosyaAdi,
                        dosya_yolu: row.dosya
                    });
                }
            }

            // Toplu ekleme işlemi
            if (dosyaEklemeleri.length > 0) {
                await trx('urun_dosya_grup').insert(dosyaEklemeleri);
            }

            await trx.commit();

            return {
                status: 'success',
                message: 'Dosyalar başarıyla eklendi',
                stats: {
                    totalFiles: dosyaEklemeleri.length
                }
            };

        } catch (error) {
            if (trx) await trx.rollback();
            return {
                status: 'error',
                message: error.message
            };
        }
    }
        
    async cariEkstreListe(req, res) {

        try {
            const { ilkTarih, sonTarih } = req.params;
            const cariKodu = req.locals.user.kodu;

            const query = `
                DECLARE @carikodu NVARCHAR(25) = '${cariKodu}';
                DECLARE @ilktarih DATETIME = '${ilkTarih}';
                DECLARE @sontarih DATETIME = '${sonTarih}';
WITH Cari_Ekstresi_Fatura_Stok_Detayi
AS (
	SELECT CHI.cha_kod Cari_Kod,
		CHI.cha_tarihi Evrak_Tarihi,
		CASE WHEN LEN(LTRIM(RTRIM(cha_evrakno_seri))) > 0 THEN LTRIM(RTRIM(cha_evrakno_seri)) + '-' ELSE '' END + CONVERT(NVARCHAR(50), cha_evrakno_sira) Evrak_No,
		cha_evrakno_seri as seri,
		cha_evrakno_sira as sira,
		cha_belge_no Belge_No,
		cha_belge_tarih as Belge_Tarih,
		CHEVRISIM.CHEvrUzunIsim Evrak_Tipi,
		CHCINS.CHCinsIsim Hareket_Cinsi,
		CHA.cha_trefno Referans_No,
		dbo.fn_OpVadeTarih(CHA.cha_vade, CHA.cha_tarihi) Vade,
		sth_aciklama Aciklama,
		sth_stok_kod Stok_Hizmet_Kodu,
		ST.sto_isim Stok_Hizmet_Ismi,
		sto_birim1_ad Birim_1,
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN sth_miktar END AS [Giris_Miktari],
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN sth_miktar END AS [Cikis_Miktari],
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN dbo.fn_StokHareketNetDeger(sth_tutar + sth_vergi + sth_otvtutari + sth_oivtutari, sth_iskonto1, sth_iskonto2, sth_iskonto3, sth_iskonto4, sth_iskonto5, sth_iskonto6, sth_masraf1, sth_masraf2, sth_masraf3, sth_masraf4, sth_otvtutari, sth_oivtutari, sth_tip, 0, sth_har_doviz_kuru, sth_alt_doviz_kuru, sth_stok_doviz_kuru) ELSE 0 END AS [TL_Doviz_Borc],
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN dbo.fn_StokHareketNetDeger(sth_tutar + sth_vergi + sth_otvtutari + sth_oivtutari, sth_iskonto1, sth_iskonto2, sth_iskonto3, sth_iskonto4, sth_iskonto5, sth_iskonto6, sth_masraf1, sth_masraf2, sth_masraf3, sth_masraf4, sth_otvtutari, sth_oivtutari, sth_tip, 0, sth_har_doviz_kuru, sth_alt_doviz_kuru, sth_stok_doviz_kuru) ELSE 0 END AS [TL_Doviz_Alacak],
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN dbo.fn_StokHareketNetDeger(sth_tutar + sth_vergi + sth_otvtutari + sth_oivtutari, sth_iskonto1, sth_iskonto2, sth_iskonto3, sth_iskonto4, sth_iskonto5, sth_iskonto6, sth_masraf1, sth_masraf2, sth_masraf3, sth_masraf4, sth_otvtutari, sth_oivtutari, sth_tip, 1, sth_har_doviz_kuru, sth_alt_doviz_kuru, sth_stok_doviz_kuru)  ELSE 0 END AS [Alt_Doviz_Borc],
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN dbo.fn_StokHareketNetDeger(sth_tutar + sth_vergi + sth_otvtutari + sth_oivtutari, sth_iskonto1, sth_iskonto2, sth_iskonto3, sth_iskonto4, sth_iskonto5, sth_iskonto6, sth_masraf1, sth_masraf2, sth_masraf3, sth_masraf4, sth_otvtutari, sth_oivtutari, sth_tip, 1, sth_har_doviz_kuru, sth_alt_doviz_kuru, sth_stok_doviz_kuru)  ELSE 0 END AS [Alt_Doviz_Alacak],
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN dbo.fn_StokHareketNetDeger(sth_tutar + sth_vergi + sth_otvtutari + sth_oivtutari, sth_iskonto1, sth_iskonto2, sth_iskonto3, sth_iskonto4, sth_iskonto5, sth_iskonto6, sth_masraf1, sth_masraf2, sth_masraf3, sth_masraf4, sth_otvtutari, sth_oivtutari, sth_tip, 0, sth_har_doviz_kuru, sth_alt_doviz_kuru, sth_stok_doviz_kuru) / NULLIF(sth_har_doviz_kuru, 0) ELSE 0 END AS [Orj_Doviz_Borc],
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN dbo.fn_StokHareketNetDeger(sth_tutar + sth_vergi + sth_otvtutari + sth_oivtutari, sth_iskonto1, sth_iskonto2, sth_iskonto3, sth_iskonto4, sth_iskonto5, sth_iskonto6, sth_masraf1, sth_masraf2, sth_masraf3, sth_masraf4, sth_otvtutari, sth_oivtutari, sth_tip, 0, sth_har_doviz_kuru, sth_alt_doviz_kuru, sth_stok_doviz_kuru) / NULLIF(sth_har_doviz_kuru, 0) ELSE 0 END AS [Orj_Doviz_Alacak],
		CHA.cha_d_kur Orijinal_Doviz_Kur,
		CHA.cha_projekodu Proje_Kodu,
		PRJ.pro_adi Proje_Ismi,
		CHA.cha_srmrkkodu Sorumluluk_Merkezi_Kodu,
		SRMMRK.som_isim Sorumluluk_Merkezi_Ismi,
		CHA.cha_karsisrmrkkodu Karsi_Sorumluluk_Merkezi_Kodu,
		SRMMRKKARSI.som_isim Karsi_Sorumluluk_Merkezi_Ismi,
		CHA.cha_EXIMkodu Ithalat_Ihracat_Kodu,
		CHI.CHA_CARI_BORC_ALACAK_TIP Borc_Alacak_Tip,
		CHA_NORMAL_CARI_DOVIZ_SEMBOLU Doviz_Ismi,
		ROW_NUMBER() OVER (
			PARTITION BY CHA.cha_kod ORDER BY CHA.cha_kod,
				CHA.cha_grupno,
				CHA.cha_tarihi,
				CHA.cha_lastup_date,
				CHA.cha_evrak_tip,
				CHA.cha_evrakno_seri,
				CHA.cha_evrakno_sira,
				sth_evrakno_seri,
				sth_evrakno_sira,
				sth_satirno
			) AS Satir_Siralamasi,
		DP.dep_no Depo_No,
		DP.dep_adi Depo_Ismi,
		CHA.cha_grupno Cari_Hareket_Grup_No
		,1 AS  Program_No
		,CHA.cha_kasa_hizkod Karsi_Hesap_Kodu
		,dbo.fn_CarininIsminiBul(CHA.cha_kasa_hizmet,CHA.cha_kasa_hizkod) Karsi_Hesap_Ismi
		,ISNULL(CCI.CCinsIsim,'') Karsi_Hesap_Cinsi
	FROM dbo.CARI_HESAP_HAREKETLERI_VIEW_WITH_INDEX_03_SPECIAL AS CHI WITH (NOLOCK)
	INNER JOIN CARI_HESAP_HAREKETLERI CHA ON CHA.cha_Guid = CHI.cha_Guid
	INNER JOIN STOK_HAREKETLERI STH ON STH.sth_fat_uid = CHA.cha_Guid
	INNER JOIN STOKLAR ST ON ST.sto_kod = STH.sth_stok_kod
	LEFT JOIN vw_Cari_Hareket_Cins_Isimleri CHCINS ON CHCINS.CHCinsNo = CHA.cha_cinsi
	LEFT JOIN vw_Cari_Hareket_Evrak_Isimleri CHEVRISIM ON CHEVRISIM.CHEvrNo = CHA.cha_evrak_tip
	LEFT JOIN PROJELER PRJ ON PRJ.pro_kodu = CHA.cha_projekodu
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRK ON SRMMRK.som_kod = CHA.cha_srmrkkodu
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRKKARSI ON SRMMRKKARSI.som_kod = CHA.cha_karsisrmrkkodu
	LEFT JOIN KUR_ISIMLERI_VIEW KI ON KI.KUR_NUMARASI = CHA.cha_d_cins
	LEFT JOIN DEPOLAR DP ON DP.dep_no = CASE WHEN STH.sth_tip = 0 THEN sth_giris_depo_no ELSE sth_cikis_depo_no END
	LEFT JOIN vw_Cari_Cins_Isimleri CCI ON CCI.CCinsNo = CHA.cha_kasa_hizmet AND CHA.cha_kasa_hizkod <> ''
	WHERE (CHA.cha_cari_cins = 0)
		AND CHI.cha_tarihi >= @ilktarih
		AND CHI.cha_tarihi <= @sontarih
		AND (
			CHI.cha_kod = @carikodu
			OR @carikodu = 'Hepsi'
			)
		AND (
			CHA.cha_evrak_tip IN (0, 63)
			AND CHA.cha_cinsi IN (6, 7, 9, 13, 15, 29)
			)
		AND (CHA.cha_tpoz = 0)
	UNION ALL
	SELECT CHA.cha_ciro_cari_kodu Cari_Kod,
		CHI.cha_tarihi Evrak_Tarihi,
		CASE WHEN LEN(LTRIM(RTRIM(cha_evrakno_seri))) > 0 THEN LTRIM(RTRIM(cha_evrakno_seri)) + '-' ELSE '' END + CONVERT(NVARCHAR(50), cha_evrakno_sira) Evrak_No,
		cha_evrakno_seri as seri,
		cha_evrakno_sira as sira,
		cha_belge_no Belge_No,
		cha_belge_tarih Belge_Tarih,
		CHEVRISIM.CHEvrUzunIsim Evrak_Tipi,
		CHCINS.CHCinsIsim Hareket_Cinsi,
		CHA.cha_trefno Referans_No,
		dbo.fn_OpVadeTarih(CHA.cha_vade, CHA.cha_tarihi) Vade,
		sth_aciklama Aciklama,
		sth_stok_kod Stok_Hizmet_Kodu,
		ST.sto_isim Stok_Hizmet_Ismi,
		sto_birim1_ad Birim_1,
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN sth_miktar END AS [Giris_Miktari],
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN sth_miktar END AS [Cikis_Miktari],
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN dbo.fn_StokHareketNetDeger(sth_tutar + sth_vergi + sth_otvtutari + sth_oivtutari, sth_iskonto1, sth_iskonto2, sth_iskonto3, sth_iskonto4, sth_iskonto5, sth_iskonto6, sth_masraf1, sth_masraf2, sth_masraf3, sth_masraf4, sth_otvtutari, sth_oivtutari, sth_tip, 0, sth_har_doviz_kuru, sth_alt_doviz_kuru, sth_stok_doviz_kuru) ELSE 0 END AS [TL_Doviz_Borc],
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN dbo.fn_StokHareketNetDeger(sth_tutar + sth_vergi + sth_otvtutari + sth_oivtutari, sth_iskonto1, sth_iskonto2, sth_iskonto3, sth_iskonto4, sth_iskonto5, sth_iskonto6, sth_masraf1, sth_masraf2, sth_masraf3, sth_masraf4, sth_otvtutari, sth_oivtutari, sth_tip, 0, sth_har_doviz_kuru, sth_alt_doviz_kuru, sth_stok_doviz_kuru) ELSE 0 END AS [TL_Doviz_Alacak],
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN dbo.fn_StokHareketNetDeger(sth_tutar + sth_vergi + sth_otvtutari + sth_oivtutari, sth_iskonto1, sth_iskonto2, sth_iskonto3, sth_iskonto4, sth_iskonto5, sth_iskonto6, sth_masraf1, sth_masraf2, sth_masraf3, sth_masraf4, sth_otvtutari, sth_oivtutari, sth_tip, 1, sth_har_doviz_kuru, sth_alt_doviz_kuru, sth_stok_doviz_kuru) / NULLIF(sth_har_doviz_kuru, 0) ELSE 0 END AS [Alt_Doviz_Borc],
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN dbo.fn_StokHareketNetDeger(sth_tutar + sth_vergi + sth_otvtutari + sth_oivtutari, sth_iskonto1, sth_iskonto2, sth_iskonto3, sth_iskonto4, sth_iskonto5, sth_iskonto6, sth_masraf1, sth_masraf2, sth_masraf3, sth_masraf4, sth_otvtutari, sth_oivtutari, sth_tip, 1, sth_har_doviz_kuru, sth_alt_doviz_kuru, sth_stok_doviz_kuru) / NULLIF(sth_har_doviz_kuru, 0) ELSE 0 END AS [Alt_Doviz_Alacak],
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN dbo.fn_StokHareketNetDeger(sth_tutar + sth_vergi + sth_otvtutari + sth_oivtutari, sth_iskonto1, sth_iskonto2, sth_iskonto3, sth_iskonto4, sth_iskonto5, sth_iskonto6, sth_masraf1, sth_masraf2, sth_masraf3, sth_masraf4, sth_otvtutari, sth_oivtutari, sth_tip, 0, sth_har_doviz_kuru, sth_alt_doviz_kuru, sth_stok_doviz_kuru) / NULLIF(sth_har_doviz_kuru, 0) ELSE 0 END AS [Orj_Doviz_Borc],
		CASE WHEN CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN dbo.fn_StokHareketNetDeger(sth_tutar + sth_vergi + sth_otvtutari + sth_oivtutari, sth_iskonto1, sth_iskonto2, sth_iskonto3, sth_iskonto4, sth_iskonto5, sth_iskonto6, sth_masraf1, sth_masraf2, sth_masraf3, sth_masraf4, sth_otvtutari, sth_oivtutari, sth_tip, 0, sth_har_doviz_kuru, sth_alt_doviz_kuru, sth_stok_doviz_kuru) / NULLIF(sth_har_doviz_kuru, 0) ELSE 0 END AS [Orj_Doviz_Alacak],
		CHA.cha_d_kur Orijinal_Doviz_Kur,
		CHA.cha_projekodu Proje_Kodu,
		PRJ.pro_adi Proje_Ismi,
		CHA.cha_srmrkkodu Sorumluluk_Merkezi_Kodu,
		SRMMRK.som_isim Sorumluluk_Merkezi_Ismi,
		CHA.cha_karsisrmrkkodu Karsi_Sorumluluk_Merkezi_Kodu,
		SRMMRKKARSI.som_isim Karsi_Sorumluluk_Merkezi_Ismi,
		CHA.cha_EXIMkodu Ithalat_Ihracat_Kodu,
		CHI.CHA_CARI_BORC_ALACAK_TIP Borc_Alacak_Tip,
		CHA_NORMAL_CARI_DOVIZ_SEMBOLU Doviz_Ismi,
		ROW_NUMBER() OVER (
			PARTITION BY CHA.cha_kod ORDER BY CHA.cha_kod,
				CHA.cha_grupno,
				CHA.cha_tarihi,
				cha_lastup_date,
				CHA.cha_evrak_tip,
				CHA.cha_evrakno_seri,
				CHA.cha_evrakno_sira,
				sth_evrakno_seri,
				sth_evrakno_sira,
				sth_satirno
			) AS Satir_Siralamasi,
		DP.dep_no Depo_No,
		DP.dep_adi Depo_Ismi,
		CHA.cha_grupno Cari_Hareket_Grup_No
			,2 AS  Program_No
		,CHA.cha_kod Karsi_Hesap_Kodu
		,dbo.fn_CarininIsminiBul(CHA.cha_cari_cins,CHA.cha_kod) Karsi_Hesap_Ismi
		,ISNULL(CCI.CCinsIsim,'') Karsi_Hesap_Cinsi
	FROM dbo.CARI_HESAP_HAREKETLERI_VIEW_WITH_INDEX_03_SPECIAL AS CHI WITH (NOLOCK)
	INNER JOIN CARI_HESAP_HAREKETLERI CHA ON CHA.cha_Guid = CHI.cha_Guid
	INNER JOIN STOK_HAREKETLERI STH ON STH.sth_fat_uid = CHA.cha_Guid
	INNER JOIN STOKLAR ST ON ST.sto_kod = STH.sth_stok_kod
	LEFT JOIN vw_Cari_Hareket_Cins_Isimleri CHCINS ON CHCINS.CHCinsNo = CHA.cha_cinsi
	LEFT JOIN vw_Cari_Hareket_Evrak_Isimleri CHEVRISIM ON CHEVRISIM.CHEvrNo = CHA.cha_evrak_tip
	LEFT JOIN PROJELER PRJ ON PRJ.pro_kodu = CHA.cha_projekodu
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRK ON SRMMRK.som_kod = CHA.cha_srmrkkodu
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRKKARSI ON SRMMRKKARSI.som_kod = CHA.cha_karsisrmrkkodu
	LEFT JOIN KUR_ISIMLERI_VIEW KI ON KI.KUR_NUMARASI = CHA.cha_d_cins
	LEFT JOIN DEPOLAR DP ON DP.dep_no = CASE WHEN STH.sth_tip = 0 THEN sth_giris_depo_no ELSE sth_cikis_depo_no END
	LEFT JOIN vw_Cari_Cins_Isimleri CCI ON CCI.CCinsNo = CHA.cha_cari_cins AND CHA.cha_kod <> ''
	WHERE CHI.cha_tarihi >= @ilktarih
		AND CHI.cha_tarihi <= @sontarih
		AND (
			CHA.cha_ciro_cari_kodu = @carikodu
			OR @carikodu = 'Hepsi'
			)
		AND (
			CHA.cha_evrak_tip IN (0, 63)
			AND CHA.cha_cinsi IN (6, 7, 9, 13, 15, 29)
			)
		AND (CHA.cha_tpoz > 0)
	),
Cari_Ekstresi_Fatura_Masraf_Hizmet_Detayi
AS (
	SELECT CHI.cha_kod Cari_Kod,
		CHI.cha_tarihi Evrak_Tarihi,
		CASE WHEN LEN(LTRIM(RTRIM(CHA.cha_evrakno_seri))) > 0 THEN LTRIM(RTRIM(CHA.cha_evrakno_seri)) + '-' ELSE '' END + CONVERT(NVARCHAR(50), CHA.cha_evrakno_sira) Evrak_No,
		CHA.cha_evrakno_seri as seri,
		CHA.cha_evrakno_sira as sira,
		CHA.cha_belge_no Belge_No,
		CHA.cha_belge_tarih Belge_Tarih,
		CHEVRISIM.CHEvrUzunIsim Evrak_Tipi,
		CHCINS.CHCinsIsim Hareket_Cinsi,
		CHA.cha_trefno Referans_No,
		dbo.fn_OpVadeTarih(CHA.cha_vade, CHA.cha_tarihi) Vade,
		CHA.cha_aciklama Aciklama,
		CHA.cha_kasa_hizkod Stok_Hizmet_Kodu,
		dbo.fn_CarininIsminiBul(CHA.cha_kasa_hizmet, CHA.cha_kasa_hizkod) Stok_Hizmet_Ismi,
		'ADET' Birim_1,
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHA.cha_miktari END AS [Giris_Miktari],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHA.cha_miktari END AS [Cikis_Miktari],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ANA ELSE 0 END AS [TL_Doviz_Borc],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ANA ELSE 0 END AS [TL_Doviz_Alacak],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ALT ELSE 0 END AS [Alt_Doviz_Borc],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ALT ELSE 0 END AS [Alt_Doviz_Alacak],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ORJ ELSE 0 END AS [Orj_Doviz_Borc],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ORJ ELSE 0 END AS [Orj_Doviz_Alacak],
		CHA.cha_d_kur Orijinal_Doviz_Kur,
		CHA.cha_projekodu Proje_Kodu,
		PRJ.pro_adi Proje_Ismi,
		CHA.cha_srmrkkodu Sorumluluk_Merkezi_Kodu,
		SRMMRK.som_isim Sorumluluk_Merkezi_Ismi,
		CHA.cha_karsisrmrkkodu Karsi_Sorumluluk_Merkezi_Kodu,
		SRMMRKKARSI.som_isim Karsi_Sorumluluk_Merkezi_Ismi,
		CHA.cha_EXIMkodu Ithalat_Ihracat_Kodu,
		CHI.CHA_CARI_BORC_ALACAK_TIP Borc_Alacak_Tip,
		CHA_NORMAL_CARI_DOVIZ_SEMBOLU Doviz_Ismi,
		ROW_NUMBER() OVER (
			PARTITION BY CHA.cha_kod ORDER BY CHA.cha_kod,
				CHA.cha_grupno,
				CHA.cha_tarihi,
				cha_lastup_date,
				CHA.cha_evrak_tip,
				CHA.cha_evrakno_seri,
				CHA.cha_evrakno_sira,
				CHA.cha_satir_no
			) AS Satir_Siralamasi,
		'' Depo_No,
		'' Depo_Ismi,
		CHA.cha_grupno Cari_Hareket_Grup_No
			,3 AS  Program_No
		,CHA.cha_kasa_hizkod Karsi_Hesap_Kodu
		,dbo.fn_CarininIsminiBul(CHA.cha_kasa_hizmet,CHA.cha_kasa_hizkod) Karsi_Hesap_Ismi
		,ISNULL(CCI.CCinsIsim,'') Karsi_Hesap_Cinsi
	FROM dbo.CARI_HESAP_HAREKETLERI_VIEW_WITH_INDEX_03_SPECIAL AS CHI WITH (NOLOCK)
	INNER JOIN CARI_HESAP_HAREKETLERI CHA ON CHA.cha_Guid = CHI.cha_Guid
	LEFT JOIN vw_Cari_Hareket_Cins_Isimleri CHCINS ON CHCINS.CHCinsNo = CHA.cha_cinsi
	LEFT JOIN vw_Cari_Hareket_Evrak_Isimleri CHEVRISIM ON CHEVRISIM.CHEvrNo = CHA.cha_evrak_tip
	LEFT JOIN PROJELER PRJ ON PRJ.pro_kodu = CHA.cha_projekodu
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRK ON SRMMRK.som_kod = CHA.cha_srmrkkodu
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRKKARSI ON SRMMRKKARSI.som_kod = CHA.cha_karsisrmrkkodu
	LEFT JOIN KUR_ISIMLERI_VIEW KI ON KI.KUR_NUMARASI = CHA.cha_d_cins
LEFT JOIN vw_Cari_Cins_Isimleri CCI ON CCI.CCinsNo = CHA.cha_kasa_hizmet AND CHA.cha_kasa_hizkod <> ''
	WHERE (CHA.cha_cari_cins = 0)
		AND CHI.cha_tarihi >= @ilktarih
		AND CHI.cha_tarihi <= @sontarih
		AND (
			CHI.cha_kod = @carikodu
			OR @carikodu = 'Hepsi'
			)
		AND (
			CHA.cha_evrak_tip IN (0, 63)
			AND CHA.cha_cinsi NOT IN (6, 7, 9, 13, 15, 29)
			)
		AND (CHA.cha_tpoz = 0)
	UNION ALL
	SELECT CHA.cha_ciro_cari_kodu Cari_Kod,
		CHI.cha_tarihi Evrak_Tarihi,
		CASE WHEN LEN(LTRIM(RTRIM(CHA.cha_evrakno_seri))) > 0 THEN LTRIM(RTRIM(CHA.cha_evrakno_seri)) + '-' ELSE '' END + CONVERT(NVARCHAR(50), CHA.cha_evrakno_sira) Evrak_No,
		CHA.cha_evrakno_seri as seri,
		CHA.cha_evrakno_sira as sira,
		CHA.cha_belge_no Belge_No,
		CHA.cha_belge_tarih Belge_Tarih,
		CHEVRISIM.CHEvrUzunIsim Evrak_Tipi,
		CHCINS.CHCinsIsim Hareket_Cinsi,
		CHA.cha_trefno Referans_No,
		dbo.fn_OpVadeTarih(CHA.cha_vade, CHA.cha_tarihi) Vade,
		CHA.cha_aciklama Aciklama,
		CHA.cha_kasa_hizkod Stok_Hizmet_Kodu,
		dbo.fn_CarininIsminiBul(CHA.cha_kasa_hizmet, CHA.cha_kasa_hizkod) Stok_Hizmet_Ismi,
		'ADET' Birim_1,
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHA.cha_miktari END AS [Giris_Miktari],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHA.cha_miktari END AS [Cikis_Miktari],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ANA ELSE 0 END AS [TL_Doviz_Borc],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ANA ELSE 0 END AS [TL_Doviz_Alacak],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ALT ELSE 0 END AS [Alt_Doviz_Borc],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ALT ELSE 0 END AS [Alt_Doviz_Alacak],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ORJ ELSE 0 END AS [Orj_Doviz_Borc],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ORJ ELSE 0 END AS [Orj_Doviz_Alacak],
		CHA.cha_d_kur Orijinal_Doviz_Kur,
		CHA.cha_projekodu Proje_Kodu,
		PRJ.pro_adi Proje_Ismi,
		CHA.cha_srmrkkodu Sorumluluk_Merkezi_Kodu,
		SRMMRK.som_isim Sorumluluk_Merkezi_Ismi,
		CHA.cha_karsisrmrkkodu Karsi_Sorumluluk_Merkezi_Kodu,
		SRMMRKKARSI.som_isim Karsi_Sorumluluk_Merkezi_Ismi,
		CHA.cha_EXIMkodu Ithalat_Ihracat_Kodu,
		CHI.CHA_CARI_BORC_ALACAK_TIP Borc_Alacak_Tip,
		CHA_NORMAL_CARI_DOVIZ_SEMBOLU Doviz_Ismi,
		ROW_NUMBER() OVER (
			PARTITION BY CHA.cha_kod ORDER BY CHA.cha_kod,
				CHA.cha_grupno,
				CHA.cha_tarihi,
				cha_lastup_date,
				CHA.cha_evrak_tip,
				CHA.cha_evrakno_seri,
				CHA.cha_evrakno_sira,
				CHA.cha_satir_no
			) AS Satir_Siralamasi,
		'' Depo_No,
		'' Depo_Ismi,
		CHA.cha_grupno Cari_Hareket_Grup_No
			,4 AS  Program_No
			,CHA.cha_kasa_hizkod Karsi_Hesap_Kodu
		,dbo.fn_CarininIsminiBul(CHA.cha_kasa_hizmet,CHA.cha_kasa_hizkod) Karsi_Hesap_Ismi
		,ISNULL(CCI.CCinsIsim,'') Karsi_Hesap_Cinsi
	FROM dbo.CARI_HESAP_HAREKETLERI_VIEW_WITH_INDEX_03_SPECIAL AS CHI WITH (NOLOCK)
	INNER JOIN CARI_HESAP_HAREKETLERI CHA ON CHA.cha_Guid = CHI.cha_Guid
	LEFT JOIN vw_Cari_Hareket_Cins_Isimleri CHCINS ON CHCINS.CHCinsNo = CHA.cha_cinsi
	LEFT JOIN vw_Cari_Hareket_Evrak_Isimleri CHEVRISIM ON CHEVRISIM.CHEvrNo = CHA.cha_evrak_tip
	LEFT JOIN PROJELER PRJ ON PRJ.pro_kodu = CHA.cha_projekodu
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRK ON SRMMRK.som_kod = CHA.cha_srmrkkodu
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRKKARSI ON SRMMRKKARSI.som_kod = CHA.cha_karsisrmrkkodu
	LEFT JOIN KUR_ISIMLERI_VIEW KI ON KI.KUR_NUMARASI = CHA.cha_d_cins
LEFT JOIN vw_Cari_Cins_Isimleri CCI ON CCI.CCinsNo = CHA.cha_kasa_hizmet AND CHA.cha_kasa_hizkod <> ''
	WHERE CHI.cha_tarihi >= @ilktarih
		AND CHI.cha_tarihi <= @sontarih
		AND (
			CHA.cha_ciro_cari_kodu = @carikodu
			OR @carikodu = 'Hepsi'
			)
		AND (
			CHA.cha_evrak_tip IN (0, 63)
			AND CHA.cha_cinsi NOT IN (6, 7, 9, 13, 15, 29)
			)
		AND (CHA.cha_tpoz > 0)
	)
	,Fatura_Harici_Hareketler AS
	(SELECT CHI.cha_kod Cari_Kod,
		CHI.cha_tarihi Evrak_Tarihi,
		CASE WHEN LEN(LTRIM(RTRIM(CHA.cha_evrakno_seri))) > 0 THEN LTRIM(RTRIM(CHA.cha_evrakno_seri)) + '-' ELSE '' END + CONVERT(NVARCHAR(50), CHA.cha_evrakno_sira) Evrak_No,
		CHA.cha_evrakno_seri as seri,
		CHA.cha_evrakno_sira as sira,
		CHA.cha_belge_no Belge_No,
		CHA.cha_belge_tarih Belge_Tarih,
		CHEVRISIM.CHEvrUzunIsim Evrak_Tipi,
		CHCINS.CHCinsIsim Hareket_Cinsi,
		CHA.cha_trefno Referans_No,
		dbo.fn_OpVadeTarih(CHA.cha_vade, CHA.cha_tarihi) Vade,
		CHA.cha_aciklama Aciklama,
		CHA.cha_kasa_hizkod Stok_Hizmet_Kodu,
		dbo.fn_CarininIsminiBul(CHA.cha_kasa_hizmet, CHA.cha_kasa_hizkod) Stok_Hizmet_Ismi,
		'' Birim_1,
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHA.cha_miktari END AS [Giris_Miktari],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHA.cha_miktari END AS [Cikis_Miktari],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ANA ELSE 0 END AS [TL_Doviz_Borc],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ANA ELSE 0 END AS [TL_Doviz_Alacak],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ALT ELSE 0 END AS [Alt_Doviz_Borc],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ALT ELSE 0 END AS [Alt_Doviz_Alacak],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ORJ ELSE 0 END AS [Orj_Doviz_Borc],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ORJ ELSE 0 END AS [Orj_Doviz_Alacak],
		CHA.cha_d_kur Orijinal_Doviz_Kur,
		CHA.cha_projekodu Proje_Kodu,
		PRJ.pro_adi Proje_Ismi,
		CHA.cha_srmrkkodu Sorumluluk_Merkezi_Kodu,
		SRMMRK.som_isim Sorumluluk_Merkezi_Ismi,
		CHA.cha_karsisrmrkkodu Karsi_Sorumluluk_Merkezi_Kodu,
		SRMMRKKARSI.som_isim Karsi_Sorumluluk_Merkezi_Ismi,
		CHA.cha_EXIMkodu Ithalat_Ihracat_Kodu,
		CHI.CHA_CARI_BORC_ALACAK_TIP Borc_Alacak_Tip,
		CHA_NORMAL_CARI_DOVIZ_SEMBOLU Doviz_Ismi,
		ROW_NUMBER() OVER (
			PARTITION BY CHA.cha_kod ORDER BY CHA.cha_kod,
				CHA.cha_grupno,
				CHA.cha_tarihi,
				cha_lastup_date,
				CHA.cha_evrak_tip,
				CHA.cha_evrakno_seri,
				CHA.cha_evrakno_sira,
				CHA.cha_satir_no
			) AS Satir_Siralamasi,
		'' Depo_No,
		'' Depo_Ismi,
		CHA.cha_grupno Cari_Hareket_Grup_No
			,5 AS  Program_No
	,CHA.cha_kasa_hizkod Karsi_Hesap_Kodu
		,dbo.fn_CarininIsminiBul(CHA.cha_kasa_hizmet,CHA.cha_kasa_hizkod) Karsi_Hesap_Ismi
		,ISNULL(CCI.CCinsIsim,'') Karsi_Hesap_Cinsi
	FROM dbo.CARI_HESAP_HAREKETLERI_VIEW_WITH_INDEX_03_SPECIAL AS CHI WITH (NOLOCK)
	INNER JOIN CARI_HESAP_HAREKETLERI CHA ON CHA.cha_Guid = CHI.cha_Guid
	LEFT JOIN vw_Cari_Hareket_Cins_Isimleri CHCINS ON CHCINS.CHCinsNo = CHA.cha_cinsi
	LEFT JOIN vw_Cari_Hareket_Evrak_Isimleri CHEVRISIM ON CHEVRISIM.CHEvrNo = CHA.cha_evrak_tip
	LEFT JOIN PROJELER PRJ ON PRJ.pro_kodu = CHA.cha_projekodu
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRK ON SRMMRK.som_kod = CHA.cha_srmrkkodu
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRKKARSI ON SRMMRKKARSI.som_kod = CHA.cha_karsisrmrkkodu
	LEFT JOIN KUR_ISIMLERI_VIEW KI ON KI.KUR_NUMARASI = CHA.cha_d_cins
LEFT JOIN vw_Cari_Cins_Isimleri CCI ON CCI.CCinsNo = CHA.cha_kasa_hizmet AND CHA.cha_kasa_hizkod <> ''
	WHERE (CHA.cha_cari_cins = 0)
		AND CHI.cha_tarihi >= @ilktarih
		AND CHI.cha_tarihi <= @sontarih
		AND (
			CHI.cha_kod = @carikodu
			OR @carikodu = 'Hepsi'
			)
		AND (
			CHA.cha_evrak_tip NOT IN (0, 63))
		UNION ALL
		SELECT CHA.cha_kasa_hizkod Cari_Kod,
		CHI.cha_tarihi Evrak_Tarihi,
		CASE WHEN LEN(LTRIM(RTRIM(CHA.cha_evrakno_seri))) > 0 THEN LTRIM(RTRIM(CHA.cha_evrakno_seri)) + '-' ELSE '' END + CONVERT(NVARCHAR(50), CHA.cha_evrakno_sira) Evrak_No,
		CHA.cha_evrakno_seri as seri,
		CHA.cha_evrakno_sira as sira,
		CHA.cha_belge_no Belge_No,
		CHA.cha_belge_tarih Belge_Tarih,
		CHEVRISIM.CHEvrUzunIsim Evrak_Tipi,
		CHCINS.CHCinsIsim Hareket_Cinsi,
		CHA.cha_trefno Referans_No,
		dbo.fn_OpVadeTarih(CHA.cha_vade, CHA.cha_tarihi) Vade,
		CHA.cha_aciklama Aciklama,
		CHA.cha_kasa_hizkod Stok_Hizmet_Kodu,
		dbo.fn_CarininIsminiBul(CHA.cha_cari_cins, CHA.cha_kod) Stok_Hizmet_Ismi,
		'' Birim_1,
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHA.cha_miktari END AS [Giris_Miktari],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHA.cha_miktari END AS [Cikis_Miktari],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ANA ELSE 0 END AS [TL_Doviz_Borc],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ANA ELSE 0 END AS [TL_Doviz_Alacak],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ALT ELSE 0 END AS [Alt_Doviz_Borc],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ALT ELSE 0 END AS [Alt_Doviz_Alacak],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ORJ ELSE 0 END AS [Orj_Doviz_Borc],
		CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ORJ ELSE 0 END AS [Orj_Doviz_Alacak],
		CHA.cha_d_kur Orijinal_Doviz_Kur,
		CHA.cha_projekodu Proje_Kodu,
		PRJ.pro_adi Proje_Ismi,
		CHA.cha_srmrkkodu Sorumluluk_Merkezi_Kodu,
		SRMMRK.som_isim Sorumluluk_Merkezi_Ismi,
		CHA.cha_karsisrmrkkodu Karsi_Sorumluluk_Merkezi_Kodu,
		SRMMRKKARSI.som_isim Karsi_Sorumluluk_Merkezi_Ismi,
		CHA.cha_EXIMkodu Ithalat_Ihracat_Kodu,
		CHI.CHA_CARI_BORC_ALACAK_TIP Borc_Alacak_Tip,
		CHA_NORMAL_CARI_DOVIZ_SEMBOLU Doviz_Ismi,
		ROW_NUMBER() OVER (
			PARTITION BY CHA.cha_kod ORDER BY CHA.cha_kod,
				CHA.cha_grupno,
				CHA.cha_tarihi,
				cha_lastup_date,
				CHA.cha_evrak_tip,
				CHA.cha_evrakno_seri,
				CHA.cha_evrakno_sira,
				CHA.cha_satir_no
			) AS Satir_Siralamasi,
		'' Depo_No,
		'' Depo_Ismi,
		CHA.cha_grupno Cari_Hareket_Grup_No
			,6 AS  Program_No
	,CHA.cha_kod Karsi_Hesap_Kodu
		,dbo.fn_CarininIsminiBul(CHA.cha_cari_cins,CHA.cha_kod) Karsi_Hesap_Ismi
		,ISNULL(CCI.CCinsIsim,'') Karsi_Hesap_Cinsi
	FROM dbo.CARI_HESAP_HAREKETLERI_VIEW_WITH_INDEX_03_SPECIAL AS CHI WITH (NOLOCK)
	INNER JOIN CARI_HESAP_HAREKETLERI CHA ON CHA.cha_Guid = CHI.cha_Guid
	LEFT JOIN vw_Cari_Hareket_Cins_Isimleri CHCINS ON CHCINS.CHCinsNo = CHA.cha_cinsi
	LEFT JOIN vw_Cari_Hareket_Evrak_Isimleri CHEVRISIM ON CHEVRISIM.CHEvrNo = CHA.cha_evrak_tip
	LEFT JOIN PROJELER PRJ ON PRJ.pro_kodu = CHA.cha_projekodu
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRK ON SRMMRK.som_kod = CHA.cha_srmrkkodu
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRKKARSI ON SRMMRKKARSI.som_kod = CHA.cha_karsisrmrkkodu
	LEFT JOIN KUR_ISIMLERI_VIEW KI ON KI.KUR_NUMARASI = CHA.cha_d_cins
		LEFT JOIN vw_Cari_Cins_Isimleri CCI ON CCI.CCinsNo = CHA.cha_cari_cins AND CHA.cha_kod <> ''
	WHERE (CHA.cha_kasa_hizmet = 0)
	AND CHA.cha_kasa_hizkod <> ''
		AND CHI.cha_tarihi >= @ilktarih
		AND CHI.cha_tarihi <= @sontarih
		AND (
			CHA.cha_kasa_hizkod = @carikodu
			OR @carikodu = 'Hepsi'
			)
		AND (
			CHA.cha_evrak_tip NOT IN (0, 63)
			)
			)
	--select * from Cari_Ekstresi_Fatura_Stok_Detayi
	--UNION ALL
	--SELECT * FROM Cari_Ekstresi_Fatura_Masraf_Hizmet_Detayi
	,
Devir_Hareketleri
AS (
	SELECT CHA.cha_kod Cari_Kod,
		@ilktarih AS Evrak_Tarihi,
		'' Evrak_No,
		'' as seri,
		'' as sira,
		'' Belge_No,
		@ilktarih AS Belge_Tarihi,
		'Devir' AS Evrak_Tipi,
		'Devir' AS Hareket_Cinsi,
		'' AS Referans_No,
		NULL AS Vade,
		'Devir' AS Aciklama,
		'' Stok_Hizmet_Kodu,
		'' AS Stok_Hizmet_Ismi,
		'' Birim_1,
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHA.cha_miktari END) AS [Giris_Miktari],
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHA.cha_miktari END) AS [Cikis_Miktari],
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ANA ELSE 0 END) AS [TL_Doviz_Borc],
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ANA ELSE 0 END) AS [TL_Doviz_Alacak],
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ALT ELSE 0 END) AS [Alt_Doviz_Borc],
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ALT ELSE 0 END) AS [Alt_Doviz_Alacak],
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ORJ ELSE 0 END) AS [Orj_Doviz_Borc],
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ORJ ELSE 0 END) AS [Orj_Doviz_Alacak],
		NULL Orijinal_Doviz_Kur,
		'' Proje_Kodu,
		'' Proje_Ismi,
		CHA.cha_srmrkkodu Sorumluluk_Merkezi_Kodu,
		SRMMRK.som_isim Sorumluluk_Merkezi_Ismi,
		'' AS Karsi_Sorumluluk_Merkezi_Kodu,
		'' AS Karsi_Sorumluluk_Merkezi_Ismi,
		'' Ithalat_Ihracat_Kodu,
		NULL AS Borc_Alacak_Tip,
		CHA_NORMAL_CARI_DOVIZ_SEMBOLU Doviz_Ismi,
		ROW_NUMBER() OVER (
			PARTITION BY CHA.cha_kod ORDER BY CHA.cha_kod,
				CHA.cha_grupno,
				CHA_NORMAL_CARI_DOVIZ_SEMBOLU
			) AS Satir_Siralamasi,
		'' Depo_No,
		'' Depo_Ismi,
		CHA.cha_grupno Cari_Hareket_Grup_No
			,0 AS  Program_No
						,'' Karsi_Hesap_Kodu
		,'' Karsi_Hesap_Ismi
		,'' Karsi_Hesap_Cinsi
	FROM dbo.CARI_HESAP_HAREKETLERI_VIEW_WITH_INDEX_03_SPECIAL AS CHI WITH (NOLOCK)
	INNER JOIN CARI_HESAP_HAREKETLERI CHA ON CHA.cha_Guid = CHI.cha_Guid
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRK ON SRMMRK.som_kod = CHA.cha_srmrkkodu
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRKKARSI ON SRMMRKKARSI.som_kod = CHA.cha_karsisrmrkkodu
	LEFT JOIN KUR_ISIMLERI_VIEW KI ON KI.KUR_NUMARASI = CHA.cha_d_cins
	WHERE (CHA.cha_cari_cins = 0)
		AND CHI.cha_tarihi < @ilktarih
		AND (
			CHA.cha_kod = @carikodu
			OR @carikodu = 'Hepsi'
			)
	GROUP BY CHA_NORMAL_CARI_DOVIZ_SEMBOLU,
		CHA.cha_kod,
		CHA.cha_srmrkkodu,
		SRMMRK.som_isim,
		KI.KUR_SEMBOLU,
		CHA.cha_grupno
	UNION ALL
	SELECT CHA.cha_ciro_cari_kodu Cari_Kod,
	 @ilktarih AS Evrak_Tarihi,
		'' Evrak_No,
		'' as seri,
		'' as sira,
		'' Belge_No,
		@ilktarih AS Belge_Tarihi,
		'Devir' AS Evrak_Tipi,
		'Devir' AS Hareket_Cinsi,
		'' AS Referans_No,
		NULL AS Vade,
		'Devir' AS Aciklama,
		'' Stok_Hizmet_Kodu,
		'' AS Stok_Hizmet_Ismi,
		'' Birim_1,
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHA.cha_miktari END) AS [Giris_Miktari],
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHA.cha_miktari END) AS [Cikis_Miktari],
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ANA ELSE 0 END) AS [TL_Doviz_Borc],
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ANA ELSE 0 END) AS [TL_Doviz_Alacak],
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ALT ELSE 0 END) AS [Alt_Doviz_Borc],
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ALT ELSE 0 END) AS [Alt_Doviz_Alacak],
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (0, 2) THEN CHI.CHA_CARI_MEBLAG_ORJ ELSE 0 END) AS [Orj_Doviz_Borc],
		SUM(CASE WHEN CHI.CHA_CARI_BORC_ALACAK_TIP IN (1, 2) THEN CHI.CHA_CARI_MEBLAG_ORJ ELSE 0 END) AS [Orj_Doviz_Alacak],
		NULL Orijinal_Doviz_Kur,
		'' Proje_Kodu,
		'' Proje_Ismi,
		CHA.cha_srmrkkodu Sorumluluk_Merkezi_Kodu,
		SRMMRK.som_isim Sorumluluk_Merkezi_Ismi,
		'' AS Karsi_Sorumluluk_Merkezi_Kodu,
		'' AS Karsi_Sorumluluk_Merkezi_Ismi,
		'' Ithalat_Ihracat_Kodu,
		NULL AS Borc_Alacak_Tip,
		CHA_NORMAL_CARI_DOVIZ_SEMBOLU Doviz_Ismi,
		ROW_NUMBER() OVER (
			PARTITION BY CHA.cha_ciro_cari_kodu ORDER BY CHA.cha_ciro_cari_kodu,
				CHA.cha_grupno,
				CHA_NORMAL_CARI_DOVIZ_SEMBOLU
			) AS Satir_Siralamasi,
		'' Depo_No,
		'' Depo_Ismi,
		CHA.cha_grupno Cari_Hareket_Grup_No
			,0 AS  Program_No
						,'' Karsi_Hesap_Kodu
		,'' Karsi_Hesap_Ismi
		,'' Karsi_Hesap_Cinsi
	FROM dbo.CARI_HESAP_HAREKETLERI_VIEW_WITH_INDEX_03_SPECIAL AS CHI WITH (NOLOCK)
	INNER JOIN CARI_HESAP_HAREKETLERI CHA ON CHA.cha_Guid = CHI.cha_Guid
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRK ON SRMMRK.som_kod = CHA.cha_srmrkkodu
	LEFT JOIN SORUMLULUK_MERKEZLERI SRMMRKKARSI ON SRMMRKKARSI.som_kod = CHA.cha_karsisrmrkkodu
	LEFT JOIN KUR_ISIMLERI_VIEW KI ON KI.KUR_NUMARASI = CHA.cha_d_cins
	WHERE CHI.cha_tarihi < @ilktarih
		AND (
			CHA.cha_ciro_cari_kodu = @carikodu
			OR @carikodu = 'Hepsi'
			)
		AND CHA.cha_tpoz > 0
	GROUP BY CHA_NORMAL_CARI_DOVIZ_SEMBOLU,
		CHA.cha_ciro_cari_kodu,
		CHA.cha_srmrkkodu,
		SRMMRK.som_isim,
		KI.KUR_SEMBOLU,
		CHA.cha_grupno
	)
	,Tum_Hareketler AS(
SELECT *
FROM Devir_Hareketleri
UNION ALL
SELECT *
FROM Cari_Ekstresi_Fatura_Stok_Detayi
UNION ALL
SELECT *
FROM Cari_Ekstresi_Fatura_Masraf_Hizmet_Detayi
	UNION ALL
SELECT * FROM Fatura_Harici_Hareketler
)

SELECT Cari_Kod,
	Evrak_Tarihi,
	Evrak_No,
	seri,
	sira,
	Belge_No,
	Belge_Tarihi,
	Evrak_Tipi,
	Hareket_Cinsi,
	Referans_No,
	Vade,
	Aciklama,
	Stok_Hizmet_Kodu,
	Stok_Hizmet_Ismi,
	Birim_1,
	Giris_Miktari,
	Cikis_Miktari,
	TL_Doviz_Borc,
	TL_Doviz_Alacak,
	CASE WHEN SUM(TL_Doviz_Borc - TL_Doviz_Alacak) OVER (
			   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
					Cari_Hareket_Grup_No,
					Evrak_Tarihi,
					Evrak_No,
					Satir_Siralamasi,
					Program_No ROWS UNBOUNDED PRECEDING
				) > 0 THEN SUM(TL_Doviz_Borc - TL_Doviz_Alacak) OVER (
				   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
						Cari_Hareket_Grup_No,
						Evrak_Tarihi,
						Evrak_No,
						Satir_Siralamasi,
						Program_No ROWS UNBOUNDED PRECEDING
					) ELSE 0 END AS TL_Doviz_Borc_Bakiye,
	CASE WHEN SUM(TL_Doviz_Borc - TL_Doviz_Alacak) OVER (
			   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
					Cari_Hareket_Grup_No,
					Evrak_Tarihi,
					Evrak_No,
					Satir_Siralamasi,
					Program_No ROWS UNBOUNDED PRECEDING
				) < 0 THEN SUM(TL_Doviz_Borc - TL_Doviz_Alacak) OVER (
				   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
						Cari_Hareket_Grup_No,
						Evrak_Tarihi,
						Evrak_No,
						Satir_Siralamasi,
						Program_No ROWS UNBOUNDED PRECEDING
					) ELSE 0 END AS TL_Doviz_Alacak_Bakiye,
	CASE WHEN SUM(TL_Doviz_Borc - TL_Doviz_Alacak) OVER (
			   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
					Cari_Hareket_Grup_No,
					Evrak_Tarihi,
					Evrak_No,
					Satir_Siralamasi,
					Program_No ROWS UNBOUNDED PRECEDING
				) > 0 THEN 'B' ELSE 'A' END TL_Doviz_Bakiye_Durumu,
	SUM(TL_Doviz_Borc - TL_Doviz_Alacak) OVER (
	   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
			Cari_Hareket_Grup_No,
			Evrak_Tarihi,
			Evrak_No,
			Satir_Siralamasi,
			Program_No ROWS UNBOUNDED PRECEDING
		) TL_Bakiye,
	Alt_Doviz_Borc,
	Alt_Doviz_Alacak,
	CASE WHEN SUM(Alt_Doviz_Borc - Alt_Doviz_Alacak) OVER (
			   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
					Cari_Hareket_Grup_No,
					Evrak_Tarihi,
					Evrak_No,
					Satir_Siralamasi,
					Program_No ROWS UNBOUNDED PRECEDING
				) > 0 THEN SUM(Alt_Doviz_Borc - Alt_Doviz_Alacak) OVER (
				   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
						Cari_Hareket_Grup_No,
						Evrak_Tarihi,
						Evrak_No,
						Satir_Siralamasi,
						Program_No ROWS UNBOUNDED PRECEDING
	) ELSE 0 END AS Alt_Doviz_Borc_Bakiye,
	CASE WHEN SUM(Alt_Doviz_Borc - Alt_Doviz_Alacak) OVER (
			   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
					Cari_Hareket_Grup_No,
					Evrak_Tarihi,
					Evrak_No,
					Satir_Siralamasi,
					Program_No ROWS UNBOUNDED PRECEDING
				) < 0 THEN SUM(Alt_Doviz_Borc - Alt_Doviz_Alacak) OVER (
				   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
						Cari_Hareket_Grup_No,
						Evrak_Tarihi,
						Evrak_No,
						Satir_Siralamasi,
						Program_No ROWS UNBOUNDED PRECEDING
	) ELSE 0 END AS Alt_Doviz_Alacak_Bakiye,
	CASE WHEN SUM(Alt_Doviz_Borc - Alt_Doviz_Alacak) OVER (
			   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
					Cari_Hareket_Grup_No,
					Evrak_Tarihi,
					Evrak_No,
					Satir_Siralamasi,
					Program_No ROWS UNBOUNDED PRECEDING
				) > 0 THEN 'B' ELSE 'A' END Alt_Doviz_Bakiye_Durumu,
	SUM(Alt_Doviz_Borc - Alt_Doviz_Alacak) OVER (
	   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
			Cari_Hareket_Grup_No,
			Evrak_Tarihi,
			Evrak_No,
			Satir_Siralamasi,
			Program_No ROWS UNBOUNDED PRECEDING
	) Alt_Bakiye,
	Orj_Doviz_Borc,
	Orj_Doviz_Alacak,
	CASE WHEN SUM(Orj_Doviz_Borc - Orj_Doviz_Alacak) OVER (
			   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
					Cari_Hareket_Grup_No,
					Evrak_Tarihi,
					Evrak_No,
					Satir_Siralamasi,
					Program_No ROWS UNBOUNDED PRECEDING
				) > 0 THEN SUM(Orj_Doviz_Borc - Orj_Doviz_Alacak) OVER (
				   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
						Cari_Hareket_Grup_No,
						Evrak_Tarihi,
						Evrak_No,
						Satir_Siralamasi,
						Program_No ROWS UNBOUNDED PRECEDING
	) ELSE 0 END AS Orj_Doviz_Borc_Bakiye,
	CASE WHEN SUM(Orj_Doviz_Borc - Orj_Doviz_Alacak) OVER (
			   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
					Cari_Hareket_Grup_No,
					Evrak_Tarihi,
					Evrak_No,
					Satir_Siralamasi,
					Program_No ROWS UNBOUNDED PRECEDING
				) < 0 THEN SUM(Orj_Doviz_Borc - Orj_Doviz_Alacak) OVER (
				   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
						Cari_Hareket_Grup_No,
						Evrak_Tarihi,
						Evrak_No,
						Satir_Siralamasi,
						Program_No ROWS UNBOUNDED PRECEDING
	) ELSE 0 END AS Orj_Doviz_Alacak_Bakiye,
	CASE WHEN SUM(Orj_Doviz_Borc - Orj_Doviz_Alacak) OVER (
			   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
					Cari_Hareket_Grup_No,
					Evrak_Tarihi,
					Evrak_No,
					Satir_Siralamasi,
					Program_No ROWS UNBOUNDED PRECEDING
				) > 0 THEN 'B' ELSE 'A' END Orj_Doviz_Bakiye_Durumu,
	SUM(Orj_Doviz_Borc - Orj_Doviz_Alacak) OVER (
	   PARTITION BY TH.Cari_Kod ,TH.Cari_Hareket_Grup_No ORDER BY Cari_Kod,
			Cari_Hareket_Grup_No,
			Evrak_Tarihi,
			Evrak_No,
			Satir_Siralamasi,
			Program_No ROWS UNBOUNDED PRECEDING
	) Orj_Bakiye,
	Orijinal_Doviz_Kur,
	Proje_Kodu,
	Proje_Ismi,
	Sorumluluk_Merkezi_Kodu,
	Sorumluluk_Merkezi_Ismi,
	Karsi_Sorumluluk_Merkezi_Kodu,
	Karsi_Sorumluluk_Merkezi_Ismi,
	Ithalat_Ihracat_Kodu,
	Borc_Alacak_Tip,
	Doviz_Ismi,
	Satir_Siralamasi,
	Depo_No,
	Depo_Ismi,
	Cari_Hareket_Grup_No,
	Program_No,
	Karsi_Hesap_Kodu,
	Karsi_Hesap_Ismi,
	Karsi_Hesap_Cinsi
FROM Tum_Hareketler TH
ORDER BY Cari_Kod,
	Cari_Hareket_Grup_No,
	Evrak_Tarihi,
	Evrak_No,
	Satir_Siralamasi,
	Program_No
            `;

            const cariEkstre = await conMainMssql2.raw(query); // Execute the query
            return {
                status: 'success',
                message: 'Cari ekstre listesi başarıyla alındı',
                data: cariEkstre
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }


    }

    async cariListe(req, res) {

        try {
            const cariListe = await conMainMssql2('CARI_HESAPLAR')
                .select('CARI_HESAPLAR.cari_kod', 'CARI_HESAPLAR.cari_unvan1', 'CARI_HESAPLAR.cari_unvan2', 'CARI_HESAPLAR.cari_vdaire_no', 'CARI_HESAPLAR.cari_satis_fk', 'ssflt.sfl_aciklama')
                .leftOuterJoin('STOK_SATIS_FIYAT_LISTE_TANIMLARI as ssflt', 'ssflt.sfl_sirano', 'CARI_HESAPLAR.cari_satis_fk')
                .whereRaw('LOWER(CARI_HESAPLAR.cari_kod) like ?', ['m%'])
                .orderBy('CARI_HESAPLAR.cari_unvan1');
            return {
                status: 'success',
                message: 'Cari listesi başarıyla getirildi',
                data: cariListe
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    
}

export default new MikroServices;