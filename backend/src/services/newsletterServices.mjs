import conMain from "../config/database.mjs";
class NewsletterServices {
    async subscribe(email) {
        // Aynı email varsa tekrar ekleme
        const exists = await conMain('newsletter').where({ email }).first();
        if (exists) throw new Error('Bu e-posta zaten kayıtlı.');
        await conMain('newsletter').insert({ email });
        return { status: 'success' };
    }
}
export default new NewsletterServices();