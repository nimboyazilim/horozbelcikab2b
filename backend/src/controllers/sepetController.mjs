import SepetServices from '../services/sepetServices.mjs';

class SepetController {

    async getSepet(req, res) {
        try {
            const sepet = await SepetServices.getSepet(req);
            return res.status(200).json(sepet);
        } catch (error) {
            return res.status(500).json({   
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }
    

  async createSepet(req, res) {
    try {
        const sepet = await SepetServices.createSepet(req);
        if (sepet.status === 'error') {  
         return res.status(409).json(sepet);
        }
        return res.status(200).json(sepet);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async updateSepet(req, res) {
    try {
        const sepet = await SepetServices.updateSepet(req);
        return res.status(200).json(sepet);
    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
    }
  }

  async deleteSepet(req, res) {
    try {
        const sepet = await SepetServices.deleteSepet(req);
        return res.status(200).json(sepet);
    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
    }
  }
  
  async getCmsSepetListe(req, res) {
    try {
        const sepet = await SepetServices.getCmsSepetListe(req);
        return res.status(200).json(sepet);
    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
    }
  }

  async getCmsSepetById(req, res) {
    try {
        const sepet = await SepetServices.getCmsSepetById(req);
        return res.status(200).json(sepet);
    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
    }
  }




}

export default new SepetController();