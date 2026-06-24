import KategorilerServices from '../services/kategorilerServices.mjs';

class KategorilerController {
 

    async kategorilerListe(req, res) {
    try {
      const kategoriler = await KategorilerServices.kategorilerListe(req);
      if (!kategoriler) {
        res.status(404).json({ message: 'No kategoriler found' });
      }
      return res.status(200).json(kategoriler);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async getKategoriById(req, res) {
    try {
      const kategori = await KategorilerServices.getKategoriById(req);
      if (!kategori) {
        res.status(404).json({ message: 'No kategori found' });
      }
      return res.status(200).json(kategori);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async createKategori(req, res) {
    try {
        const kategori = await KategorilerServices.createKategori(req);
        if (kategori.status === 'error') {  
         return res.status(409).json(kategori);
        }
        return res.status(200).json(kategori);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
    });
    }
  }

  async updateKategori(req, res) {
    try {
        const kategori = await KategorilerServices.updateKategori(req);
        if (kategori.status === 'error') {  
          res.status(404).json(kategori);
        }
        return res.status(200).json(kategori);
    } catch (error) {
      res.status(400).json({});
    }
  }

  async webKategoriListe(req, res) {
    try {
      const kategoriler = await KategorilerServices.webKategoriListe(req);
      if (!kategoriler) {
        res.status(404).json({ message: 'No kategoriler found' });
      }
      return res.status(200).json(kategoriler);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
  
  async webBreadcrumbListe(req, res) {
    try {
      const kategoriler = await KategorilerServices.webBreadcrumbListe(req);
      if (!kategoriler) {
        res.status(404).json({ message: 'No kategoriler found' });
      }
      return res.status(200).json(kategoriler);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }




  async webHomeAnaKategoriler(req, res) {
    try {
      const kategoriler = await KategorilerServices.webHomeAnaKategoriler(req);
      if (!kategoriler) {
        res.status(404).json({ message: 'No kategoriler found' });
      }
      return res.status(200).json(kategoriler);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }


}

export default new KategorilerController();