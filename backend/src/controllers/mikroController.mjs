import MikroServices from "../services/mikroServices.mjs";
class MikroController {
    
    async varyantListe(req, res) {
        try {
            const varyant = await MikroServices.varyantListe(req);
            return res.status(200).json(varyant);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message    
            });
        }
    }

    async stokVaryantEkle(req, res) {
        try {
            const stok = await MikroServices.stokVaryantEkle(req);
            return res.status(200).json(stok);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async stokVaryantGrupEkle(req, res) {
        try {
            const stok = await MikroServices.stokVaryantGrupEkle(req);
            return res.status(200).json(stok);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async kategoriEkle(req, res) {
        try {
            const kategori = await MikroServices.kategoriEkle(req);
            return res.status(200).json(kategori);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async kategoriyeUrunBagla(req, res) {
        try {
            const kategori = await MikroServices.kategoriyeUrunBagla(req);
            return res.status(200).json(kategori);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async urunFiyatlariEkle(req, res) {
        try {
            const urunFiyatlari = await MikroServices.urunFiyatlariEkle(req);
            return res.status(200).json(urunFiyatlari);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message    
            });
        }
    }

    async urunOzelFiyatlariEkle(req, res) {
        try {
            const urunFiyatlari = await MikroServices.urunOzelFiyatlariEkle(req);
            return res.status(200).json(urunFiyatlari);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message    
            });
        }
    }

    async urunVergiEkle(req, res) {
        try {
            const urunVergi = await MikroServices.urunVergiEkle(req);
            return res.status(200).json(urunVergi);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async stokMiktarEkle(req, res) {
        try {
            const stokMiktar = await MikroServices.stokMiktarEkle(req);
            return res.status(200).json(stokMiktar);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }


    async topluResimEkle(req, res) {
        try {
            const topluResim = await MikroServices.topluResimEkle(req);
            return res.status(200).json(topluResim);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async topluDosyaEkle(req, res) {
        try {
            const topluDosya = await MikroServices.topluDosyaEkle(req);
            return res.status(200).json(topluDosya);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async cariEkstreListe(req, res) {
        try {
            const cariEkstre = await MikroServices.cariEkstreListe(req);
            return res.status(200).json(cariEkstre);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async cariListe(req, res) {
        try {
            const cariListe = await MikroServices.cariListe(req);
            return res.status(200).json(cariListe);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }
    
}

export default new MikroController;