import DashboardServices from "../services/dashboardServices.mjs";
class DashboardController {
    
    async satislarToplam(req, res) {
        try {
            const satislar = await DashboardServices.satislarToplam(req);
            return res.status(200).json(satislar);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message    
            });
        }
    }

    async siparislerToplam(req, res) {
        try {
            const siparisler = await DashboardServices.siparislerToplam(req);
            return res.status(200).json(siparisler);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async sepetlerToplam(req, res) {
        try {
            const sepetler = await DashboardServices.sepetlerToplam(req);
            return res.status(200).json(sepetler);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async enCokSatilanUrunler(req, res) {
        try {
            const enCokSatilanUrunler = await DashboardServices.enCokSatilanUrunler(req);
            return res.status(200).json(enCokSatilanUrunler);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async sonAlinanSiparisler(req, res) {
        try {
            const sonAlinanSiparisler = await DashboardServices.sonAlinanSiparisler(req);
            return res.status(200).json(sonAlinanSiparisler);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async istatistikler(req, res) {
        try {
            const istatistikler = await DashboardServices.istatistikler(req);
            return res.status(200).json(istatistikler);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async grafik1(req, res) {
        try {
            const grafik1 = await DashboardServices.grafik1(req);
            return res.status(200).json(grafik1);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

}

export default new DashboardController;