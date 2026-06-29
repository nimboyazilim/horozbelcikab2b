import conMain from "../config/database.mjs";
import conMainMssql from "../config/databaseMssql.mjs";
import conMainMssql2 from "../config/databaseMssql2.mjs";
import crypto from 'crypto';
import OtherServices from './otherServices.mjs';

class MusterilerServices {
    async musterilerListe(req, res) {
        try {
            const musteriler = await conMain('musteriler')
                .select('id','kodu','vkntckn','eposta','durum','create_date','telefon',conMain.raw('CONCAT(ad, " ", soyad) as ad'))
                .orderBy('create_date', 'desc');
            return musteriler;
        } catch (error) {
            return error;
        }
    }

    async musterilerAdresler(req, res) {
        try {
            const adresler = await conMain('musteriler_adres')   
                .where('musteri_id', req.params.musteri_id)
                .select('*');
     
            return adresler;
        } catch (error) {
            return error;
        }
    }

    async getProfil(req, res) {
        try {
            const profil = await conMain('musteriler')
                .where('id', req.params.musteri_id)
                .select('*').first();
            profil.sifre1 = '';
            return {
                status: 'success',
                message: 'Profil bilgileri başarıyla alındı',
                data: profil
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            }
        }
    }

    async updateProfil(req, res) {
        try {
            const profil = await conMain('musteriler')
                .where('id', req.params.musteri_id)
                .update('telefon', req.body.telefon)
                .update('vkntckn', req.body.vkntckn)
                .update('ad', req.body.ad)
                .update('soyad', req.body.soyad);
            if (req.body.sifre1 != '') {
                await conMain('musteriler')
                    .where('id', req.params.musteri_id)
                    .update('sifre', crypto.createHash('md5').update(req.body.sifre1).digest('hex'));
            }
            return {
                status: 'success',
                message: 'Profil bilgileri başarıyla güncellendi',
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            }
        }
    }


    async createAdres(req, res) {
        try {
            const adres = await conMain('musteriler_adres')
                .insert(req.body);
            return {
                status: 'success',
                message: 'Adres başarıyla oluşturuldu',
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            }
        }
    }   


    async updateAdres(req, res) {
        try {
            const adres = await conMain('musteriler_adres')
                .where('id', req.params.id)
                .update(req.body);
            return {
                status: 'success',
                message: 'Adres başarıyla güncellendi',
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message, 
            }
        }
    }

    async deleteAdres(req, res) {
        try {
            const adres = await conMain('musteriler_adres')
                .where('id', req.params.adres_id)
                .delete();
            return {
                status: 'success',
                message: 'Adres başarıyla silindi',
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            }
        }
    }


    async cmsMusterilerCreate(req, res) {
        try {

            const data = {
                kodu: req.body.kodu,
                vkntckn: req.body.vkntckn,
                eposta: req.body.eposta,
                ad: req.body.ad,
                soyad: req.body.soyad,
                telefon: req.body.telefon,
                musteri_ust_id:0,
                sifre: '802f12b9755bf4c7ae625a2638127b33',
                iskonto_yuzde: req.body.iskonto_yuzde,
                fiyat_grup_id: req.body.fiyat_grup_id,
                cari_ekstre_yetki: 0,
            }

            const musteriKontrol = await conMain('musteriler')
                .where('kodu', req.body.kodu)
                .select('*').first();

            if(musteriKontrol) {
                return {
                    status: 'error',
                    message: 'Müşteri kodu zaten mevcut',
                }
            }

            const epostaKontrol = await conMain('musteriler')
                .where('eposta', req.body.eposta)
                .select('*').first();
            if(epostaKontrol) {
                return {
                    status: 'error',
                    message: 'E-posta zaten mevcut',
                }
            }

            const musteriler = await conMain('musteriler')
                .insert(data);


            const musteriUpdate = await conMain('musteriler')
                .where('id', musteriler[0])
                .update({
                    musteri_ust_id: musteriler[0]
                });


            const adres = await conMain('musteriler_adres')
                .insert({
                    musteri_id: musteriler[0],
                    adres_turu: 3,
                    il: '',
                    ilce: '',
                    ulke: '',
                    adres: '',
                    posta_kodu: '',
                    tel: '',
                    varsayilan: 1
                });

            return {
                status: 'success',
                message: 'Müşteri başarıyla oluşturuldu',
                id: musteriler[0]
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            }
        }
    }   

    async cmsMusterilerById(req, res) {
        try {
            const musteriler = await conMain('musteriler')
                .where('id', req.params.id)
                .select('*').first();
            musteriler.sifre1 = '';
            return musteriler;
        } catch (error) {
            return error;
        }
    }


    async cmsMusterilerUpdate(req, res) {
        try {

            const data = {
                kodu: req.body.kodu,
                vkntckn: req.body.vkntckn,
                eposta: req.body.eposta,
                ad: req.body.ad,
                soyad: req.body.soyad,
                telefon: req.body.telefon,
                iskonto_yuzde: req.body.iskonto_yuzde,
                fiyat_grup_id: req.body.fiyat_grup_id,
                durum: req.body.durum,
                cari_ekstre_yetki: req.body.cari_ekstre_yetki ? 1 : 0,
                sifre: req.body.sifre1 != '' ? crypto.createHash('md5').update(req.body.sifre1).digest('hex') : req.body.sifre
            }

            const musteriler = await conMain('musteriler')
                .where('id', req.params.id)
                .update(data);

            if(req.body.durum == 1) {
                const epostaGonder = await OtherServices.epostaGonder('Bayi Onay', `${req.body.ad} ${req.body.soyad} ${req.body.eposta} bayiliğiniz onaylanmıştır. e-posta ve şifreniz ile giriş yapabilirsiniz.`, req.body.eposta);
                const bildirimEkle = await OtherServices.bildirimEkle('Bayi Onay', req.params.id, `${req.body.ad} ${req.body.soyad} ${req.body.eposta} bayiliğiniz onaylanmıştır.`);
            }


            return {
                status: 'success',
                message: 'Müşteri bilgileri başarıyla güncellendi',
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            }
        }
    }


    async musterilerGrupFiyatListesi(req, res) {
        try {
            const musteriler = await conMain('urun_ozel_fiyat_tanimlari')
                .select('*');
            return {
                status: 'success',
                message: 'Fiyat grupları başarıyla alındı',
                data: musteriler
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            }
        }
    }


    async yeniMusteriBasvuru(req, res) {
        try {


            // Verify Cloudflare Turnstile
            const formData = new URLSearchParams();
            formData.append('secret', process.env.CF_TURNSTILE_SECRET_KEY);
            formData.append('response', req.body.cfTurnstileResponse);

          const turnstileVerification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
           method: 'POST',
           body: formData,
          });

          const turnstileResult = await turnstileVerification.json();

            
            if (!turnstileResult.success) {
                throw new Error('Turnstile verification failed');
            }


            const result = await conMain.transaction(async trx => {
                const musteri = await trx('musteriler')
                    .where('eposta', req.body.eposta)
                    .select('*').first();

                if (musteri) {
                    throw new Error('Müşteri e-postası zaten mevcut');
                }

                // Önce müşteriyi ekle
                const [musteriId] = await trx('musteriler')
                    .insert({
                        kodu: req.body.kodu,
                        ad: req.body.ad,
                        soyad: req.body.soyad,
                        vkntckn: req.body.vkntckn,
                        eposta: req.body.eposta,
                        telefon: req.body.telefon,
                        iskonto_yuzde: req.body.iskonto_yuzde,
                        fiyat_grup_id: req.body.fiyat_grup_id,
                        durum: req.body.durum,
                        sifre: crypto.createHash('md5').update(req.body.sifre).digest('hex'),
                        musteri_ust_id: 0
                    })
                    .returning('id');

                const musteriUpdate = await trx('musteriler')
                    .where('id', musteriId)
                    .update({
                        musteri_ust_id: musteriId
                    });

                // Sonra müşteri adresini ekle
                await trx('musteriler_adres')
                    .insert({
                        musteri_id: musteriId,
                        adres_turu: req.body.adres_turu,
                        il: req.body.il,
                        ilce: req.body.ilce,
                        ulke: req.body.ulke,
                        adres: req.body.adres,
                        posta_kodu: req.body.posta_kodu,
                        tel: req.body.telefon,
                        varsayilan: 1
                    });

                    const epostaGonder = await OtherServices.epostaGonder('Yeni bayi başvurusu', `${req.body.ad} ${req.body.soyad} ${req.body.eposta} e-postası ile yeni bayi başvurusu oluşturuldu`, '');
                    const bildirimEkle = await OtherServices.bildirimEkle('Yeni bayi başvurusu', musteriId, `${req.body.ad} ${req.body.soyad} ${req.body.eposta} e-postası ile yeni bayi başvurusu oluşturuldu`);

                return musteriId;
            });

          

            return {
                status: 'success',
                message: 'Müşteri ve adresi başarıyla eklendi',
                musteriId: result
            };

        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            }
        }
    }

    async musterilerDelete(req, res) {
        try {


            const musteriKontrol = await conMain('siparisler_genel')
                .where('musteri_id', req.params.id)
                .select('*').first();

                

            if(musteriKontrol) {
               return {
                status: 'error',
                message: 'Müşteriye ait siparişler bulunmaktadır. Müşteri silinemez.',
               }
            }


          const musteriler = await conMain('musteriler')
                .where('id', req.params.id)
                .delete();


                const adresler = await conMain('musteriler_adres')
                    .where('musteri_id', req.params.id)
                    .delete();

                const sepetler = await conMain('sepet')
                    .where('musteri_id', req.params.id)
                    .delete();

                    return {
                        status: 'success',
                        message: 'Müşteri başarıyla silindi',
                    }

        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
            }
        }

       
    }

    async cariBakiye(req, res) {
        try {
            const cariKodu = req.locals.user.kodu;
            
        
            
            // MikroDesktop_0226 veritabanından cari bakiye sorgula (conMainMssql bağlantısı ile)
            const query = `SELECT dbo.fn_CariHesapAnaDovizBakiye('',0,cari_kod,'','',NULL,NULL,NULL,0,0,0,0,0,0) as bakiye FROM CARI_HESAPLAR where cari_kod = ?
            `;
            
        
            
            const startTime = Date.now();
            const result = await conMainMssql2.raw(query, [cariKodu]);
            const endTime = Date.now();
            
           
            
            // MSSQL knex raw query result yapısı: [ [sonuçlar] ]
            let bakiye = 0;
            
            if (Array.isArray(result) && result.length > 0) {
                // İlk eleman array mi?
                if (Array.isArray(result[0]) && result[0].length > 0) {
                    bakiye = result[0][0]?.bakiye || 0;
                } else if (result[0] && typeof result[0] === 'object') {
                    // Veya direkt obje mi?
                    bakiye = result[0].bakiye || 0;
                }
            }
           
            
            return {
                status: 'success',
                bakiye: bakiye
            };
        } catch (error) {
            return {
                status: 'error',
                bakiye: 0,
                message: 'Bakiye bilgisi alınamadı - ' + error.message
            };
        }
    }
}

export default new MusterilerServices();