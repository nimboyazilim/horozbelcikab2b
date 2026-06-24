import MediaServices from '../services/mediaServices.mjs';

class MediaController {
    async photoList(req, res) { res.json(await MediaServices.photoList()); }
    async photoById(req, res) { res.json(await MediaServices.photoById(req.params.id)); }
    async createPhoto(req, res) { res.json(await MediaServices.createPhoto(req)); }
    async updatePhoto(req, res) { res.json(await MediaServices.updatePhoto(req)); }
    async deletePhoto(req, res) { res.json(await MediaServices.deletePhoto(req.params.id)); }

    async videoList(req, res) { res.json(await MediaServices.videoList()); }
    async videoById(req, res) { res.json(await MediaServices.videoById(req.params.id)); }
    async createVideo(req, res) { res.json(await MediaServices.createVideo(req)); }
    async updateVideo(req, res) { res.json(await MediaServices.updateVideo(req)); }
    async deleteVideo(req, res) { res.json(await MediaServices.deleteVideo(req.params.id)); }
}
export default new MediaController();