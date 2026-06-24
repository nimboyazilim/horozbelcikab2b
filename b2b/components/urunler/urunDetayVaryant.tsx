'use client'
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, ShoppingBag, PackagePlus, Truck, X } from 'lucide-react';
import { useCart } from '@/context/cartContext';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import UrunGaleri from '../kategoriler/urunGaleri';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';

export default function UrunDetayVaryant({data}: {data: any}) {
    const t = useTranslations('Header');
    const { addToCart, items } = useCart();
    const [musteriId, setMusteriId] = useState<string>('');
    const [currentImages, setCurrentImages] = useState(data.resimler);
    const [selectedFilters, setSelectedFilters] = useState<{[key: string]: string}>({});
    const [filteredCombinations, setFilteredCombinations] = useState(data.kombinasyonlar);
    const [selectedCombination, setSelectedCombination] = useState<any>(null);
    const [miktar, setMiktar] = useState<number>(1);
    const [inputValue, setInputValue] = useState<string>(miktar.toString());

    // Sayıları formatlamak için yardımcı fonksiyon
    const formatNumber = (number: any) => {
        // String ise number'a çevir, sonra tam sayı yap
        const numValue = typeof number === 'string' ? parseFloat(number) : Number(number);
        return Math.floor(numValue).toString();
    };

    const formatNumber1 = (number: any) => {
        // String ise number'a çevir, sonra tam sayı yap
        const numValue = typeof number === 'string' ? parseFloat(number) : Number(number);
        // Binlik ayırıcılarla formatla
        return numValue.toLocaleString('tr-TR', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
    };

    const formatVariantGroupName = (groupName: string) => {
        const normalized = groupName.replace(/_/g, ' ').trim();
        if (/^color\s+temparature$/i.test(normalized) || /^color\s+temperature$/i.test(normalized)) {
            return t('colorTemperature');
        }
        return normalized;
    };

    // Varyant gruplarını organize et
    const varyantGroups = data.varyantGruplari.reduce((acc: any, group: any) => {
        acc[group.adi] = group.altVaryantlar;
        return acc;
    }, {});

    // Tek varyant olan grupları otomatik seç
    useEffect(() => {
        const autoSelectSingleVariants = () => {
            const newFilters: {[key: string]: string} = {};
            
            // Her grup için kontrol et
            Object.entries(varyantGroups).forEach(([groupName, variants]: [string, any]) => {
                // Eğer grupta sadece 1 varyant varsa otomatik seç
                if (variants.length === 1) {
                    newFilters[groupName] = variants[0].adi;
                }
            });
            
            // Otomatik seçilen filtreleri uygula
            if (Object.keys(newFilters).length > 0) {
                setSelectedFilters(newFilters);
                
                // Filtrelenmiş kombinasyonları bul
                const filtered = data.kombinasyonlar.filter((combination: any) => {
                    return Object.entries(newFilters).every(([group, value]) => {
                        if (!value) return true;
                        const groupId = data.varyantGruplari.find((g: any) => g.adi === group)?.id;
                        if (!groupId) return true;
                        return combination.kombinasyon[groupId]?.adi === value;
                    });
                });
                
                setFilteredCombinations(filtered);
                
                // Eğer sadece bir kombinasyon kaldıysa onu seç
                if (filtered.length === 1) {
                    setSelectedCombination(filtered[0]);
                    setMiktar(filtered[0].miktar2);
                }
            }
        };
        
        autoSelectSingleVariants();
    }, [data.varyantGruplari, data.kombinasyonlar]);

    // Seçili kombinasyon değiştiğinde resimleri güncelle
    useEffect(() => {
        if (selectedCombination) {
            const filteredImages = data.resimler.filter((img: any) => 
                img.urun_id === data.urunDetay.id && 
                img.varyant_id === selectedCombination.id
            );
            
            setCurrentImages(filteredImages.length > 0 ? filteredImages : data.resimler);
        } else {
            setCurrentImages(data.resimler);
        }
    }, [selectedCombination, data.resimler, data.urunDetay.id]);

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
        setInputValue(Math.floor(miktar).toString());
    }, [miktar]);

    // JWT'den payload'ı decode eden yardımcı fonksiyon
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

    // Filtre seçildiğinde
    const handleFilterSelect = (groupName: string, value: string) => {
        const newFilters = { ...selectedFilters, [groupName]: value };
        setSelectedFilters(newFilters);
        
        // Seçilen filtrelere göre kombinasyonları filtrele
        const filtered = data.kombinasyonlar.filter((combination: any) => {
            return Object.entries(newFilters).every(([group, value]) => {
                if (!value) return true; // Eğer filtre değeri boşsa, bu filtreden geçer
                const groupId = data.varyantGruplari.find((g: any) => g.adi === group)?.id;
                if (!groupId) return true;
                return combination.kombinasyon[groupId]?.adi === value;
            });
        });

        setFilteredCombinations(filtered);
        
        // Eğer sadece bir kombinasyon kaldıysa onu seç
        if (filtered.length === 1) {
            setSelectedCombination(filtered[0]);
            setMiktar(Math.floor(filtered[0].miktar2)); // Koli adetini otomatik ayarla
        } else {
            setSelectedCombination(null);
        }
    };

    // Filtreyi sıfırla
    const resetFilter = (groupName: string) => {
        const { [groupName]: removed, ...newFilters } = selectedFilters;
        
        // Eğer kapatılan grup tek varyant içeriyorsa, otomatik olarak tekrar seç
        const closedGroup = data.varyantGruplari.find((g: any) => g.adi === groupName);
        if (closedGroup && closedGroup.altVaryantlar.length === 1) {
            newFilters[groupName] = closedGroup.altVaryantlar[0].adi;
        }
        
        setSelectedFilters(newFilters);
        
        // Kalan filtrelere göre yeniden filtrele
        const filtered = data.kombinasyonlar.filter((combination: any) => {
            return Object.entries(newFilters).every(([group, value]) => {
                if (!value) return true;
                const groupId = data.varyantGruplari.find((g: any) => g.adi === group)?.id;
                if (!groupId) return true;
                return combination.kombinasyon[groupId]?.adi === value;
            });
        });

        setFilteredCombinations(filtered);
        
        // Eğer sadece bir kombinasyon kaldıysa onu seç
        if (filtered.length === 1) {
            setSelectedCombination(filtered[0]);
            setMiktar(Math.floor(filtered[0].miktar2)); // Koli adetini otomatik ayarla
        } else {
            setSelectedCombination(null);
        }
    };

    // Tüm filtreleri sıfırla
    const resetAllFilters = () => {
        // Tek varyant olan grupları koru
        const preservedFilters: {[key: string]: string} = {};
        
        Object.entries(varyantGroups).forEach(([groupName, variants]: [string, any]) => {
            if (variants.length === 1) {
                preservedFilters[groupName] = variants[0].adi;
            }
        });
        
        setSelectedFilters(preservedFilters);
        
        // Korunan filtrelerle kombinasyonları filtrele
        const filtered = data.kombinasyonlar.filter((combination: any) => {
            return Object.entries(preservedFilters).every(([group, value]) => {
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

        // Koli adeti kontrolü
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
    };

      // Stok kodunu formatlayan yardımcı fonksiyon
      const formatStokKodu = (kod: string) => {
        const parts = kod.split('-');
        if (parts.length >= 4) {
            return parts.slice(1, 4).join('-');
        }
        return kod;
    };

    return (
        <>
            <div className="flex lg:flex-row flex-col lg:space-x-4">
                <div className="lg:w-1/2">
                    <UrunGaleri data={currentImages}/>
                </div>
                <div className="lg:w-1/2 lg:mt-0 mt-4">
                    <h1 className="text-2xl font-bold mb-3">{data.urunDetay.urun_adi}</h1>
                    <div className="text-sm text-gray-500 mb-3">{formatStokKodu(data.urunDetay.stok_kodu)}</div>
                    
                    <div className="my-5">
                        {/* Filtreler */}
                        <div className="mb-4">
                            {Object.entries(selectedFilters).some(([groupName, value]) => {
                                const variants = varyantGroups[groupName];
                                return variants && variants.length > 1 && value;
                            }) && (
                                <button 
                                    onClick={resetAllFilters}
                                    className="bg-red-500 text-white px-2 py-1 rounded mb-4 text-sm"
                                >
                                    {t('clearFilters')}
                                </button>
                            )}
                            
                            {Object.entries(varyantGroups).map(([groupName, variants]: [string, any]) => {
                                const isSingleVariant = variants.length === 1;
                                return (
                                <div key={groupName} className="mb-4">
                                    <div className="font-bold mb-2 flex items-center justify-between">
                                        <span>{formatVariantGroupName(groupName)}:</span>
                                        {selectedFilters[groupName] && !isSingleVariant && (
                                            <button 
                                                onClick={() => resetFilter(groupName)}
                                                className="text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {variants.map((variant: any) => {
                                            // Bu varyantın seçilebilir olup olmadığını kontrol et
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
                                                    className={`px-2 py-1 rounded border text-sm ${
                                                        isSelected
                                                            ? 'bg-blue-500 text-white'
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

                        {/* Tüm Kombinasyonlar Listesi */}
                        <div className="mb-4">
                           {/* <h2 className="font-bold mb-2">Tüm Kombinasyonlar:</h2> */}
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {filteredCombinations.map((combination: any) => (
                                    <div 
                                        key={combination.id}
                                        className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                                            selectedCombination?.id === combination.id ? 'border-blue-500' : ''
                                        }`}
                                        onClick={() => {
                                            setSelectedCombination(combination);
                                            setMiktar(Math.floor(combination.miktar2)); // Koli adetini otomatik ayarla
                                        }}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-gray-600 text-sm">{combination.stok_kodu} | {combination.varyant_urun_adi}</div>
                                               
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-black text-sm border bg-green-200 rounded-md px-2 py-1">
                                                        {t('stok')}: {formatNumber1(combination.stok)}
                                                    </span>
                                                   
                                                        <span className="text-black text-sm flex items-center border bg-orange-200 rounded-md px-2 py-1">
                                                        {t('yoldaki')}: {formatNumber1(combination.yoldaki_miktar)}
                                                        </span>

                                                        <span className="text-black text-sm flex items-center border bg-blue-200 rounded-md px-2 py-1">
                                                        {t('uretimde')}: {formatNumber1(combination.uretim_miktar)}
                                                        </span>

                                                        <span className="text-black text-sm flex items-center border bg-red-200 rounded-md px-2 py-1">
                                                        {t('koliIciAdeti')}: {formatNumber1(combination.miktar2)}
                                                        </span>
                                                 
                                                </div>
                                                <div className='flex flex-row gap-2 justify-between items-center mt-2'>
                                                <div className="text-sm mt-2">
                                                    {Object.entries(combination.kombinasyon).map(([grupId, varyant]: [string, any]) => (
                                                        <span key={grupId} className="mr-2">
                                                            {varyant.adi} |
                                                        </span>
                                                    ))}
                                                 </div>

                                                <div className="font-bold rounded-lg bg-red-400 px-2 text-white">
                                                    {combination.indirimli_fiyat > 0 ? (
                                                        <>
                                                            <span className="line-through text-gray-400 mr-2">
                                                                {combination.fiyat.toFixed(2).replace('.', ',')} $
                                                            </span>
                                                            <span className="text-red-500">
                                                                {combination.indirimli_fiyat.toFixed(2).replace('.', ',')} $
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span>{combination.fiyat.toFixed(2).replace('.', ',')} $</span>
                                                    )}
                                                </div>
                                               
                                            

                                                </div>
                                            </div>
                                           
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Miktar seçici */}
                        <div className='fixed bottom-0 left-0 right-0 bg-white border-t flex flex-row gap-2 items-center justify-end p-4 z-50'>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 border border-gray-200 rounded-lg w-48">
                                <button 
                                    onClick={() => {
                                        const koliAdeti = Number(selectedCombination?.miktar2) || 1;
                                        const currentMiktar = Number(miktar);
                                        const newMiktar = Math.max(koliAdeti, currentMiktar - koliAdeti);
                                        //console.log('AZALTMA:', { miktar: currentMiktar, koliAdeti, newMiktar });
                                        setMiktar(newMiktar);
                                    }}
                                    className="w-9 h-9 flex items-center justify-center bg-gray-100"
                                >
                                    -
                                </button>
                                <Input 
                                    type="number" 
                                    value={inputValue}
                                    onChange={(e) => {
                                        setInputValue(e.target.value); // Kullanıcı ne yazarsa onu göster
                                    }}
                                    onBlur={() => {
                                        const koliAdeti = Number(selectedCombination?.miktar2) || 1;
                                        const newValue = Math.max(1, Number(inputValue));
                                        // En yakın alt koliye yuvarla
                                        const flooredValue = Math.floor(newValue / koliAdeti) * koliAdeti;
                                        const finalValue = Math.max(koliAdeti, flooredValue);
                                        setMiktar(finalValue);
                                        setInputValue(Math.floor(finalValue).toString());
                                    }}
                                    min="1"
                                    className="w-28 text-center border-none focus:outline-none focus:ring-0 focus:border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                />
                                <button 
                                    onClick={() => {
                                        const koliAdeti = Number(selectedCombination?.miktar2) || 1;
                                        const currentMiktar = Number(miktar);
                                        const newMiktar = currentMiktar + koliAdeti;
                                       // console.log('ARTIRMA:', { miktar: currentMiktar, koliAdeti, newMiktar });
                                        setMiktar(newMiktar);
                                    }}
                                    className="w-9 h-9 flex items-center justify-center bg-gray-100"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Sepete ekle butonu */}
                        <button 
                            className={`w-96 py-2 px-4 rounded flex items-center justify-center ${
                                selectedCombination
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 cursor-not-allowed'
                            }`}
                            onClick={() => {
                                if (!selectedCombination) {
                                    toast.error(t('selectAllVariants'));
                                    return;
                                }
                                handleAddToCart();
                            }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('cartButon')}
                        </button>
                    </div>
                    </div>

                    <div dangerouslySetInnerHTML={{ __html: data.urunDetay.urun_information }} />
                </div>
            </div>
        </>
    );
}