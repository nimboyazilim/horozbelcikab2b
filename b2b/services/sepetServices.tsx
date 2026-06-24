import { API_ENDPOINTS } from "./api";
import api from "./apiaxios";


class SepetServices {

    async getSepet(musteri_id: string) {
        const response = await api.get(API_ENDPOINTS.getSepet + musteri_id);
        return response.data;
    }

    async createSepet(data: any) {
        const response = await api.post(API_ENDPOINTS.createSepet, data);
        return response.data;
    }

    async updateSepet(urun_id: string, varyant_id: string, quantity: number) {
        const response = await api.put(API_ENDPOINTS.updateSepet + urun_id + '/' + varyant_id, { miktar: quantity });
        return response.data;
    }

    async deleteSepetItem(urun_id: string, varyant_id: string) {
        const response = await api.delete(API_ENDPOINTS.deleteSepetItem + urun_id + '/' + varyant_id);
        return response.data;
    }
    
}

export default new SepetServices();

