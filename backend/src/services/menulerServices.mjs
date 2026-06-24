import conMain from "../config/database.mjs";

class MenulerServices {
    
    async menulerListe(req, res) {
        try {
            // Tüm menüleri çek
            const tumMenuler = await conMain('menuler')
                .select('id', 'menu_adi', 'menu_link', 'menu_icon', 'menu_ust_id').orderBy('sira', 'asc');
                
            
            // Ana menüleri filtrele (menu_ust_id = 0)
            const anaMenuler = tumMenuler
                .filter(menu => menu.menu_ust_id === 0)
                .map(anaMenu => ({
                    ...anaMenu,
                    alt_menuler: tumMenuler.filter(altMenu => altMenu.menu_ust_id === anaMenu.id)
                }));
            
            return anaMenuler;
        } catch (error) {
            return error;
        }
    }
    async menulerListe2(req, res) {
        try {
            // Önce tüm menüleri çek
            const tumMenuler = await conMain('menuler')
                .select('id', 'menu_adi', 'menu_link', 'menu_icon', 'menu_ust_id', 'sira')
                .orderBy('sira', 'asc');
            
            // Kullanıcının yetkili olduğu menüleri çek
            const userYetkiler = await conMain('user_yetkiler')
                .select('menu_id')
                .where('user_id', req.params.userId);
            
            const yetkiliMenuIds = userYetkiler.map(yetki => yetki.menu_id);
            
            // Kullanıcının yetkili olduğu menüleri filtrele
            const yetkiliMenuler = tumMenuler.filter(menu => 
                yetkiliMenuIds.includes(menu.id)
            );
            
            // Ana menüleri filtrele (menu_ust_id = 0)
            const anaMenuler = yetkiliMenuler
                .filter(menu => menu.menu_ust_id === 0)
                .map(anaMenu => ({
                    ...anaMenu,
                    alt_menuler: yetkiliMenuler.filter(altMenu => altMenu.menu_ust_id === anaMenu.id)
                }));
            
            return anaMenuler;
        } catch (error) {
            console.log(error);
            return error;
        }
    }

   

}

export default new MenulerServices;