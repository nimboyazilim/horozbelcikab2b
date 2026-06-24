'use client'
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '@/context/cartContext';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getUrunDetay } from '@/services/kategoriSevices';
import Image from 'next/image';
import { API_BASE_URL_RESIM } from '@/services/api';
import Link from 'next/link';

interface UrunDetayPopupProps {
    urunSeo: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function UrunDetayPopup({ urunSeo, isOpen, onClose }: UrunDetayPopupProps) {
    const t = useTranslations('Header');
    const { addToCart, items } = useCart();
    const [musteriId, setMusteriId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [selectedCombination, setSelectedCombination] = useState<any>(null);
    const [miktar, setMiktar] = useState<number>(1);
    const [selectedFilters, setSelectedFilters] = useState<{[key: string]: string}>({});
    const [filteredCombinations, setFilteredCombinations] = useState<any[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const accessToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('accessToken='))
            ?.split('=')[1];
  
        if (accessToken) {
            const decodedToken = decodeJWT(accessToken);
            if (decodedToken) {
                setMusteriId(decodedToken.musteri_id);
            }
        }
    }, []);

    useEffect(() => {
        if (isOpen && urunSeo) {
            fetchUrunDetay();
        }
    }, [isOpen, urunSeo]);

    // Varyant değiştiğinde thumbnail index'ini güncelle
    useEffect(() => {
        console.log('🔍 UseEffect triggered - selectedCombination:', selectedCombination);
        console.log('🔍 Data exists:', !!data);
        console.log('🔍 Data.resimler exists:', !!data?.resimler);
        console.log('🔍 Data.resimler:', data?.resimler);
        console.log('🔍 Selected filters:', selectedFilters);
        
        if (!data || !data.resimler || !selectedCombination) {
            console.log('⚠️ Early return - missing data');
            return;
        }
        
        console.log('✅ All images:', data.resimler);
        console.log('✅ Looking for varyant_id:', selectedCombination.id);
        console.log('✅ Product ID (urun_id):', data.urunDetay.id);
        
        // 1. Önce varyant_id ile eşleşme ara
        let varyantImageIndex = data.resimler.findIndex((img: any) => {
            console.log('🖼️ Checking image:', { 
                resim: img.resim, 
                urun_id: img.urun_id, 
                varyant_id: img.varyant_id,
                matches_urun: img.urun_id === data.urunDetay.id,
                matches_varyant: img.varyant_id === selectedCombination.id
            });
            return img.urun_id === data.urunDetay.id && 
                   img.varyant_id === selectedCombination.id;
        });
        
        console.log('✅ Found variant image at index (by ID):', varyantImageIndex);
        
        // 2. Varyant ID bulunamadıysa, seçili filtrelere göre resim ara
        if (varyantImageIndex === -1 && selectedFilters && Object.keys(selectedFilters).length > 0) {
            console.log('🔍 Searching by filter values in image names...');
            for (const [groupName, filterValue] of Object.entries(selectedFilters)) {
                if (filterValue) {
                    varyantImageIndex = data.resimler.findIndex((img: any) => {
                        const imageName = img.resim.toLowerCase();
                        const filterValueLower = filterValue.toLowerCase();
                        const matches = imageName.includes(filterValueLower);
                        console.log('🖼️ Checking image name:', img.resim, 'for filter:', filterValue, 'matches:', matches);
                        return matches;
                    });
                    
                    if (varyantImageIndex !== -1) {
                        console.log('✅ Found image by name at index:', varyantImageIndex);
                        break;
                    }
                }
            }
        }
        
        // Eğer resim bulunduysa, index'i ayarla
        if (varyantImageIndex !== -1) {
            console.log('✅ Setting currentImageIndex to:', varyantImageIndex);
            setCurrentImageIndex(varyantImageIndex);
        } else {
            console.log('⚠️ No variant-specific image found, keeping current index');
        }
    }, [selectedCombination, selectedFilters, data]);

    const fetchUrunDetay = async () => {
        try {
            setIsLoading(true);
            const accessToken = Cookies.get('accessToken') || '';
            const response = await getUrunDetay(urunSeo, accessToken);
            setData(response);
            
            // Tek varyant olan grupları otomatik seç
            if (response.varyantGruplari) {
                const varyantGroups = response.varyantGruplari.reduce((acc: any, group: any) => {
                    acc[group.adi] = group.altVaryantlar;
                    return acc;
                }, {});

                const newFilters: {[key: string]: string} = {};
                Object.entries(varyantGroups).forEach(([groupName, variants]: [string, any]) => {
                    if (variants.length === 1) {
                        newFilters[groupName] = variants[0].adi;
                    }
                });

                if (Object.keys(newFilters).length > 0) {
                    setSelectedFilters(newFilters);
                    const filtered = response.kombinasyonlar.filter((combination: any) => {
                        return Object.entries(newFilters).every(([group, value]) => {
                            if (!value) return true;
                            const groupId = response.varyantGruplari.find((g: any) => g.adi === group)?.id;
                            if (!groupId) return true;
                            return combination.kombinasyon[groupId]?.adi === value;
                        });
                    });
                    setFilteredCombinations(filtered);
                    if (filtered.length === 1) {
                        setSelectedCombination(filtered[0]);
                        setMiktar(Math.floor(filtered[0].miktar2));
                    }
                } else {
                    setFilteredCombinations(response.kombinasyonlar);
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Ürün detayları yüklenirken hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    function decodeJWT(token: string) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            payload.adsoyad = decodeURIComponent(escape(payload.adsoyad));
            payload.eposta = decodeURIComponent(escape(payload.eposta));
            return payload;
        } catch (e) {
            return null;
        }
    }

    const formatNumber = (number: any) => {
        const numValue = typeof number === 'string' ? parseFloat(number) : Number(number);
        return Math.floor(numValue).toString();
    };

    const formatNumber1 = (number: any) => {
        const numValue = typeof number === 'string' ? parseFloat(number) : Number(number);
        return numValue.toLocaleString('tr-TR', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
    };

    const formatStokKodu = (kod: string) => {
        const parts = kod.split('-');
        if (parts.length >= 4) {
            return parts.slice(1, 4).join('-');
        }
        return kod;
    };

    const formatVariantGroupName = (groupName: string) => {
        const normalized = groupName.replace(/_/g, ' ').trim();
        if (/^color\s+temparature$/i.test(normalized) || /^color\s+temperature$/i.test(normalized)) {
            return t('colorTemperature');
        }
        return normalized;
    };

    const handleFilterSelect = (groupName: string, value: string) => {
        const newFilters = { ...selectedFilters, [groupName]: value };
        setSelectedFilters(newFilters);
        
        const filtered = data.kombinasyonlar.filter((combination: any) => {
            return Object.entries(newFilters).every(([group, value]) => {
                if (!value) return true;
                const groupId = data.varyantGruplari.find((g: any) => g.adi === group)?.id;
                if (!groupId) return true;
                return combination.kombinasyon[groupId]?.adi === value;
            });
        });

        setFilteredCombinations(filtered);
        
        if (filtered.length === 1) {
            setSelectedCombination(filtered[0]);
            setMiktar(Math.floor(filtered[0].miktar2));
        } else {
            setSelectedCombination(null);
        }
    };

    const resetFilter = (groupName: string) => {
        const { [groupName]: removed, ...newFilters } = selectedFilters;
        setSelectedFilters(newFilters);
        
        const filtered = data.kombinasyonlar.filter((combination: any) => {
            return Object.entries(newFilters).every(([group, value]) => {
                if (!value) return true;
                const groupId = data.varyantGruplari.find((g: any) => g.adi === group)?.id;
                if (!groupId) return true;
                return combination.kombinasyon[groupId]?.adi === value;
            });
        });

        setFilteredCombinations(filtered);
        
        if (filtered.length === 1) {
            setSelectedCombination(filtered[0]);
            setMiktar(Math.floor(filtered[0].miktar2));
        } else {
            setSelectedCombination(null);
        }
    };

    const resetAllFilters = () => {
        // Tek varyantlı grupların seçimlerini koru
        const singleVariantFilters: {[key: string]: string} = {};
        
        if (data?.varyantGruplari) {
            data.varyantGruplari.forEach((group: any) => {
                const variants = group.altVaryantlar;
                if (variants && variants.length === 1) {
                    singleVariantFilters[group.adi] = variants[0].adi;
                }
            });
        }
        
        setSelectedFilters(singleVariantFilters);
        
        // Kombinasyonları filtrele
        const filtered = data.kombinasyonlar.filter((combination: any) => {
            return Object.entries(singleVariantFilters).every(([group, value]) => {
                if (!value) return true;
                const groupId = data.varyantGruplari.find((g: any) => g.adi === group)?.id;
                if (!groupId) return true;
                return combination.kombinasyon[groupId]?.adi === value;
            });
        });
        
        setFilteredCombinations(filtered);
        
        if (filtered.length === 1) {
            setSelectedCombination(filtered[0]);
            setMiktar(Math.floor(filtered[0].miktar2));
        } else {
            setSelectedCombination(null);
        }
    };

    const handleAddToCart = () => {
        if (!selectedCombination) {
            toast.error(t('selectAllVariants'));
            return;
        }

        const koliAdeti = selectedCombination.miktar2;
        if (miktar % koliAdeti !== 0) {
            toast.error(`Ürün ${formatNumber(koliAdeti)} adetlik koli adeti şeklinde sipariş edilmelidir`);
            return;
        }

        let cartId = items.length > 0 ? (Cookies.get('cartId') || '') : uuidv4();
        if (!items.length) {
            Cookies.set('cartId', cartId);
        }

        addToCart({
            id: selectedCombination.id,
            varyant_id: selectedCombination.id,
            urun_id: data.urunDetay.id,
            miktar: miktar,
            miktar2: selectedCombination.miktar2,
            cartId: cartId,
            musteri_id: musteriId,
            urun_adi: data.urunDetay.urun_adi,
            stok_kodu: selectedCombination.stok_kodu,
            varyantAdi: selectedCombination.adi,
            varyant_urun_adi: selectedCombination.varyant_urun_adi,
            resim: '',
            fiyat: selectedCombination.fiyat,
            urun_seo: data.urunDetay.urun_seo,
            vergi_id: 0,
            kdv_fiyat: 0,
            ara_toplam: 0,
            birim_fiyat: 0,
            genel_toplam: 0,
            iskonto_tutari: 0,
            iskonto_orani: 0,
            indirimli_fiyat: 0
        });

        toast.success(t('addedToCart'));
        onClose();
    };

    const getCurrentImages = () => {
        if (!data || !data.resimler || data.resimler.length === 0) {
            return [{ resim: 'urun-gorsel.webp' }];
        }
        // Küçük resimler için her zaman tüm resimleri döndür
        return data.resimler;
    };
    
    const getCurrentMainImage = () => {
        if (!data) return { resim: 'urun-gorsel.webp' };
        
        // Eğer varyant seçiliyse
        if (selectedCombination) {
            // 1. Önce varyant_id ile eşleşme ara
            const varyantImages = data.resimler.filter((img: any) => 
                img.urun_id === data.urunDetay.id && 
                img.varyant_id === selectedCombination.id
            );
            if (varyantImages.length > 0) {
                return varyantImages[0];
            }
            
            // 2. Varyant ID bulunamadıysa, seçili filtrelere göre resim ara
            // Her bir seçili filtre değerini resim isminde ara
            if (selectedFilters && Object.keys(selectedFilters).length > 0) {
                for (const [groupName, filterValue] of Object.entries(selectedFilters)) {
                    if (filterValue) {
                        // Resim isminde bu değer geçen bir resim ara
                        const matchingImage = data.resimler.find((img: any) => {
                            const imageName = img.resim.toLowerCase();
                            const filterValueLower = filterValue.toLowerCase();
                            return imageName.includes(filterValueLower);
                        });
                        
                        if (matchingImage) {
                            console.log('✅ Resim ismiyle eşleşme bulundu:', matchingImage.resim, 'için filtre:', filterValue);
                            return matchingImage;
                        }
                    }
                }
            }
        }
        
        // Değilse seçili index'teki resmi göster
        const safeIndex = Math.min(currentImageIndex, data.resimler.length - 1);
        return data.resimler[safeIndex] || { resim: 'urun-gorsel.webp' };
    };

    const currentImages = getCurrentImages();
    const currentImage = getCurrentMainImage();

    const varyantGroups = data?.varyantGruplari?.reduce((acc: any, group: any) => {
        acc[group.adi] = group.altVaryantlar;
        return acc;
    }, {}) || {};

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
                <DialogHeader className="px-6 pt-6 pb-4 pr-14 border-b">
                    <DialogTitle className="flex items-center justify-between gap-4">
                        <span className="text-2xl font-bold flex-1 pr-4">
                            {isLoading ? (
                                'Yükleniyor...'
                            ) : data ? (
                                data.urunDetay.urun_adi
                            ) : (
                                'Ürün Detayı'
                            )}
                        </span>
                        {!isLoading && data && (
                            <Link 
                                href={`/product-detail/${data.urunDetay.urun_seo}`}
                                className="text-sm font-normal px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
                                onClick={onClose}
                            >
                                {t('viewDetails')}
                            </Link>
                        )}
                    </DialogTitle>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex items-center justify-center p-20">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : data ? (
                    <>
                        {/* Scroll edilebilir içerik */}
                        <div className="overflow-y-auto flex-1 px-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            {/* Ürün Görseli */}
                            <div className="flex gap-3">
                                {/* Küçük Resimler - Sol Tarafta Dikey */}
                                {currentImages && currentImages.length > 1 && (
                                    <div className="flex flex-col gap-2 overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100" style={{ scrollbarWidth: 'thin' }}>
                                        {currentImages.map((img: any, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 rounded border-2 ${
                                                    currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                                                }`}
                                            >
                                                <Image
                                                    src={API_BASE_URL_RESIM + '/' + img.resim}
                                                    fill
                                                    style={{ objectFit: 'contain' }}
                                                    alt=""
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Büyük Resim */}
                                <div className="relative flex-1 h-96 bg-white rounded-lg overflow-hidden">
                                    <Image
                                        src={currentImage?.resim ? API_BASE_URL_RESIM + '/' + currentImage.resim : API_BASE_URL_RESIM + '/urun-gorsel.webp'}
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        alt={data.urunDetay.urun_adi}
                                    />
                                </div>
                            </div>

                            {/* Ürün Detayları */}
                            <div className="space-y-4">
                                <div className="text-sm text-gray-500">{formatStokKodu(data.urunDetay.stok_kodu)}</div>
                                
                                {/* Varyant Filtreleri */}
                                {Object.keys(varyantGroups).length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-sm">{t('filters')}</h3>
                                            {Object.entries(selectedFilters).some(([groupName, value]) => {
                                                const variants = varyantGroups[groupName];
                                                return variants && variants.length > 1 && value;
                                            }) && (
                                                <button 
                                                    onClick={resetAllFilters}
                                                    className="text-xs text-red-500 hover:text-red-700 underline"
                                                >
                                                    {t('clearFilters')}
                                                </button>
                                            )}
                                        </div>
                                        {Object.entries(varyantGroups).map(([groupName, variants]: [string, any]) => {
                                            const isSingleVariant = variants.length === 1;
                                            return (
                                            <div key={groupName}>
                                                <div className="font-semibold mb-2 text-sm flex items-center justify-between">
                                                    <span>{formatVariantGroupName(groupName)}:</span>
                                                    {selectedFilters[groupName] && !isSingleVariant && (
                                                        <button 
                                                            onClick={() => resetFilter(groupName)}
                                                            className="text-red-500 hover:text-red-700"
                                                            title="Filtreyi temizle"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {variants.map((variant: any) => {
                                                        const isAvailable = filteredCombinations.some((comb: any) => {
                                                            const groupId = data.varyantGruplari.find((g: any) => g.adi === groupName)?.id;
                                                            return comb.kombinasyon[groupId]?.adi === variant.adi;
                                                        });
                                                        const isSelected = selectedFilters[groupName] === variant.adi;
                                                        const isSingleVariant = variants.length === 1;

                                                        return (
                                                            <button
                                                                key={variant.id}
                                                                onClick={() => !isSingleVariant && handleFilterSelect(groupName, variant.adi)}
                                                                className={`px-3 py-1 rounded border text-sm ${
                                                                    isSelected
                                                                        ? 'bg-blue-500 text-white border-blue-500'
                                                                        : isAvailable && !isSingleVariant
                                                                        ? 'hover:bg-gray-100'
                                                                        : 'opacity-50 cursor-not-allowed'
                                                                }`}
                                                                disabled={isSingleVariant || !isAvailable}
                                                            >
                                                                {variant.adi}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Kombinasyon Listesi */}
                                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                                    {filteredCombinations.map((combination: any) => (
                                        <div 
                                            key={combination.id}
                                            className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                                                selectedCombination?.id === combination.id ? 'border-blue-500 bg-blue-50' : ''
                                            }`}
                                            onClick={() => {
                                                setSelectedCombination(combination);
                                                setMiktar(Math.floor(combination.miktar2));
                                            }}
                                        >
                                            <div className="text-sm font-medium">{combination.varyant_urun_adi}</div>
                                            <div className="text-xs text-gray-500 mt-1">{combination.stok_kodu}</div>
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                <span className="text-xs bg-green-100 px-2 py-1 rounded">
                                                    {t('stok')}: {formatNumber1(combination.stok)}
                                                </span>
                                                <span className="text-xs bg-orange-100 px-2 py-1 rounded">
                                                    {t('yoldaki')}: {formatNumber1(combination.yoldaki_miktar)}
                                                </span>
                                                <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                                                    {t('uretimde')}: {formatNumber1(combination.uretim_miktar)}
                                                </span>
                                                <span className="text-xs bg-red-100 px-2 py-1 rounded">
                                                    {t('koliIciAdeti')}: {formatNumber1(combination.miktar2)}
                                                </span>
                                            </div>
                                            {combination.fiyat > 0 && (
                                                <div className="font-bold text-red-600 mt-2">
                                                    {combination.indirimli_fiyat > 0 ? (
                                                        <>
                                                            <span className="line-through text-gray-400 text-sm mr-2">
                                                                €{combination.fiyat.toFixed(2)}
                                                            </span>
                                                            €{combination.indirimli_fiyat.toFixed(2)}
                                                        </>
                                                    ) : (
                                                        `€${combination.fiyat.toFixed(2)}`
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        </div>
                        {/* Scroll edilebilir içerik sonu */}

                        {/* Sabit Miktar ve Sepete Ekle Bölümü */}
                        <div className="bg-white border-t p-4 flex-shrink-0">
                            <div className="flex items-center gap-3 justify-end">
                                {/* Miktar Seçici */}
                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                    <button 
                                        onClick={() => {
                                            if (!selectedCombination) return;
                                            const koliAdeti = Math.floor(selectedCombination.miktar2) || 1;
                                            const currentMiktar = Math.floor(miktar);
                                            const newMiktar = Math.max(koliAdeti, currentMiktar - koliAdeti);
                                            setMiktar(newMiktar);
                                        }}
                                        disabled={!selectedCombination}
                                        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        -
                                    </button>
                                    <Input
                                        type="number"
                                        value={Math.floor(miktar)}
                                        onChange={(e) => setMiktar(Math.floor(Number(e.target.value)))}
                                        min={Math.floor(selectedCombination?.miktar2 || 1)}
                                        step={Math.floor(selectedCombination?.miktar2 || 1)}
                                        className="w-28 text-center border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        disabled={!selectedCombination}
                                    />
                                    <button 
                                        onClick={() => {
                                            if (!selectedCombination) return;
                                            const koliAdeti = Math.floor(selectedCombination.miktar2) || 1;
                                            const currentMiktar = Math.floor(miktar);
                                            const newMiktar = currentMiktar + koliAdeti;
                                            setMiktar(newMiktar);
                                        }}
                                        disabled={!selectedCombination}
                                        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        +
                                    </button>
                                </div>
                                
                                {/* Sepete Ekle Butonu */}
                                <button
                                    onClick={() => {
                                        if (!selectedCombination) {
                                            toast.error(t('selectAllVariants'));
                                            return;
                                        }
                                        handleAddToCart();
                                    }}
                                    className={`w-96 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 font-medium text-sm ${
                                        selectedCombination
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    {t('addToCart')}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-10">Ürün bulunamadı</div>
                )}
            </DialogContent>
        </Dialog>
    );
}
