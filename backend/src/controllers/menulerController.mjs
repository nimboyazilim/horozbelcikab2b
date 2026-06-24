import MenulerServices from '../services/menulerServices.mjs';

class MenulerController {
 

    async menulerListe(req, res) {
    try {
      const menuler = await MenulerServices.menulerListe(req);
      if (!menuler) {
        res.status(404).json({ message: 'No menuler found' });
      }
      return res.status(200).json(menuler);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

    async menulerListe2(req, res) {
      try {
        const menuler = await MenulerServices.menulerListe2(req);
        if (!menuler) {
          res.status(404).json({ message: 'No menuler found' });
        }
        return res.status(200).json(menuler);
      } catch (error) { 
        res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    }

}

export default new MenulerController();