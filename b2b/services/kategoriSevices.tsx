import { API_ENDPOINTS } from "./api";
import api from "./apiaxios";
import serverApi from "./serverApi";

export const getKategori = async () => {
    const response = await api.get(API_ENDPOINTS.kategorilerListe);
    return response.data.kategoriler;
}

export const getKategoriBreadcrumb = async (slug: string) => {
    const response = await api.get(API_ENDPOINTS.kategorilerBreadcrumb+slug);
    return response.data;
}


export const getHomeAnaKategoriler = async () => {
    const response = await api.get(API_ENDPOINTS.kategorilerHomeAnaKategoriler);
    return response.data;
}

export const getKategoriUrunleri = async (slug: string,filtreler: string,accessToken: string) => {
    const response = await serverApi.get(API_ENDPOINTS.kategorilerUrunleri+slug, {
        headers: {
            'x-access-token': accessToken
        },
        params: {
            filtreler: filtreler
        }
    });
    return response.data;
}

export const getKategoriYeniUrunler = async (slug: string,filtreler: string) => {
    const response = await api.get(API_ENDPOINTS.kategorilerYeniUrunler+slug, {
        params: {
            filtreler: filtreler
        }
    });
    return response.data;
}

export const getKategoriOutletUrunler = async (slug: string,filtreler: string) => {
    const response = await api.get(API_ENDPOINTS.kategorilerOutletUrunler+slug, {
        params: {
            filtreler: filtreler
        }
    });
    return response.data;
}

export const getUrunDetay = async (slug: string,accessToken: string) => {
    const response = await serverApi.get(API_ENDPOINTS.urunDetay+slug, {
        headers: {
            'x-access-token': accessToken
        }
    });
    return response.data;
}

    export const getYeniUrunler = async () => {
        const response = await api.get(API_ENDPOINTS.yeniUrunler);
        return response.data;
    }

    export const getOneCikanlar = async () => {
        const response = await api.get(API_ENDPOINTS.oneCikanlar);
        return response.data;
    }

    export const getEnCokSatanlar = async () => {
        const response = await api.get(API_ENDPOINTS.enCokSatanlar);
        return response.data;
    }

    export const getBenzerUrunler = async (kategori_seo: string) => {
        const response = await api.get(API_ENDPOINTS.benzerUrunler+kategori_seo);
        return response.data;
    }

    export const getSlider = async () => {
        const response = await api.get(API_ENDPOINTS.sliderGetir);
        return response.data;
    }

    export const getCatalog = async () => {
        const response = await api.get(API_ENDPOINTS.catalogGetir);
        return response.data;
    }

    export const getNews = async () => {
        const response = await api.get(API_ENDPOINTS.haberlerGetir);
        return response.data;
    }

    export const getNewsDetail = async (slug: string) => {
        const response = await api.get(API_ENDPOINTS.haberDetay+slug);
        return response.data;
    }

    export const getCariBalance = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.cariBakiye);

            if (response.data?.status === 'success') {
                return {
                    status: 'success',
                    bakiye: response.data.bakiye ?? 0
                };
            }

            return {
                status: 'error',
                bakiye: null
            };
        } catch (error) {
            console.error('Bakiye alınamadı:', error);
            return {
                status: 'error',
                bakiye: null
            };
        }
    }

    export const clearBalanceCache = () => {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('cari_bakiye_cache');
            localStorage.removeItem('cari_bakiye_cache_time');
        }
    }