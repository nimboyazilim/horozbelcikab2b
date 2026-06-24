import conMain from '../config/database.mjs';
import { createMysqlConnection } from '../config/firmaMysql.mjs';

class TeknikServisServices {
    async teknikServisListe(req, res) {
        try {
            const con = createMysqlConnection(req.locals.firma);
            const teknikServis = await con('teknikServis')
                .leftOuterJoin('musteriler', 'teknikServis.musteri', 'musteriler.id')
                .leftOuterJoin('teknikServisDurum', 'teknikServis.durum', 'teknikServisDurum.id')
                .leftOuterJoin('teknikServisTip', 'teknikServis.tip', 'teknikServisTip.id')
                .leftOuterJoin('teknikServisTur', 'teknikServis.tur', 'teknikServisTur.id')
                .leftOuterJoin('teknikServisCagriTur', 'teknikServis.cagri_tur', 'teknikServisCagriTur.id')
                .where((builder) => {
                    if (req.body.startDate && req.body.endDate) {
                        const startDate = new Date(req.body.startDate);
                        startDate.setHours(0, 0, 0, 0);

                        const endDate = new Date(req.body.endDate);
                        endDate.setHours(23, 59, 59, 999);

                        builder.whereBetween('teknikServis.baslangic_tarih', [startDate, endDate]);
                    }
                })
                .select(
                    'teknikServis.*',
                    con.raw('CONCAT(musteriler.unvan_ad, " ", musteriler.unvan_soyad) as unvan_ad'),
                    'teknikServisDurum.ad as durum_ad',
                    'teknikServisDurum.textColor as durum_textColor',
                    'teknikServisDurum.backColor as durum_backColor',
                    'teknikServisTip.ad as tip_ad',
                    'teknikServisTur.ad as tur_ad',
                    'teknikServisCagriTur.ad as cagri_tur_ad'
                )
                .orderBy('teknikServis.bitis_tarih', 'desc');

            const userIds = [...new Set(teknikServis.map(item => item.sorumlusu))];
            const users = await conMain('users')
                .whereIn('id', userIds)
                .select('id', 
                    conMain.raw('CONCAT(ad, " ", soyad) as tam_ad'));

            const atananUserIds = [...new Set(teknikServis.flatMap(item => {
                try {
                    return JSON.parse(item.atananlar || '[]');
                } catch {
                    return [];
                }
            }))];
            
            const atananUsers = await conMain('users')
                .whereIn('id', atananUserIds)
                .select('id', 
                    conMain.raw('CONCAT(ad, " ", soyad) as tam_ad'));

            const teknikServisWithUsers = teknikServis.map(servis => {
                const user = users.find(u => u.id === servis.sorumlusu);
                let atananKisiler = [];
                try {
                    const atananIds = JSON.parse(servis.atananlar || '[]');
                    atananKisiler = atananIds.map(id => {
                        const atanan = atananUsers.find(u => u.id === parseInt(id));
                        return atanan ? atanan.tam_ad : id;
                    });
                } catch {
                    atananKisiler = [];
                }

                return {
                    ...servis,
                    sorumlusu: user ? user.tam_ad : servis.sorumlusu,
                    atananlar: atananKisiler.join(', ')
                };
            });
            await con.destroy();

            const title = [
                { field: 'id', headerName: 'Servis No',pinned: true },
                { field: 'create_date', headerName: 'Oluşturma Tarihi' },
                { field: 'update_date', headerName: 'Güncelleme Tarihi' },
                { field: 'talep_tarih', headerName: 'Talep Tarihi' },
                { field: 'baslangic_tarih', headerName: 'Başlangıç Tarihi' },
                { field: 'bitis_tarih', headerName: 'Bitiş Tarihi' },
                { field: 'termin_tarih', headerName: 'Termin Tarihi' },
                { field: 'unvan_ad', headerName: 'Müşteri' },
                { field: 'sorumlusu', headerName: 'Sorumlu' },
                { field: 'atananlar', headerName: 'Atananlar' },
                { field: 'yapilacak_is', headerName: 'Yapılacak İş' },
                { field: 'guncel_durum', headerName: 'Güncel Durum' },
                { field: 'sonuc', headerName: 'Sonuç' },
                { field: 'durum_ad', headerName: 'Durum', cellStyle: (params) => ({ 
                    color: params.data.durum_textColor, 
                    backgroundColor: params.data.durum_backColor 
                }) },
                { field: 'tip_ad', headerName: 'Tip' },
                { field: 'tur_ad', headerName: 'Tür' },
                { field: 'cagri_tur_ad', headerName: 'Çağrı Türü' },
                { field: 'talep_eden', headerName: 'Talep Eden' },
                { field: 'islem_yapilan_kisi', headerName: 'İşlem Yapılan Kişi' }
            ];
          
            return {
                data: teknikServisWithUsers,
                title: title
            };
        } catch (error) {
            return error;
        }
    }

    async getTeknikServisById(req, res) {
        try {
            const con = createMysqlConnection(req.locals.firma);
            const teknikServis = await con('teknikServis')
                .where('id', req.params.id)
                .select([
                    '*',
                    con.raw('DATE_FORMAT(create_date, "%Y-%m-%d %H:%i") as create_date'),
                    con.raw('DATE_FORMAT(update_date, "%Y-%m-%d %H:%i") as update_date'),
                    con.raw('DATE_FORMAT(talep_tarih, "%Y-%m-%d %H:%i") as talep_tarih'),
                    con.raw('DATE_FORMAT(baslangic_tarih, "%Y-%m-%d %H:%i") as baslangic_tarih'),
                    con.raw('DATE_FORMAT(bitis_tarih, "%Y-%m-%d %H:%i") as bitis_tarih'),
                    con.raw('DATE_FORMAT(termin_tarih, "%Y-%m-%d %H:%i") as termin_tarih'),
                ]);
            await con.destroy();
            
            // Parse atananlar from JSON string to array
            if (teknikServis[0]) {
                try {
                    teknikServis[0].atananlar = JSON.parse(teknikServis[0].atananlar || '[]');
                } catch {
                    teknikServis[0].atananlar = [];
                }
            }
            
            return teknikServis[0];
        } catch (error) {
            return error;
        }
    }

    async createTeknikServis(req, res) {
        try {
            const con = createMysqlConnection(req.locals.firma);
            const createDate = new Date();
            const teknikServisData = {
                ...req.body,
                create_date: createDate,
                sorumlusu: req.locals.user.id,
                atananlar: req.body.atananlar ? JSON.stringify(req.body.atananlar) : ''
            };
            const [insertedId] = await con('teknikServis').insert(teknikServisData);
            await con.destroy();
            return {
                status: 'success',
                message: 'Kayıt başarılı',
                id: insertedId
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            };
        }
    }

    async updateTeknikServis(req, res) {
        try {
            const con = createMysqlConnection(req.locals.firma);
            const teknikServisData = {
                ...req.body,
                update_date: new Date(),
                atananlar: req.body.atananlar ? JSON.stringify(req.body.atananlar) : ''
            };
            await con('teknikServis').where('id', req.params.id).update(teknikServisData);
            await con.destroy();
            return {
                status: 'success',
                message: 'Güncelleme başarılı'
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
            };
        }
    }

    async deleteTeknikServis(req, res) {
        try {
            const con = createMysqlConnection(req.locals.firma);
            await con('teknikServis').where('id', req.params.id).delete();
            await con.destroy();
            return {
                status: 'success',
                message: 'Silme başarılı'
            };
        } catch (error) {
            return error;
        }
    }

    async teknikServisTipListe(req, res) {
        try {
            const con = createMysqlConnection(req.locals.firma);
            const teknikServisTip = await con('teknikServisTip').select('*');
            await con.destroy();
            return teknikServisTip;
        } catch (error) {
            return error;
        }
    }

    async teknikServisTurListe(req, res) {
        try {
            const con = createMysqlConnection(req.locals.firma);
            const teknikServisTur = await con('teknikServisTur').select('*');
            await con.destroy();
            return teknikServisTur;
        } catch (error) {
            return error;
        }
    }

    async teknikServisCagriTurListe(req, res) {
        try {
            const con = createMysqlConnection(req.locals.firma);
            const teknikServisCagriTur = await con('teknikServisCagriTur').select('*');
            await con.destroy();
            return teknikServisCagriTur;
        } catch (error) {
            return error;
        }
    }

    async teknikServisDurumListe(req, res) {    
        try {
            const con = createMysqlConnection(req.locals.firma);
            const teknikServisDurum = await con('teknikServisDurum').select('*');
            await con.destroy();
            return teknikServisDurum;
        } catch (error) {
            return error;
        }
    }


}

export default new TeknikServisServices;