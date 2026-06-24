import OtherServices from "../services/otherServices.mjs";
class OtherController {

    async bildirimListele(req, res) {
        try {
            const bildirimler = await OtherServices.bildirimListele(req);
            return res.status(200).json(bildirimler);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async epostaGonder(req, res) {
        try {
            const epostaGonder = await OtherServices.epostaGonder(req);
            return res.status(200).json(epostaGonder);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async proformaFaturaPdf(req, res) {
        try {
            return await OtherServices.proformaFaturaPdf(req, res);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async orderPdf(req, res) {
        try {
            return await OtherServices.orderPdf(req, res);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async faturaPdf(req, res) {
        try {
            return await OtherServices.faturaPdf(req, res);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async iletisimFormuGonder(req, res) {
        try {
            const result = await OtherServices.iletisimFormuGonder(req.body);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }

    async kariyerBasvuruGonder(req, res) {
        try {
            const result = await OtherServices.kariyerBasvuruGonder(req);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }
}

export default new OtherController;