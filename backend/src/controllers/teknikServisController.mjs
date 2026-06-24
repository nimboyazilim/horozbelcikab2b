import TeknikServisServices from '../services/teknikServisServices.mjs';

class TeknikServisController {
 

  async teknikServisListe(req, res) {
    try {
      const teknikServis = await TeknikServisServices.teknikServisListe(req);
      if (!teknikServis) {
        res.status(404).json({ message: 'No teknik servis found' });
      }
      return res.status(200).json(teknikServis);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  // Get single user
  async getTeknikServisById(req, res) {
    try {
      const teknikServis = await TeknikServisServices.getTeknikServisById(req);
      if (!teknikServis) {
        res.status(404).json({ message: 'No teknik servis found' });
      }
      return res.status(200).json(teknikServis);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }


    async createTeknikServis(req, res) {
      try {
          const teknikServis = await TeknikServisServices.createTeknikServis(req);
          if (teknikServis.status === 'error') {  
            res.status(404).json(teknikServis);
          }
          return res.status(200).json(teknikServis);
      } catch (error) {
        res.status(400).json({});
      }
    }

    async updateTeknikServis(req, res) {
      try {
          const teknikServis = await TeknikServisServices.updateTeknikServis(req);
          if (teknikServis.status === 'error') {  
            res.status(404).json(teknikServis);
          }
          return res.status(200).json(teknikServis);
      } catch (error) {
        res.status(400).json({});
      }
    }

    async deleteTeknikServis(req, res) {
      try {
          const teknikServis = await TeknikServisServices.deleteTeknikServis(req);
          return res.status(200).json(teknikServis);
      } catch (error) {
        res.status(400).json({});
      }
    }

 
  async teknikServisTipListe(req, res) {
    try {
      const teknikServisTip = await TeknikServisServices.teknikServisTipListe(req);
      if (!teknikServisTip) {
        res.status(404).json({ message: 'No teknik servis tip found' });
      }
      return res.status(200).json(teknikServisTip);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async teknikServisTurListe(req, res) {
    try {
      const teknikServisTur = await TeknikServisServices.teknikServisTurListe(req);
      if (!teknikServisTur) {
        res.status(404).json({ message: 'No teknik servis tur found' });
      }
      return res.status(200).json(teknikServisTur);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async teknikServisCagriTurListe(req, res) {
    try {
      const teknikServisCagriTur = await TeknikServisServices.teknikServisCagriTurListe(req);
      if (!teknikServisCagriTur) {
        res.status(404).json({ message: 'No teknik servis cagri tur found' });
      }
      return res.status(200).json(teknikServisCagriTur);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async teknikServisDurumListe(req, res) {
    try {
      const teknikServisDurum = await TeknikServisServices.teknikServisDurumListe(req);
      if (!teknikServisDurum) {
        res.status(404).json({ message: 'No teknik servis durum found' });
      }
      return res.status(200).json(teknikServisDurum);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }


}

export default new TeknikServisController();