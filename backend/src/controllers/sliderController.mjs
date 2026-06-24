import SliderServices from "../services/sliderServices.mjs";
class SliderController {
    
    async sliderListe(req, res) {
        try {
            const slider = await SliderServices.sliderListe(req);
            return res.status(200).json(slider);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message    
            });
        }
    }

    async createSlider(req, res) {
        try {
            const slider = await SliderServices.createSlider(req);
            if (slider.status === 'error') {  
             return res.status(409).json(slider);
            }
            return res.status(200).json(slider);
        } catch (error) {
          return res.status(500).json({
            status: 'error',
            message: 'Bir hata oluştu: ' + error.message
        });
        }
      }

      async updateSlider(req, res) {
        try {
            const slider = await SliderServices.updateSlider(req);
            return res.status(200).json(slider);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
      }

      async sliderById(req, res) {
        try {
            const slider = await SliderServices.sliderById(req);
            return res.status(200).json(slider);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
      }

      async deleteSlider(req, res) {
        try {
            const slider = await SliderServices.deleteSlider(req);
            return res.status(200).json(slider);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
      }

      async webSliderGetir(req, res) {
        try {
            const slider = await SliderServices.webSliderGetir(req);
            return res.status(200).json(slider);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
      }

      async b2bsliderListe(req, res) {
        try {
            const slider = await SliderServices.b2bsliderListe(req);
            return res.status(200).json(slider);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
      }

      async b2bSliderGetir(req, res) {
        try {
            const slider = await SliderServices.b2bSliderGetir(req);
            return res.status(200).json(slider);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
      }

      async b2bcreateSlider(req, res) {
        try {
            const slider = await SliderServices.b2bcreateSlider(req);
            return res.status(200).json(slider);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message    
            });
        }
      }

      async b2bSliderById(req, res) {
        try {
            const slider = await SliderServices.b2bSliderById(req);
            return res.status(200).json(slider);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
      }

      async b2bdeleteSlider(req, res) {
        try {
            const slider = await SliderServices.b2bdeleteSlider(req);
            return res.status(200).json(slider);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
      } 

      async b2bupdateSlider(req, res) {
        try {
            const slider = await SliderServices.b2bupdateSlider(req);
            return res.status(200).json(slider);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            });
        }
      }
}

export default new SliderController;