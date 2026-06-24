import FormlarServices from '../services/formlarServices.mjs';

class FormlarController {
    async formlarServisFormu(req, res) {
        try {
            const result = await FormlarServices.formlarServisFormu(req, res);
            
            // Eğer bir hata döndüyse
            if (result instanceof Error) {
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }

            // PDF başarıyla oluşturulduysa response service'te handle edilecek
            // Bu nedenle burada bir şey yapmamıza gerek yok
            
        } catch (error) {
            console.error('Controller hatası:', error);
            return res.status(500).json({
                success: false,
                message: 'PDF oluşturulurken bir hata oluştu'
            });
        }
    }
}

export default new FormlarController();