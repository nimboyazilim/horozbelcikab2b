import NewsletterServices from "../services/newsletterServices.mjs";
class NewsletterController {
    async subscribe(req, res) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ status: 'error', message: 'Email gerekli.' }); await NewsletterServices.subscribe(email);
            res.json({ status: 'success' });
        } catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
}
export default new NewsletterController();