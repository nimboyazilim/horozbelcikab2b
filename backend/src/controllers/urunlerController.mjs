import UrunlerServices from '../services/urunlerServices.mjs';

class UrunlerController {


  async urunlerListe(req, res) {
    try {
      const urunler = await UrunlerServices.urunlerListe(req);
      if (!urunler) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(urunler);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async getUrunById(req, res) {
    try {
      const urun = await UrunlerServices.getUrunById(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }


  async createUrun(req, res) {
    try {
      const urun = await UrunlerServices.createUrun(req);
      if (urun.status === 'error') {
        return res.status(409).json(urun);
      }
      return res.status(200).json(urun);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Bir hata oluştu: ' + error.message
      });
    }
  }

  async updateUrun(req, res) {
    try {
      const urun = await UrunlerServices.updateUrun(req);
      if (urun.status === 'error') {
        res.status(404).json(urun);
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(400).json({});
    }
  }

  async urunMiktarGuncelle(req, res) {
    try {
      const urun = await UrunlerServices.urunMiktarGuncelle(req);
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async getUrunMiktar(req, res) {
    try {
      const urun = await UrunlerServices.getUrunMiktar(req);
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async getUrunVaryantListe(req, res) {
    try {
      const urun = await UrunlerServices.getUrunVaryantListe(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async getAnaVaryantListe(req, res) {
    try {
      const urun = await UrunlerServices.getAnaVaryantListe(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async createUrunVaryant(req, res) {
    try {
      const urun = await UrunlerServices.createUrunVaryant(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async updateUrunVaryant(req, res) {
    try {
      const urun = await UrunlerServices.updateUrunVaryant(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }


  async getUrunVaryantById(req, res) {
    try {
      const urun = await UrunlerServices.getUrunVaryantById(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async urunVaryantSil(req, res) {
    try {
      const urun = await UrunlerServices.urunVaryantSil(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async getUrunOzelFiyatListe(req, res) {
    try {
      const urun = await UrunlerServices.getUrunOzelFiyatListe(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async createUrunOzelFiyat(req, res) {
    try {
      const urun = await UrunlerServices.createUrunOzelFiyat(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }


  async createUrunResim(req, res) {
    try {
      const urun = await UrunlerServices.createUrunResim(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async urunResimListe(req, res) {
    try {
      const urun = await UrunlerServices.urunResimListe(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async urunResimSil(req, res) {
    try {
      const urun = await UrunlerServices.urunResimSil(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async urunResimKapakGuncelle(req, res) {
    try {
      const urun = await UrunlerServices.urunResimKapakGuncelle(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async urunVaryantResimSec(req, res) {
    try {
      const urun = await UrunlerServices.urunVaryantResimSec(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async createUrunOzellik(req, res) {
    try {
      const urun = await UrunlerServices.createUrunOzellik(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async getUrunOzellikListe(req, res) {
    try {
      const urun = await UrunlerServices.getUrunOzellikListe(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async getOzellikListe(req, res) {
    try {
      const urun = await UrunlerServices.getOzellikListe(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async getUrunDosyaTanimListe(req, res) {
    try {
      const urun = await UrunlerServices.getUrunDosyaTanimListe(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async urunDosyaEkle(req, res) {
    try {
      const urun = await UrunlerServices.urunDosyaEkle(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async getUrunDosyaListe(req, res) {
    try {
      const urun = await UrunlerServices.getUrunDosyaListe(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async urunDosyaSil(req, res) {
    try {
      const urun = await UrunlerServices.urunDosyaSil(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async urunAnaDurumlari(req, res) {
    try {
      const urun = await UrunlerServices.urunAnaDurumlari(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async urunDurumGuncelle(req, res) {
    try {
      const urun = await UrunlerServices.urunDurumGuncelle(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async urunDurumGrup(req, res) {
    try {
      const urun = await UrunlerServices.urunDurumGrup(req);
      if (!urun) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(urun);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }



  async webgetKategoriUrunleri(req, res) {
    try {
      const result = await UrunlerServices.webgetKategoriUrunleri(req);
      if (!result) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async b2bgetKategoriUrunleri(req, res) {
    try {
      const result = await UrunlerServices.b2bgetKategoriUrunleri(req);
      if (!result) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async webOutletUrunler(req, res) {
    try {
      const result = await UrunlerServices.webOutletUrunler(req);
      if (!result) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async webgetKategoriYeniUrunler(req, res) {
    try {
      const result = await UrunlerServices.webgetKategoriYeniUrunler(req);
      if (!result) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async webgetKategoriOutletUrunler(req, res) {
    try {
      const result = await UrunlerServices.webgetKategoriOutletUrunler(req);
      if (!result) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async webUrunDetay(req, res) {
    try {
      const result = await UrunlerServices.webUrunDetay(req);
      if (!result) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async b2bUrunDetay(req, res) {
    try {
      const result = await UrunlerServices.b2bUrunDetay(req);
      if (!result) {
        res.status(404).json({ message: 'No urun found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async b2bgetUrunArama(req, res) {
    try {
      const result = await UrunlerServices.b2bgetUrunArama(req);
      if (!result) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async webgetUrunArama(req, res) {
    try {
      const result = await UrunlerServices.webgetUrunArama(req);
      if (!result) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async webKurumsalgetKategoriUrunleri(req, res) {
    try {
      const result = await UrunlerServices.webKurumsalgetKategoriUrunleri(req);
      if (!result) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async webYeniUrunler(req, res) {
    try {
      const result = await UrunlerServices.webYeniUrunler(req);
      if (!result) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async webOnecikanUrunler(req, res) {
    try {
      const result = await UrunlerServices.webOnecikanUrunler(req);
      if (!result) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async webEnCokSatanlar(req, res) {
    try {
      const result = await UrunlerServices.webEnCokSatanlar(req);
      if (!result) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async webBenzerUrunler(req, res) {
    try {
      const result = await UrunlerServices.webBenzerUrunler(req);
      if (!result) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }







  async webUrunlerListe(req, res) {
    try {
      const urunler = await UrunlerServices.webUrunlerListe(req);
      if (!urunler) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(urunler);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  async webBreadcrumbListe(req, res) {
    try {
      const urunler = await UrunlerServices.webBreadcrumbListe(req);
      if (!urunler) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(urunler);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }


  async webHomeAnaUrunler(req, res) {
    try {
      const urunler = await UrunlerServices.webHomeAnaUrunler(req);
      if (!urunler) {
        res.status(404).json({ message: 'No urunler found' });
      }
      return res.status(200).json(urunler);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }


}

export default new UrunlerController();