"use client"
import BreadcrumbNav from "@/components/others/breadcrumbNav";
import { useTranslations, useLocale } from "next-intl";
import headerImages from "@/public/assets/kategori/10-3.png"
import Image from "next/image";
import { generatePageMetadata } from "@/components/others/metada";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState } from "react";
import { Grid2x2, List, Plus, Minus } from "lucide-react";
import Link from "next/link";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { API_BASE_URL_RESIM } from "@/services/api";
import { Button } from "../ui/button";
import UrunDetayPopup from "./urunDetayPopup";


interface SubSubCategory {
    kategori_adi: string;
    kategori_adi_en: string;
    kategori_adi_tr: string;
    kategori_seo: string;
}

interface SubCategory {
    kategori_adi: string;
    kategori_adi_en: string;
    kategori_adi_tr: string;
    kategori_seo: string;
    altKategoriler: SubSubCategory[];
}

interface Category {
    kategori_adi: string;
    kategori_adi_en: string;
    kategori_adi_tr: string;
    kategori_seo: string;
    altKategoriler: SubCategory[];
}

interface FilterGroups {
    [key: string]: { id: number; ad: string; }[];
}

interface ProductsCategoryCompProps {
    data: {
        anaKategori: Category[];
        breadcrumb: [{title:string,href:string}];
    };
    data2: {
        urunler: [
            {
                urun_adi: string;
                urun_seo: string;
                resim: string;  
                stok_kodu: string;
            }
        ];
        filtreler: FilterGroups;
    }
}

export default function ProductsCategoryComp(props: ProductsCategoryCompProps) {
    const t = useTranslations('Header');
    const locale = useLocale();
    const {data,data2} = props;
    const [urunler, setUrunler] = useState(data2.urunler);
    const [filtreler, setFiltreler] = useState(data2.filtreler);
    const [selectedFilters, setSelectedFilters] = useState<number[]>(() => {
        if (typeof window !== 'undefined') {
            const search = window.location.search;
            if (!search) return [];
            return search.replace('?f=', '')
                .split('+')
                .map(val => parseInt(val))
                .filter(val => !isNaN(val));
        }
        return [];
    });
    
    // Görünüm tercihi için state
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedUrunSeo, setSelectedUrunSeo] = useState<string>('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    
    const categories = data.anaKategori;
    
    // Get the current selected category from the last breadcrumb
    const selectedPath = data.breadcrumb?.length 
        ? data.breadcrumb[data.breadcrumb.length - 1].href.replace('/products/', '')
        : '';

    // Find the open category paths
    const findOpenCategories = () => {
        let openCategories: string[] = [];
        
        categories.forEach(category => {
            // Ana kategori kontrolü - URL yapısını dikkate alarak kontrol
            if (data.breadcrumb?.length && '/products/' + category.kategori_seo === data.breadcrumb[data.breadcrumb.length - 1].href) {
                openCategories.push(category.kategori_seo);
            }
            
            category.altKategoriler.forEach(subCategory => {
                if (subCategory.kategori_seo === selectedPath) {
                    openCategories.push(category.kategori_seo);
                }
                
                subCategory.altKategoriler?.forEach(subSubCategory => {
                    if (subSubCategory.kategori_seo === selectedPath) {
                        openCategories.push(category.kategori_seo, subCategory.kategori_seo);
                    }
                });
            });
        });
        
        return openCategories;
    };

    const openCategories = findOpenCategories();

    // Çerez işlemleri için yardımcı fonksiyonlar
    const setCookie = (name: string, value: string, days: number = 365) => {
        if (typeof window === 'undefined') return;
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    };

    const getCookie = (name: string): string | null => {
        if (typeof window === 'undefined') return null;
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };

    // Görünüm değiştirme fonksiyonu
    const handleViewChange = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        setCookie('productViewMode', mode);
    };

    const handleProductClick = (urunSeo: string) => {
        setSelectedUrunSeo(urunSeo);
        setIsPopupOpen(true);
    };

    const handleFilterChange = (id: number, checked: boolean) => {
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        
        // Filtre temizleme işlemi için özel kontrol
        if (id === 0) {
            window.location.href = currentPath;
            return;
        }
        
        if (checked) {
            // Eğer hiç filtre yoksa
            if (!currentSearch) {
                window.location.href = `${currentPath}?f=${id}`;
                return;
            }
            
            // Mevcut filtrelerin sonuna yeni filtreyi ekle
            window.location.href = `${currentPath}${currentSearch}+${id}`;
        } else {
            // Filtreyi kaldır
            const filters = currentSearch.replace('?f=', '').split('+');
            const newFilters = filters.filter(f => f !== id.toString());
            
            if (newFilters.length === 0) {
                window.location.href = currentPath;
            } else {
                window.location.href = `${currentPath}?f=${newFilters.join('+')}`;
            }
        }
    };

        // Stok kodunu formatlayan yardımcı fonksiyon
        const formatStokKodu = (kod: string) => {
            const parts = kod.split('-');
            if (parts.length >= 4) {
                return parts.slice(1, 4).join('-');
            }
            return kod;
        };

    const getCategoryName = (category: Category | SubCategory | SubSubCategory) => {
        switch(locale) {
            case 'en':
                return category.kategori_adi;
            case 'ru':
                return category.kategori_adi_en;
            default:
                return category.kategori_adi_tr;
        }
    };

      // URL'den mevcut sıralama değerini al
      const [currentSort, setCurrentSort] = useState<string>('');

    const handleSortChange = (value: string) => {
        const currentPath = window.location.pathname;
        const currentSearch = new URLSearchParams(window.location.search);
        
        if (value) {
            currentSearch.set("s", value);
        } else {
            currentSearch.delete("s");
        }

        window.location.href = `${currentPath}?${currentSearch.toString()}`;
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const search = new URLSearchParams(window.location.search);
            setCurrentSort(search.get("s") || '6');
            
            // Çerezden görünüm tercihini al
            const savedViewMode = getCookie('productViewMode') as 'grid' | 'list';
            if (savedViewMode) {
                setViewMode(savedViewMode);
            }
        }
    }, []);

    return (
        <>
            <div className="flex lg:flex-row flex-col gap-8">
                {/* Mobil görünüm */}
                <div className="lg:hidden w-full mb-4">
                    <Accordion type="single" collapsible>
                        <AccordionItem value="categories">
                            <AccordionTrigger className="font-bold">{t('products')}</AccordionTrigger>
                            <AccordionContent>
                                {categories.map((category: Category) => (
                                    <div key={category.kategori_seo} className="mb-4">
                                        <div className="font-bold mb-2">{getCategoryName(category)}</div>
                                        <div className="flex flex-col space-y-2 pl-4">
                                            {category.altKategoriler.map(subCategory => (
                                                <Link 
                                                    href={`/products/${subCategory.kategori_seo}`} 
                                                    key={subCategory.kategori_seo}
                                                    className={`hover:text-primary p-1 ${data.breadcrumb?.length && data.breadcrumb[data.breadcrumb.length - 1].href === '/products/'+subCategory.kategori_seo ? 'border p-1 rounded-md bg-gray-100' : ''}`}
                                                >
                                                    {getCategoryName(subCategory)}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="filters">
                            <AccordionTrigger className="font-bold">{t('filters')}</AccordionTrigger>
                            <AccordionContent>
                                {Object.entries(filtreler).map(([category, values]) => (
                                    <div key={category} className="mb-4">
                                        <div className="font-bold text-sm mb-2">{category.replace(/_/g, ' ')}</div>
                                        <div className="flex flex-col space-y-2 pl-4">
                                            {values.map((value) => (
                                                <div key={`${category}-${value.id}`} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`mobile-${category}-${value.id}`}
                                                        checked={selectedFilters.includes(value.id)}
                                                        onCheckedChange={(checked) => handleFilterChange(value.id, checked as boolean)}
                                                    />
                                                    <label htmlFor={`mobile-${category}-${value.id}`} className="text-sm">
                                                        {value.ad}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {/* Masaüstü görünüm */}
                <div className="hidden lg:block lg:w-[400px] w-full">
                    <Accordion type="multiple" className="border p-4 rounded-lg" defaultValue={openCategories}>
                        {categories.map((category: Category) => (
                            category.altKategoriler && category.altKategoriler.length > 0 ? (
                                <AccordionItem key={category.kategori_seo} value={category.kategori_seo} className="border-none">
                                    <div className={`flex items-center justify-between p-2 mb-2 bg-blue-50 rounded-lg ${
                                        data.breadcrumb?.length &&
                                        data.breadcrumb[data.breadcrumb.length - 1].href === '/products/'+category.kategori_seo
                                        ? 'border bg-blue-100'
                                        : ''
                                    }`}>
                                        <Link
                                            href={`/products/${category.kategori_seo}`}
                                            className="flex-1 text-sm text-gray-600 hover:text-primary"
                                        >
                                            {getCategoryName(category)}
                                        </Link>
                                        <AccordionTrigger className="p-1 rounded-full hover:bg-gray-200" />
                                    </div>
                                    <AccordionContent>
                                        <div className="flex flex-col space-y-2 pt-2">
                                            {category.altKategoriler.map((subCategory) => (
                                                subCategory.altKategoriler && subCategory.altKategoriler.length > 0 ? (
                                                    <Accordion
                                                        type="multiple"
                                                        key={subCategory.kategori_seo}
                                                        className="border-none"
                                                        defaultValue={openCategories}
                                                    >
                                                        <AccordionItem value={subCategory.kategori_seo} className="border-none">
                                                            <div className={`flex items-center justify-between p-2 pl-4 mb-2 bg-blue-50 rounded-lg ${
                                                                data.breadcrumb?.length &&
                                                                data.breadcrumb[data.breadcrumb.length - 1].href === '/products/'+subCategory.kategori_seo
                                                                ? 'border bg-blue-100'
                                                                : ''
                                                            }`}>
                                                                <Link
                                                                    href={`/products/${subCategory.kategori_seo}`}
                                                                    className="flex-1 text-sm text-black hover:text-primary"
                                                                >
                                                                    {getCategoryName(subCategory)}
                                                                </Link>
                                                                <AccordionTrigger className="p-1 rounded-full hover:bg-gray-200" />
                                                            </div>
                                                            <AccordionContent>
                                                                <div className="flex flex-col space-y-1 pl-4 pt-2">
                                                                    {subCategory.altKategoriler.map(subSubCategory => (
                                                                        <Link 
                                                                            href={`/products/${subSubCategory.kategori_seo}`} 
                                                                            key={subSubCategory.kategori_seo}
                                                                            className={`hover:text-primary p-0 pl-4 pt-2 text-sm ${
                                                                                data.breadcrumb?.length && 
                                                                                data.breadcrumb[data.breadcrumb.length - 1].href === '/products/'+subSubCategory.kategori_seo 
                                                                                ? 'border p-1 rounded-md bg-blue-50' 
                                                                                : ''
                                                                            }`}
                                                                        >
                                                                            {getCategoryName(subSubCategory)}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                ) : (
                                                    <Link 
                                                        href={`/products/${subCategory.kategori_seo}`}
                                                        key={subCategory.kategori_seo}
                                                        className={`hover:text-primary p-0 pl-4 text-sm text-black ${
                                                            data.breadcrumb?.length && 
                                                            data.breadcrumb[data.breadcrumb.length - 1].href === '/products/'+subCategory.kategori_seo 
                                                            ? 'border p-1 rounded-md bg-blue-50' 
                                                            : ''
                                                        }`}
                                                    >
                                                        {getCategoryName(subCategory)}
                                                    </Link>
                                                )
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ) : (
                                <div className="flex flex-col" key={category.kategori_seo}>
                                    <Link 
                                        href={`/products/${category.kategori_seo}`}
                                        className={`hover:text-primary p-2 text-sm text-gray-600 mb-2 rounded-lg bg-blue-50 ${
                                            data.breadcrumb?.length && 
                                            data.breadcrumb[data.breadcrumb.length - 1].href === '/products/'+category.kategori_seo 
                                            ? 'border rounded-md bg-blue-50' 
                                            : ''
                                        }`}
                                    >
                                        {getCategoryName(category)}
                                    </Link>
                                </div>
                            )
                        ))}
                    </Accordion>
                    <div className="mt-4 border p-4 rounded-lg">
                        <div className="font-bold text-red-600 text-lg mb-2">{t('filters')}</div>
                        <Accordion type="multiple" className="mt-4">
                            {Object.entries(filtreler).map(([category, values]) => (
                                <AccordionItem key={category} value={category}>
                                    <AccordionTrigger className="text-sm p-1 text-gray-600">
                                        {category.replace(/_/g, ' ')}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col space-y-2 pt-2">
                                            {values.map((value) => (
                                                <div key={`${category}-${value.id}`} className="flex items-center space-x-2 pl-4">
                                                    <Checkbox
                                                        id={`${category}-${value.id}`}
                                                        checked={selectedFilters.includes(value.id)}
                                                        onCheckedChange={(checked) => handleFilterChange(value.id, checked as boolean)}
                                                    />
                                                    <label htmlFor={`${category}-${value.id}`} className="text-sm">
                                                        {value.ad}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                        <Button className="mt-4 bg-red-600 text-white" onClick={() => handleFilterChange(0, false)}>{t('clearFilters')}</Button>
                    </div>
                </div>
                <div className="w-full">
                 {/*   <div className="flex justify-end mb-5">
                        <Select>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sıralama" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Sıralama</SelectLabel>
                                    <SelectItem value="apple">En son eklenenler</SelectItem>
                                    <SelectItem value="banana">En çok satılanlar</SelectItem>
                                    <SelectItem value="blueberry">En çok beğenilenler</SelectItem>
                                    <SelectItem value="grapes">En yeni eklenenler</SelectItem>
                                    <SelectItem value="pineapple">En yeni eklenenler</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div> */}

            <div className="flex flex-row justify-between items-center gap-2 text-gray-600 mb-4">
                    <div className="flex flex-row items-center gap-2">
                        <button 
                            onClick={() => handleViewChange('grid')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'grid' 
                                    ? 'bg-blue-100 text-blue-600' 
                                    : 'hover:bg-gray-100'
                            }`}
                        >
                            <Grid2x2 size={20} />
                        </button>
                        <button 
                            onClick={() => handleViewChange('list')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'list' 
                                    ? 'bg-blue-100 text-blue-600' 
                                    : 'hover:bg-gray-100'
                            }`}
                        >
                            <List size={20} />
                        </button>
                    </div>
               <div className="flex flex-row items-center gap-2 text-gray-600 mb-4">
                        <span className="text-sm">{t('sirala')}</span>
                       <div className="w-40"> 
                       <Select value={currentSort} onValueChange={handleSortChange}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('sirala')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">{t('alfabetikAZ')}</SelectItem>
                                <SelectItem value="2">{t('alfabetikZA')}</SelectItem>
                               {/*  <SelectItem value="3">En Düşük Fiyat</SelectItem>
                                <SelectItem value="4">En Yüksek Fiyat</SelectItem> */}
                                <SelectItem value="6">{t('rastgele')}</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                </div>

                </div>

                    {viewMode === 'grid' ? (
                        <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {urunler.sort((a, b) => {
                                    // Alfabetik sıralama (A-Z)
                                    if (currentSort === '1') {
                                        return a.urun_adi.localeCompare(b.urun_adi, 'tr');
                                    }
                                    // Alfabetik sıralama (Z-A)
                                    else if (currentSort === '2') {
                                        return b.urun_adi.localeCompare(a.urun_adi, 'tr');
                                    }
                                    // Fiyata göre sıralama
                                   /* else if (currentSort === '3') {
                                        // En düşük fiyat
                                        return Number(a.fiyat) - Number(b.fiyat);
                                    } else if (currentSort === '4') {
                                        // En yüksek fiyat
                                        return Number(b.fiyat) - Number(a.fiyat);
                                    } */
                                    return 0;
                                }).map((urun, index) => (
                                <div key={index} className="h-full">
                                    <div 
                                        onClick={() => handleProductClick(urun.urun_seo)}
                                        className='border hover:border-red-600 hover:shadow-lg rounded-lg flex flex-col h-full cursor-pointer'
                                    >
                                        <div className='w-full h-64 relative p-4'>
                                          
                                            <Image
                                                src={urun.resim == undefined ? API_BASE_URL_RESIM+'/urun-gorsel.webp' : API_BASE_URL_RESIM+'/'+urun.resim}
                                                alt={urun.urun_adi}
                                                fill
                                                style={{ objectFit: 'contain' }}
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </div>
                                        <div className='text-sm flex-1 flex flex-col'>
                                        <div className="p-1 px-2 mb-2 bg-red-50">{urun.stok_kodu}</div>
                                         <div className="p-2">{urun.urun_adi}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full grid grid-cols-1 gap-4">
                            {urunler.sort((a, b) => {
                                    // Alfabetik sıralama (A-Z)
                                    if (currentSort === '1') {
                                        return a.urun_adi.localeCompare(b.urun_adi, 'tr');
                                    }
                                    // Alfabetik sıralama (Z-A)
                                    else if (currentSort === '2') {
                                        return b.urun_adi.localeCompare(a.urun_adi, 'tr');
                                    }
                                    return 0;
                                }).map((urun, index) => (
                                <div key={index}>
                                    <div 
                                        onClick={() => handleProductClick(urun.urun_seo)}
                                        className='border hover:border-red-600 hover:shadow-lg rounded-lg flex flex-row h-32 cursor-pointer'
                                    >
                                        <div className='w-28 h-28 relative p-4 flex-shrink-0'>
                                            <Image
                                                src={urun.resim == undefined ? API_BASE_URL_RESIM+'/urun-gorsel.webp' : API_BASE_URL_RESIM+'/'+urun.resim}
                                                alt={urun.urun_adi}
                                                fill
                                                style={{ objectFit: 'contain' }}
                                                sizes="128px"
                                            />
                                        </div>
                                        <div className='flex-1 flex flex-col justify-center p-4'>
                                            <div className="inline-block px-2 py-1 mb-2 bg-red-50 text-xs w-fit">{urun.stok_kodu}</div>
                                            <div className="text-sm font-medium">{urun.urun_adi}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {isPopupOpen && (
                <UrunDetayPopup 
                    urunSeo={selectedUrunSeo}
                    isOpen={isPopupOpen}
                    onClose={() => setIsPopupOpen(false)}
                />
            )}        </>
    )
}