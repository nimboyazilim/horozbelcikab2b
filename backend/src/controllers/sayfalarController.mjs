import SayfalarServices from "../services/sayfalarServices.mjs";
class SayfalarController {

    async katalogListe(req, res) {
        try {
            const katalog = await SayfalarServices.katalogListe(req);
            return res.status(200).json(katalog);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async createKatalog(req, res) {
        try {
            const katalog = await SayfalarServices.createKatalog(req);
            if (katalog.status === 'error') {
                return res.status(409).json(katalog);
            }
            return res.status(200).json(katalog);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async updateKatalog(req, res) {
        try {
            const katalog = await SayfalarServices.updateKatalog(req);
            return res.status(200).json(katalog);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async katalogById(req, res) {
        try {
            const katalog = await SayfalarServices.katalogById(req);
            return res.status(200).json(katalog);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async deleteKatalog(req, res) {
        try {
            const katalog = await SayfalarServices.deleteKatalog(req);
            return res.status(200).json(katalog);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async webKatalogGetir(req, res) {
        try {
            const katalog = await SayfalarServices.webKatalogGetir(req);
            return res.status(200).json(katalog);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async webHaberlerListe(req, res) {
        try {
            const haberler = await SayfalarServices.webHaberlerListe(req);
            return res.status(200).json(haberler);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async webHaberlerGetir(req, res) {
        try {
            const haberler = await SayfalarServices.webHaberlerGetir(req);
            return res.status(200).json(haberler);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }


    async webHaberById(req, res) {
        try {
            const haber = await SayfalarServices.webHaberById(req);
            return res.status(200).json(haber);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async webHaberWebById(req, res) {
        try {
            const haber = await SayfalarServices.webHaberWebById(req);
            return res.status(200).json(haber);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }


    async webHaberCreate(req, res) {
        try {
            const haber = await SayfalarServices.webHaberCreate(req);
            return res.status(200).json(haber);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async webHaberUpdate(req, res) {
        try {
            const haber = await SayfalarServices.webHaberUpdate(req);
            return res.status(200).json(haber);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async webHaberDelete(req, res) {
        try {
            const haber = await SayfalarServices.webHaberDelete(req);
            return res.status(200).json(haber);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }




}

export default new SayfalarController;