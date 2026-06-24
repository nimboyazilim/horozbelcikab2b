import BannerServices from "../services/bannerServices.mjs";
class BannerController {
    async bannerListe(req, res) {
        try {
            const banners = await BannerServices.bannerListe();
            return res.status(200).json(banners);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async createBanner(req, res) {
        try {
            const banner = await BannerServices.createBanner(req);
            return res.status(200).json(banner);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async updateBanner(req, res) {
        try {
            const banner = await BannerServices.updateBanner(req);
            return res.status(200).json(banner);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async bannerById(req, res) {
        try {
            const banner = await BannerServices.bannerById(req);
            return res.status(200).json(banner);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async deleteBanner(req, res) {
        try {
            const banner = await BannerServices.deleteBanner(req);
            return res.status(200).json(banner);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async webBannerGetir(req, res) {
        try {
            const banners = await BannerServices.webBannerGetir();
            return res.status(200).json(banners);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
}
export default new BannerController();