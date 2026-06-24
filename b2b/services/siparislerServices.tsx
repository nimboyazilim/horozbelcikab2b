import { API_ENDPOINTS } from "./api";
import api from "./apiaxios";


class SiparislerServices {

    async getSiparisler(musteriId: string) {
        const response = await api.get(API_ENDPOINTS.getSiparisler + musteriId);
        return response.data;
    }

    async createSiparis(cartId: string,kargoAdresId: number,faturaAdresId: number,aciklama: string) {
        const response = await api.post(API_ENDPOINTS.createSiparis, { cartId,kargoAdresId,faturaAdresId,aciklama });
        return response.data;
    }

    async updateSiparis(id: string, quantity: number) {
        const response = await api.put(API_ENDPOINTS.updateSiparis + id, { miktar: quantity });
        return response.data;
    }

    async deleteSiparis(id: string) {
        const response = await api.delete(API_ENDPOINTS.deleteSiparis + id);
        return response.data;
    }

    async getMusteriAdresleri(musteriId: string) {
        const response = await api.get(API_ENDPOINTS.musteriAdresleri + musteriId);
        return response.data;
    }

    async proformaFaturaPdf(siparisNo: string) {
        const response = await api.get(API_ENDPOINTS.proformaFaturaPdf + siparisNo, { responseType: 'blob' });
        return response;
    }

    async orderPdf(siparisNo: string) {
        const response = await api.get(API_ENDPOINTS.orderPdf + siparisNo, { responseType: 'blob' });
        return response;
    }
    async faturaPdf(siparisNo: string) {
        const response = await api.get(API_ENDPOINTS.faturaPdf + siparisNo, { responseType: 'blob' });
        return response;
    }

    async siparisTopluExcelUrunListesi(musteriId: string) {
        const response = await api.get(API_ENDPOINTS.siparisTopluExcelUrunListesi + musteriId, { responseType: 'blob' });
        return response;
    }

    async siparisTopluExcelUrunEkle(musteriId: string, cartId: string, formData: FormData) {
        const response = await api.post(API_ENDPOINTS.siparisTopluExcelUrunEkle + musteriId + '/' + cartId, formData);

        return response;
    }

}

export default new SiparislerServices();

