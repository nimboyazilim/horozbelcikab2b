import MusterilerServices from '../services/musterilerServices.mjs';

class MusterilerController {
 

  async musterilerListe(req, res) {
    try {
      const musteriler = await MusterilerServices.musterilerListe(req);
      if (!musteriler) {
        res.status(404).json({ message: 'No musteriler found' });
      }
      return res.status(200).json(musteriler);
    } catch (error) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async musterilerAdresler(req, res) {
    try {
      const adresler = await MusterilerServices.musterilerAdresler(req);
      return res.status(200).json(adresler);
    } catch (error) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async getProfil(req, res) {
    try {
        const profil = await MusterilerServices.getProfil(req);
        if (!profil) {
            return res.status(404).json({
                status: 'error',
                message: 'Profil bilgileri bulunamadı'
            });
        }
        return res.status(200).json(profil);
    } catch (error) {
        return res.status(500).json({   
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
    }
}

  async updateProfil(req, res) {
    try {
      const profil = await MusterilerServices.updateProfil(req);
      return res.status(200).json(profil);
    } catch (error) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async createAdres(req, res) {
    try {
      const adres = await MusterilerServices.createAdres(req);
      return res.status(200).json(adres);
    } catch (error) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async updateAdres(req, res) {
    try {
      const adres = await MusterilerServices.updateAdres(req);
      return res.status(200).json(adres);
    } catch (error) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async deleteAdres(req, res) {
    try {
      const adres = await MusterilerServices.deleteAdres(req);
      return res.status(200).json(adres);
    } catch (error) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async cmsMusterilerCreate(req, res) {
    try {
      const musteriler = await MusterilerServices.cmsMusterilerCreate(req);
      return res.status(200).json(musteriler);
    } catch (error) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async cmsMusterilerById(req, res) {
    try {
      const musteriler = await MusterilerServices.cmsMusterilerById(req);
      return res.status(200).json(musteriler);
    } catch (error) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async cmsMusterilerUpdate(req, res) {
    try {
      const musteriler = await MusterilerServices.cmsMusterilerUpdate(req);
      return res.status(200).json(musteriler);
    } catch (error) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async musterilerGrupFiyatListesi(req, res) {
    try {
      const musteriler = await MusterilerServices.musterilerGrupFiyatListesi(req);
      return res.status(200).json(musteriler);
    } catch (error) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async yeniMusteriBasvuru(req, res) {
    try {
      const musteriler = await MusterilerServices.yeniMusteriBasvuru(req);
      return res.status(200).json(musteriler);
    } catch (error) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async musterilerDelete(req, res) {
    try {
      const musteriler = await MusterilerServices.musterilerDelete(req);
      return res.status(200).json(musteriler);
    } catch (error) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async cariBakiye(req, res) {
    try {
      const bakiye = await MusterilerServices.cariBakiye(req);
      return res.status(200).json(bakiye);
    } catch (error) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }
}

export default new MusterilerController();