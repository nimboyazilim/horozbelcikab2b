import SiparislerServices from '../services/siparislerServices.mjs';

class SiparislerController {

    async getSiparisler(req, res) {
        try {
            const siparisler = await SiparislerServices.getSiparisler(req);
            return res.status(200).json(siparisler);
        } catch (error) {
            return res.status(500).json({   
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
    }
    

  async createSiparis(req, res) {
    try {
        const siparis = await SiparislerServices.createSiparis(req);
        if (siparis.status === 'error') {  
         return res.status(409).json(siparis);
        }
        return res.status(200).json(siparis);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async createCmsSiparis(req, res) {
    try {
        const siparis = await SiparislerServices.createCmsSiparis(req);
        if (siparis.status === 'error') {  
         return res.status(409).json(siparis);
        }
        return res.status(200).json(siparis);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async updateSiparis(req, res) {
    try {
        const siparis = await SiparislerServices.updateSiparis(req);
        return res.status(200).json(siparis);
    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
    }
  }

  async deleteSiparis(req, res) {
    try {
        const siparis = await SiparislerServices.deleteSiparis(req);
        return res.status(200).json(siparis);
    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
    }
  } 

  async getSiparislerListe(req, res) {
    try {
        const siparisler = await SiparislerServices.getSiparislerListe(req);
        return res.status(200).json(siparisler);
    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
    }
  }

  async getSiparislerCmsById(req, res) {
    try {
        const siparis = await SiparislerServices.getSiparislerCmsById(req);
        return res.status(200).json(siparis);
    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
    }
  }

  async durumCmsUpdate(req, res) {
    try {
        const siparis = await SiparislerServices.durumCmsUpdate(req);
        return res.status(200).json(siparis);
    } catch (error) {
        return res.status(500).json({    
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
    }
  }

  async siparisErpAktar(req, res) {
    try {
        const siparis = await SiparislerServices.siparisErpAktar(req);
        return res.status(200).json(siparis);
    } catch (error) {
        return res.status(500).json({    
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
    }
  }

  async siparisUrunArama(req, res) {
    try {
        const urunler = await SiparislerServices.siparisUrunArama(req);
        return res.status(200).json(urunler);
    } catch (error) {
        return res.status(500).json({    
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
    }
  }

  async siparisTopluExcelUrunListesi(req, res) {
    try {
        await SiparislerServices.siparisTopluExcelUrunListesi(req, res);
    } catch (error) {
        return res.status(500).json({    
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
    }
  }

  async siparisTopluExcelUrunEkle(req, res) {
    try {
       const response = await SiparislerServices.siparisTopluExcelUrunEkle(req, res);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({    
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
    }
  }

  async siparisTopluExcelUrunEkleCms(req, res) {

    try {
        const response = await SiparislerServices.siparisTopluExcelUrunEkleCms(req, res);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({    
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
    }
  }


}

export default new SiparislerController();