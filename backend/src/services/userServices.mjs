import conMain from '../config/database.mjs';
import crypto from 'crypto';

class UserServices {
    async getUsers(req, res) {
        try {
            const users = await conMain('users')
                .select('id', 'ad', 'soyad', 'eposta', 'durum', 'create_date', conMain.raw('CONCAT(ad, " ", soyad) as tam_ad'))
                .where('id', '!=', 1);
            return users;
       
        } catch (error) {
            return error;
        }
    }

    async getUser(req, res) {
        try {
            const user = await conMain('users').where('id', req.params.id).select('*').first();
            return user;
        } catch (error) {
            return error;
        }
    }

    async getUserYetki(req, res) {
        try {
            const userId = req.params.userId;
            
            // Kullanıcının mevcut yetkilerini getir
            const userYetkiler = await conMain('user_yetkiler')
                .where('user_id', userId)
                .select('menu_id');
            
            const yetkiliMenuIds = userYetkiler.map(yetki => yetki.menu_id);
            
            return {
                user_id: userId,
                yetkili_menu_ids: yetkiliMenuIds
            };
        } catch (error) {
            return error;
        }
    }

    async saveUserYetki(req, res) {
        try {
            const { user_id, menu_ids } = req.body;

            const finalMenuIds = menu_ids || [];

            // Önce kullanıcının mevcut yetkilerini sil
            await conMain('user_yetkiler')
                .where('user_id', user_id)
                .del();
            
            // Yeni yetkileri ekle
            if (finalMenuIds && finalMenuIds.length > 0) {
                const yetkiData = finalMenuIds.map(menu_id => ({
                    user_id: user_id,
                    menu_id: menu_id
                }));
                
                await conMain('user_yetkiler').insert(yetkiData);
            }
            
            return {
                status: 'success',
                message: 'Kullanıcı yetkileri başarıyla kaydedildi'
            };
        } catch (error) {
            return error;
        }
    }

    async createUser(req, res) {
        try {
            const { ad, soyad, eposta, sifre } = req.body;
            
            // E-posta benzersizlik kontrolü
            const existingUser = await conMain('users').where('eposta', eposta).first();
            if (existingUser) {
                return {
                    status: 'error',
                    message: 'Bu e-posta adresi zaten kullanılıyor.'
                }
            }
            
            const sifreHash = crypto.createHash('md5').update(sifre).digest('hex');
            const user = await conMain('users').insert({ ad, soyad, eposta, sifre: sifreHash, durum: 1, rol: 1, bayi_id: 0 });

         

            const userBayiIdUpdate = await conMain('users').where('id', user[0]).update({ bayi_id: user[0] });
            


            return {
                status: 'success',
                message: 'Kullanıcı başarıyla oluşturuldu',
                user_id: user.id
            }

        } catch (error) {
            return {
                status: 'error',
                message: 'Kullanıcı oluşturulurken bir hata oluştu'
            }
        }
    }

    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { ad, soyad, eposta, sifre, durum } = req.body;
            
            // E-posta benzersizlik kontrolü (kendi ID'si hariç)
            const existingUser = await conMain('users').where('eposta', eposta).whereNot('id', id).first();
            if (existingUser) {
                return {
                    status: 'error',
                    message: 'Bu e-posta adresi zaten kullanılıyor.'
                }
            }
            
            const updateData = { ad, soyad, eposta, durum };
            
            // Eğer şifre değiştirilecekse hash'le
            if (sifre && sifre.trim() !== '') {
                const sifreHash = crypto.createHash('md5').update(sifre).digest('hex');
                updateData.sifre = sifreHash;
            }
            
            await conMain('users').where('id', id).update(updateData);

            return {
                status: 'success',
                message: 'Kullanıcı başarıyla güncellendi'
            }

        } catch (error) {
            return {
                status: 'error',
                message: 'Kullanıcı güncellenirken bir hata oluştu'
            }
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            
            // Kullanıcının kendisini silmesini engelle
            if (req.user && req.user.id == id) {
                return {
                    status: 'error',
                    message: 'Kendi hesabınızı silemezsiniz.'
                }
            }
            
            // Kullanıcının yetkilerini sil
            await conMain('user_yetkiler').where('user_id', id).del();
            
            // Kullanıcıyı sil
            await conMain('users').where('id', id).del();

            return {
                status: 'success',
                message: 'Kullanıcı başarıyla silindi'
            }

        } catch (error) {
            return {
                status: 'error',
                message: 'Kullanıcı silinirken bir hata oluştu'
            }
        }
    }

    // Kendi profil bilgilerini getir
    async getProfile(req, res) {
        try {
            const userId = req.locals.user.id;
            const user = await conMain('users')
                .where('id', userId)
                .select('id', 'ad', 'soyad', 'eposta', 'durum')
                .first();
            
            if (!user) {
                return {
                    status: 'error',
                    message: 'Kullanıcı bulunamadı'
                }
            }

            return {
                status: 'success',
                user: user
            }
        } catch (error) {
            return {
                status: 'error',
                message: 'Profil bilgileri alınırken bir hata oluştu'
            }
        }
    }

    // Kendi profil bilgilerini güncelle
    async updateProfile(req, res) {
        try {
            const userId = req.locals.user.id;
            const { ad, soyad, eposta, sifre, yeniSifre } = req.body;
            
            // Mevcut kullanıcıyı getir
            const currentUser = await conMain('users').where('id', userId).first();
            
            if (!currentUser) {
                return {
                    status: 'error',
                    message: 'Kullanıcı bulunamadı'
                }
            }

            // E-posta benzersizlik kontrolü (kendi ID'si hariç)
            const existingUser = await conMain('users').where('eposta', eposta).whereNot('id', userId).first();
            if (existingUser) {
                return {
                    status: 'error',
                    message: 'Bu e-posta adresi zaten kullanılıyor.'
                }
            }
            
            const updateData = { ad, soyad, eposta };
            
            // Eğer şifre değiştirilecekse
            if (yeniSifre && yeniSifre.trim() !== '') {
                // Mevcut şifreyi kontrol et
                if (!sifre || sifre.trim() === '') {
                    return {
                        status: 'error',
                        message: 'Şifre değiştirmek için mevcut şifrenizi girmelisiniz.'
                    }
                }
                
                const sifreHash = crypto.createHash('md5').update(sifre).digest('hex');
                if (sifreHash !== currentUser.sifre) {
                    return {
                        status: 'error',
                        message: 'Mevcut şifreniz yanlış.'
                    }
                }
                
                // Yeni şifreyi hash'le ve güncelle
                const yeniSifreHash = crypto.createHash('md5').update(yeniSifre).digest('hex');
                updateData.sifre = yeniSifreHash;
            }
            
            await conMain('users').where('id', userId).update(updateData);

            return {
                status: 'success',
                message: 'Profil bilgileriniz başarıyla güncellendi'
            }

        } catch (error) {
            return {
                status: 'error',
                message: 'Profil güncellenirken bir hata oluştu'
            }
        }
    }

}

export default new UserServices();