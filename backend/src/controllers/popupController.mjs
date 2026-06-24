import PopupServices from "../services/popupServices.mjs";

class PopupController {
    async popupListe(req, res) {
        try {
            const popups = await PopupServices.popupListe();
            return res.status(200).json(popups);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async createPopup(req, res) {
        try {
            const popup = await PopupServices.createPopup(req);
            return res.status(200).json(popup);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async updatePopup(req, res) {
        try {
            const popup = await PopupServices.updatePopup(req);
            return res.status(200).json(popup);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async popupById(req, res) {
        try {
            const popup = await PopupServices.popupById(req);
            return res.status(200).json(popup);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async deletePopup(req, res) {
        try {
            const popup = await PopupServices.deletePopup(req);
            return res.status(200).json(popup);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getActivePopup(req, res) {
        try {
            const popup = await PopupServices.getActivePopup();
            return res.status(200).json(popup);
        } catch (error) {
            console.error('getActivePopup error:', error);
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
}

export default new PopupController();
