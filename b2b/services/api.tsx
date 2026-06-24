export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const API_BASE_URL_RESIM = process.env.NEXT_PUBLIC_API_URL_RESIM;
export const API_BASE_URL_RESIM_KATEGORI = process.env.NEXT_PUBLIC_API_URL_RESIM_KATEGORI;
export const API_BASE_URL_RESIM_SLIDER = process.env.NEXT_PUBLIC_API_URL_SLIDER_RESIM;
export const API_BASE_URL_RESIM_CATALOG = process.env.NEXT_PUBLIC_API_URL_RESIM_CATALOG;
export const API_BASE_URL_RESIM_NEWS = process.env.NEXT_PUBLIC_API_URL_RESIM_NEWS;

export const API_ENDPOINTS = {
    baseURL: `${API_BASE_URL}`,
    refreshToken: `${API_BASE_URL}/login/b2b-refresh-token`,
    login: `${API_BASE_URL}/login/b2b-login`,
    
    kategorilerListe: `${API_BASE_URL}/kategoriler/web/liste`,
    kategorilerBreadcrumb: `${API_BASE_URL}/kategoriler/web/breadcrumb/`,
    kategorilerHomeAnaKategoriler: `${API_BASE_URL}/kategoriler/web/webHomeAnaKategoriler`,
    kategorilerUrunleri: `${API_BASE_URL}/urunler/b2b/kategoriUrunleri/`,
    kategorilerYeniUrunler: `${API_BASE_URL}/urunler/web/kategoriYeniUrunler/`,
    kategorilerOutletUrunler: `${API_BASE_URL}/urunler/web/kategoriOutletUrunler/`,
    urunDetay: `${API_BASE_URL}/urunler/b2b/urunDetay/`,
    urunAra: `${API_BASE_URL}/urunler/b2b/urunArama/`,
    yeniUrunler: `${API_BASE_URL}/urunler/web/yeniUrunler`,
    oneCikanlar: `${API_BASE_URL}/urunler/web/onecikanUrunler`,
    benzerUrunler: `${API_BASE_URL}/urunler/web/benzerUrunler/`,
    enCokSatanlar: `${API_BASE_URL}/urunler/web/enCokSatanlar`,
    sliderGetir: `${API_BASE_URL}/slider/b2b/b2bSliderGetir`,
    catalogGetir: `${API_BASE_URL}/sayfalar/katalog/webKatalogGetir`,
    haberlerGetir: `${API_BASE_URL}/sayfalar/haberler/webHaberlerGetir`,
    haberDetay: `${API_BASE_URL}/sayfalar/haberler/webHaberWebById/`,

    createSepet: `${API_BASE_URL}/sepet/create`,
    getSepet: `${API_BASE_URL}/sepet/getSepet/`,
    updateSepet: `${API_BASE_URL}/sepet/updateSepet/`,
    deleteSepetItem: `${API_BASE_URL}/sepet/deleteSepetItem/`,

    createSiparis: `${API_BASE_URL}/siparisler/create`,
    getSiparisler: `${API_BASE_URL}/siparisler/getSiparisler/`,
    updateSiparis: `${API_BASE_URL}/siparisler/updateSiparis/`,
    deleteSiparis: `${API_BASE_URL}/siparisler/deleteSiparis/`,
    proformaFaturaPdf: `${API_BASE_URL}/other/proformaFaturaPdf/`,
    orderPdf: `${API_BASE_URL}/other/orderPdf/`,
    faturaPdf: `${API_BASE_URL}/other/faturaPdf/`,
    siparisTopluExcelUrunListesi: `${API_BASE_URL}/siparisler/toplu-urun-listesi/`,
    siparisTopluExcelUrunEkle: `${API_BASE_URL}/siparisler/toplu-urun-ekle/`,
    
    musteriAdresleri: `${API_BASE_URL}/musteriler/adresler/`,
    updateProfil: `${API_BASE_URL}/musteriler/updateProfil/`,
    getProfil: `${API_BASE_URL}/musteriler/getProfil/`,
    createAdres: `${API_BASE_URL}/musteriler/createAdres/`,
    updateAdres: `${API_BASE_URL}/musteriler/updateAdres/`,
    deleteAdres: `${API_BASE_URL}/musteriler/deleteAdres/`,

    yeniMusteriBasvuru: `${API_BASE_URL}/musteriler/yeniMusteriBasvuru/`,
    cariEkstre: `${API_BASE_URL}/mikro/cari-ekstre/liste/`,
    cariBakiye: `${API_BASE_URL}/musteriler/cari-bakiye`,

    filtreler: `${API_BASE_URL}/kategoriler/web/filtreler/`,
}; 