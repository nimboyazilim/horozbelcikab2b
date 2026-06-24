import { API_ENDPOINTS } from "./api";
import api from "./apiaxios";


class MusteriServices {

    async getProfil(musteriId: string) {
        const response = await api.get(API_ENDPOINTS.getProfil+musteriId);
        return response.data;
    }

    async updateProfil(musteriId: string, formData: any) {
        const response = await api.put(API_ENDPOINTS.updateProfil + musteriId, formData);
        return response.data;
    }

    async musteriAdresleri(musteriId: string) {
        const response = await api.get(API_ENDPOINTS.musteriAdresleri + musteriId);
        return response.data;
    }

    async createAdres(formData: any) {
        const response = await api.post(API_ENDPOINTS.createAdres, {
            ...formData
        });
        return response.data;
    }

    async updateAdres(adresId: string, formData: any) {
        const response = await api.put(API_ENDPOINTS.updateAdres + adresId, formData);
        return response.data;
    }

    async deleteAdres(adresId: string) {
        const response = await api.delete(API_ENDPOINTS.deleteAdres + adresId);
        return response.data;
    }

    async musteriBasvuru(formData: any) {
        const response = await api.post(API_ENDPOINTS.yeniMusteriBasvuru, formData);
        return response.data;
    }
}
export default new MusteriServices();

