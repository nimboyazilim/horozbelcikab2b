export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const API_BASE_URL_RESIM = process.env.NEXT_PUBLIC_API_URL_RESIM;
export const API_BASE_URL_DOSYA = process.env.NEXT_PUBLIC_API_URL_DOSYA;
export const API_BASE_URL_KATEGORI_RESIM = process.env.NEXT_PUBLIC_API_URL_KATEGORI_RESIM;
export const API_BASE_URL_SLIDER_RESIM = process.env.NEXT_PUBLIC_API_URL_SLIDER_RESIM;
export const API_BASE_URL_KATALOG_RESIM = process.env.NEXT_PUBLIC_API_URL_KATALOG_RESIM;
export const API_BASE_URL_HABERLER_RESIM = process.env.NEXT_PUBLIC_API_URL_HABERLER_RESIM;
export const API_BASE_URL_RESIM_BANNER = process.env.NEXT_PUBLIC_API_URL_RESIM_BANNER;
export const API_BASE_URL_RESIM_MEDIA = process.env.NEXT_PUBLIC_API_URL_RESIM_MEDIA || `${API_BASE_URL}/uploads/media`;
export const API_BASE_URL_RESIM_REFERANS = process.env.NEXT_PUBLIC_API_URL_RESIM_REFERANS || `${API_BASE_URL}/uploads/references`;
export const API_BASE_URL_PDF = process.env.NEXT_PUBLIC_API_URL_PDF || `${API_BASE_URL}/uploads/pdfs`;
export const API_BASE_URL_TIMELINE = process.env.NEXT_PUBLIC_API_URL_TIMELINE || `${API_BASE_URL}/uploads/timeline`;
export const API_BASE_URL_POPUP = process.env.NEXT_PUBLIC_API_URL_POPUP || `${API_BASE_URL}/uploads/popup`;


export const API_ENDPOINTS = {
    baseURL: `${API_BASE_URL}`,
    refreshToken: `${API_BASE_URL}/login/refresh-token`,
    login: `${API_BASE_URL}/login`,

    kategoriCreate: `${API_BASE_URL}/kategoriler/create`,
    kategoriUpdate: `${API_BASE_URL}/kategoriler/`,
    kategoriListe: `${API_BASE_URL}/kategoriler/liste`,
    kategoriById: `${API_BASE_URL}/kategoriler/`,

    urunCreate: `${API_BASE_URL}/urunler/create`,
    urunUpdate: `${API_BASE_URL}/urunler/`,
    urunListe: `${API_BASE_URL}/urunler/liste`,
    urunById: `${API_BASE_URL}/urunler/`,
    urunVaryantListe: `${API_BASE_URL}/urunler/varyant/`,
    anaVaryantListe: `${API_BASE_URL}/urunler/varyant/anaListe`,
    urunVaryantEkle: `${API_BASE_URL}/urunler/varyant/createUrunVaryant`,
    urunVaryantSil: `${API_BASE_URL}/urunler/varyant`,
    urunVaryantDetay: `${API_BASE_URL}/urunler/varyant/detay/`,
    urunVaryantUpdate: `${API_BASE_URL}/urunler/varyant/update/`,
    urunOzelFiyatEkle: `${API_BASE_URL}/urunler/ozelFiyat/create`,
    urunOzelFiyatListe: `${API_BASE_URL}/urunler/ozelFiyat/liste/`,
    urunResimEkle: `${API_BASE_URL}/urunler/resim/create`,
    urunResimListe: `${API_BASE_URL}/urunler/resim/liste/`,
    urunResimSil: `${API_BASE_URL}/urunler/resim/`,
    urunKapakResimYap: `${API_BASE_URL}/urunler/resim/kapak`,
    urunVaryantResimSec: `${API_BASE_URL}/urunler/varyant/resim/sec`,
    urunOzellikEkle: `${API_BASE_URL}/urunler/ozellik/create`,
    urunOzellikListe: `${API_BASE_URL}/urunler/ozellik/liste/`,
    urunOzelliklerTumListe: `${API_BASE_URL}/urunler/ozellik/tumListe/`,
    ekliDosyaListesi: `${API_BASE_URL}/urunler/dosyaTanim/liste`,
    ekliDosyaEkle: `${API_BASE_URL}/urunler/urunDosya/create`,
    urunDosyaListesi: `${API_BASE_URL}/urunler/urunDosya/liste/`,
    ekliDosyaSil: `${API_BASE_URL}/urunler/urunDosya/`,
    urunStokMiktariGuncelle: `${API_BASE_URL}/urunler/miktar/guncelle/`,
    urunStokMiktariGetir: `${API_BASE_URL}/urunler/miktar/`,
    urunAnaDurumlari: `${API_BASE_URL}/urunler/durum/anaDurumlar`,
    urunDurumGuncelle: `${API_BASE_URL}/urunler/durum/guncelle`,
    urunDurumGetir: `${API_BASE_URL}/urunler/durum/grup`,

    webSliderCreate: `${API_BASE_URL}/slider/web/create`,
    webSliderUpdate: `${API_BASE_URL}/slider/web/`,
    webSliderListe: `${API_BASE_URL}/slider/web/liste`,
    webSliderById: `${API_BASE_URL}/slider/web/`,
    webSliderDelete: `${API_BASE_URL}/slider/web/`,

    b2bSliderCreate: `${API_BASE_URL}/slider/b2b/create`,
    b2bSliderUpdate: `${API_BASE_URL}/slider/b2b/`,
    b2bSliderListe: `${API_BASE_URL}/slider/b2b/liste`,
    b2bSliderById: `${API_BASE_URL}/slider/b2b/`,
    b2bSliderDelete: `${API_BASE_URL}/slider/b2b/`,

    katalogCreate: `${API_BASE_URL}/sayfalar/katalog/create`,
    katalogUpdate: `${API_BASE_URL}/sayfalar/katalog/`,
    katalogListe: `${API_BASE_URL}/sayfalar/katalog/liste`,
    katalogById: `${API_BASE_URL}/sayfalar/katalog/`,
    katalogDelete: `${API_BASE_URL}/sayfalar/katalog/`,

    webHaberCreate: `${API_BASE_URL}/sayfalar/haberler/create`,
    webHaberUpdate: `${API_BASE_URL}/sayfalar/haberler/`,
    webHaberListe: `${API_BASE_URL}/sayfalar/haberler/liste`,
    webHaberById: `${API_BASE_URL}/sayfalar/haberler/`,
    webHaberDelete: `${API_BASE_URL}/sayfalar/haberler/`,

    musterilerListe: `${API_BASE_URL}/musteriler/liste`,
    musterilerCreate: `${API_BASE_URL}/musteriler/cmsMusterilerCreate`,
    musterilerUpdate: `${API_BASE_URL}/musteriler/cmsMusterilerUpdate/`,
    musterilerById: `${API_BASE_URL}/musteriler/cmsMusterilerById/`,
    musterilerAdreslerListe: `${API_BASE_URL}/musteriler/adresler/`,
    musterilerFiyatGrupListe: `${API_BASE_URL}/musteriler/fiyatGrup/liste`,
    musterilerDelete: `${API_BASE_URL}/musteriler/`,

    siparislerListe: `${API_BASE_URL}/siparisler/getSiparislerListe/liste`,
    siparislerCreate: `${API_BASE_URL}/siparisler/create`,
    siparislerUpdate: `${API_BASE_URL}/siparisler/`,
    siparislerById: `${API_BASE_URL}/siparisler/getSiparislerCms/`,
    siparisDurumUpdate: `${API_BASE_URL}/siparisler/durumCmsUpdate/`,
    siparisErpAktar: `${API_BASE_URL}/siparisler/erpAktar/`,
    siparisUrunArama: `${API_BASE_URL}/siparisler/urunArama/`,
    siparislerCreateCms: `${API_BASE_URL}/siparisler/createCms`,
    siparisTopluExcelUrunListesi: `${API_BASE_URL}/siparisler/toplu-urun-listesi/`,
    siparisTopluExcelUrunEkleCms: `${API_BASE_URL}/siparisler/toplu-urun-ekle-cms/`,


    sepetListe: `${API_BASE_URL}/sepet/getCmsSepetListe`,
    sepetById: `${API_BASE_URL}/sepet/getCmsSepetById/`,

    userListe: `${API_BASE_URL}/users`,
    userCreate: `${API_BASE_URL}/users`,
    userUpdate: `${API_BASE_URL}/users/`,
    userById: `${API_BASE_URL}/users/`,
    userDelete: `${API_BASE_URL}/users/`,
    userProfile: `${API_BASE_URL}/users/profile`,
    userProfileUpdate: `${API_BASE_URL}/users/profile`,
    menulerListe: `${API_BASE_URL}/menuler/liste`,
    menulerListe2: `${API_BASE_URL}/menuler/liste2/`,
    userYetkiGetir: `${API_BASE_URL}/users/yetki/`,
    userYetkiKaydet: `${API_BASE_URL}/users/yetki/`,

    mikroUrunSenkron: `${API_BASE_URL}/mikro/stok/ekle`,
    mikroUrunFiyatSenkron: `${API_BASE_URL}/mikro/urun/fiyatlari/ekle`,
    mikroUrunOzelFiyatSenkron: `${API_BASE_URL}/mikro/urun/ozel/fiyatlari/ekle`,
    mikroUrunVaryantEslestirmeSenkron: `${API_BASE_URL}/mikro/stok/varyant/grup/ekle`,
    mikroUrunVaryantNitelikleriSenkron: `${API_BASE_URL}/mikro/varyant/liste`,
    mikroUrunMiktarSenkron: `${API_BASE_URL}/mikro/stok/miktar/ekle`,
    mikroUrunVergiSenkron: `${API_BASE_URL}/mikro/urun/vergi/ekle`,
    mikroCariListe: `${API_BASE_URL}/mikro/cari/liste/`,

    mikroKategoriSenkron: `${API_BASE_URL}/mikro/kategori/ekle`,
    mikroKategoriUrunBirlestirmeSenkron: `${API_BASE_URL}/mikro/kategori/urun/bagla`,

    dashboardSatisToplam: `${API_BASE_URL}/dashboard/satislar/toplam/`,
    dashboardSiparisToplam: `${API_BASE_URL}/dashboard/siparisler/toplam/`,
    dashboardSepetToplam: `${API_BASE_URL}/dashboard/sepetler/toplam/`,
    dashboardEnCokSatilanUrunler: `${API_BASE_URL}/dashboard/en-cok-satilan-urunler/`,
    dashboardSonAlinanSiparisler: `${API_BASE_URL}/dashboard/son-alinan-siparisler/`,
    dashboardIstatistikler: `${API_BASE_URL}/dashboard/istatistikler/`,
    dashboardGrafik1: `${API_BASE_URL}/dashboard/grafik1/`,

    bildirimlerListe: `${API_BASE_URL}/other/bildirim/listele`,
    proformaFaturaPdf: `${API_BASE_URL}/other/proformaFaturaPdf/`,
    orderPdf: `${API_BASE_URL}/other/orderPdf/`,
    faturaPdf: `${API_BASE_URL}/other/faturaPdf/`,


    bannerListe: `${API_BASE_URL}/banner/liste`,
    bannerCreate: `${API_BASE_URL}/banner/create`,
    bannerUpdate: `${API_BASE_URL}/banner/`,
    bannerById: `${API_BASE_URL}/banner/`,

    mediaPhotoList: `${API_BASE_URL}/media/photos`,
    mediaPhotoCreate: `${API_BASE_URL}/media/photo`,
    mediaPhotoById: `${API_BASE_URL}/media/photo`,
    mediaPhotoUpdate: `${API_BASE_URL}/media/photo`,
    mediaPhotoDelete: `${API_BASE_URL}/media/photo`,

    mediaVideoList: `${API_BASE_URL}/media/videos`,
    mediaVideoCreate: `${API_BASE_URL}/media/video`,
    mediaVideoById: `${API_BASE_URL}/media/video`,
    mediaVideoUpdate: `${API_BASE_URL}/media/video`,
    mediaVideoDelete: `${API_BASE_URL}/media/video`,

    referenceList: `${API_BASE_URL}/references`,
    referenceCreate: `${API_BASE_URL}/reference`,
    referenceById: `${API_BASE_URL}/reference`,
    referenceUpdate: `${API_BASE_URL}/reference`,
    referenceDelete: `${API_BASE_URL}/reference`,

    certificateList: `${API_BASE_URL}/certificates`,
    certificateCreate: `${API_BASE_URL}/certificate`,
    certificateById: `${API_BASE_URL}/certificate`,
    certificateUpdate: `${API_BASE_URL}/certificate`,
    certificateDelete: `${API_BASE_URL}/certificate`,

    corporateTimeline: `${API_BASE_URL}/corporate-timeline`,

    activityLogs: `${API_BASE_URL}/activity-logs`,
}; 