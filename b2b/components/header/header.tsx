"use client"
import { ChevronDown, ChevronRight, Facebook, GlobeLock, Linkedin, Mail, Menu, MenuIcon, PackagePlus, PackageSearch, Phone, SearchIcon, X, BookOpenText, MapPinned, Store } from "lucide-react";
import Image from "next/image";
import Logo from "../../public/assets/horoz-europe.png"

import LangComp from "./langComp";
import { useTranslations, useLocale } from 'next-intl';
import Link from "next/link";
import SearchComp from "./searchComp";
import BalanceComp from "./balanceComp";
import { useState } from "react";
import { getKategori, clearBalanceCache } from "@/services/kategoriSevices";
import { useEffect } from "react";
import { API_BASE_URL_RESIM_KATEGORI } from "@/services/api";
import HeaderUserInfo from "../others/headerUserInfo";
import Cart from "../cart/cart";
import TopluUrunEkleme from "../cart/topluUrunEkleme";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";

// Add this interface near the top of the file, before the Header component
interface Category {
    id: number;
    kategori_adi: string;
    kategori_adi_en: string;
    kategori_adi_tr: string;
    kategori_seo: string;
    kategori_ikon?: string;
    altKategoriler?: Category[];
}


export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [currentView, setCurrentView] = useState<'main' | 'categories' | 'subcategories'>('main');
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [kategoriler, setKategoriler] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [activeSubCategory, setActiveSubCategory] = useState<number | null>(null);
    const [username, setUsername] = useState<string>('');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [cariEkstreYetki, setCariEkstreYetki] = useState<boolean>(false);
    const locale = useLocale();
    const router = useRouter();

    // JWT decode helper
    function decodeJWT(token: string) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            payload.adsoyad = decodeURIComponent(escape(payload.adsoyad));
            return payload;
        } catch (e) {
            return null;
        }
    }

    // Check login status
    useEffect(() => {
        const accessToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('accessToken='))
            ?.split('=')[1];

        if (accessToken) {
            const decodedToken = decodeJWT(accessToken);
            if (decodedToken) {
                setUsername(decodedToken.adsoyad);
                setIsLoggedIn(true);
                setCariEkstreYetki(Number(decodedToken.cari_ekstre_yetki) === 1);
            }
        }
    }, []);

    const handleLogout = () => {
        document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        Cookies.remove('cartId');
        clearBalanceCache(); // Bakiye cache'ini temizle
        setMenuOpen(false);
        router.push('/login');
    };

    useEffect(() => {
        const fetchKategoriler = async () => {
            const kategoriler = await getKategori();
            setKategoriler(kategoriler);
        };
        fetchKategoriler();
    }, []);

    const t = useTranslations('Header');

    const handleCategoryClick = (kategori: any) => {
        if (!kategori.altKategoriler?.length) {
            setMenuOpen(false);
            window.location.href = `/products/${kategori.kategori_seo}`;
            return;
        }
        setSelectedCategory(kategori);
        setCurrentView('subcategories');
    };

    const handleBackClick = () => {
        if (currentView === 'subcategories') {
            setCurrentView('categories');
            setSelectedCategory(null);
        } else if (currentView === 'categories') {
            setCurrentView('main');
        }
    };

    const getCategoryName = (category: any) => {
        switch(locale) {
            case 'en':
                return category.kategori_adi;
            case 'ru':
                return category.kategori_adi_en;
            default:
                return category.kategori_adi_tr;
        }
    };

    const renderMobileMenu = () => {
        if (currentView === 'subcategories' && selectedCategory) {
            return (
                <div className="flex flex-col h-full">
                    <div className="flex items-center space-x-2 mb-4 p-2 border-b">
                        <ChevronDown
                            className="w-6 h-6 transform rotate-90 cursor-pointer"
                            onClick={handleBackClick}
                        />
                        <span className="font-medium">{selectedCategory.kategori_adi}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-4">
                        {selectedCategory.altKategoriler?.map((altKategori: any) => (
                            <Link
                                key={altKategori.id}
                                href={`/products/${altKategori.kategori_seo}`}
                                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50"
                                onClick={() => setMenuOpen(false)}
                            >
                                {altKategori.kategori_ikon && (
                                    <div className="mb-2">
                                        <Image
                                            src={`${API_BASE_URL_RESIM_KATEGORI}/${altKategori.kategori_ikon}`}
                                            width={40}
                                            height={40}
                                            alt={altKategori.kategori_adi}
                                        />
                                    </div>
                                )}
                                <span className="text-center text-sm">
                                    {altKategori.kategori_adi.charAt(0).toUpperCase() +
                                        altKategori.kategori_adi.slice(1).toLowerCase()}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            );
        }

        if (currentView === 'categories') {
            return (
                <div className="flex flex-col h-full">
                    <div className="flex items-center space-x-2 mb-4 p-2 border-b">
                        <ChevronDown
                            className="w-6 h-6 transform rotate-90 cursor-pointer"
                            onClick={handleBackClick}
                        />
                        <span className="font-medium">{t('products')}</span>
                    </div>
                    <div className="space-y-2">
                        {kategoriler.map((kategori: any, index: number) => (
                            <div
                                key={kategori.id}
                                onClick={() => handleCategoryClick(kategori)}
                                className={`flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                            >
                                <span>{getCategoryName(kategori)}</span>
                                {kategori.altKategoriler?.length > 0 && (
                                    <ChevronDown className="w-4 h-4 transform -rotate-90" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col space-y-4">
                {/* User Profile Section for Mobile */}
                <div className="border-b pb-4 mb-2">
                    {isLoggedIn ? (
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
                                    {username ? username.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 1) : 'U'}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{username}</div>
                                </div>
                            </div>
                            <Link href="/profil" onClick={() => setMenuOpen(false)} className="hover:text-gray-600 py-2 px-2 text-sm">{t('profil')}</Link>
                            {cariEkstreYetki && <Link href="/account-statement" onClick={() => setMenuOpen(false)} className="hover:text-gray-600 py-2 px-2 text-sm">{t('cariEkstre')}</Link>}
                            <button onClick={handleLogout} className="text-left text-red-500 hover:text-red-600 py-2 px-2 text-sm">{t('oturumKapat')}</button>
                        </div>
                    ) : (
                        <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center space-x-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600">
                            <span>{t('girisYap')}</span>
                        </Link>
                    )}
                </div>

                <div
                    onClick={() => setCurrentView('categories')}
                    className="hover:text-gray-600 py-2 flex items-center justify-between cursor-pointer"
                >
                    <span>{t('products')}</span>
                    <ChevronDown className="w-4 h-4 transform -rotate-90" />
                </div>
                <Link href="/new-products" onClick={() => setMenuOpen(false)} className="hover:text-gray-600 py-2">{t('newproducts')}</Link>
                <Link href="/outlet-products" onClick={() => setMenuOpen(false)} className="hover:text-gray-600 py-2">{t('outletproducts')}</Link>
                <Link href="/orders" onClick={() => setMenuOpen(false)} className="hover:text-gray-600 py-2">{t('orders')}</Link>
                {/* <Link href="/corporate" onClick={() => setMenuOpen(false)} className="hover:text-gray-600 py-2">{t('corporate')}</Link>*/}
                <Link href="/catalog" onClick={() => setMenuOpen(false)} className="hover:text-gray-600 py-2">{t('catalog')}</Link>
                {/* <Link href="/news" onClick={() => setMenuOpen(false)} className="hover:text-gray-600 py-2">{t('news')}</Link> */}
                <Link href="/contact" onClick={() => setMenuOpen(false)} className="hover:text-gray-600 py-2">{t('contact')}</Link>
            </div>
        );
    };

    return (
        <>

               <div className="w-full bg-white text-black border-b">
                    <div className="max-w-screen-xl mx-auto flex flex-row justify-between items-center px-4 py-2 text-sm">
                        <div className="flex lg:flex-row flex-col lg:space-x-4 space-y-2 lg:space-y-0">
                            <div className="flex flex-row space-x-2 items-center">
                                <Phone className="w-4 h-4" />
                                <a href="tel:+902126014760" className="hover:underline">+90 212 601 47 60-88 (Pbx)</a>
                            </div>
                            <div className="flex flex-row space-x-2 items-center">
                                <Mail className="w-4 h-4" />
                                <a href="mailto:info@horozeurope.com" className="hover:underline">info@horozeurope.com</a>
                            </div>
                        </div>

                        <div className="flex flex-row items-center lg:pr-0 pr-4 space-x-2">
                            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full bg-gray-100 text-black p-1 hover:text-red-600 transition"><Facebook className="w-4 h-4" /></a>
                            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="rounded-full bg-gray-100 text-black p-1 hover:text-red-600 transition"><Linkedin className="w-4 h-4" /></a>
                            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" className="rounded-full bg-gray-100 text-black p-1 hover:text-red-600 transition">
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>


            <header className="w-full h-auto bg-white shadow sticky top-0 z-50">
                

                <div className="max-w-screen-xl mx-auto lg:flex hidden flex-row justify-between items-center px-4 py-4">
                    <div className="lg:flex flex-row hidden space-x-6 items-center">
                        <div className="w-[230px] h-[65px]">
                            <Link href="/"><Image src={Logo} width={230} height={65} quality={100} alt="Horoz Europe Logo" priority /></Link>
                        </div>

                       
                    </div>
                    <div className="flex items-center gap-3">
                        <SearchComp />
                        <BalanceComp />
                    </div>
                    <div className="lg:flex hidden flex-row space-x-8 items-center">
                        
                        
                        <Cart />
                        <HeaderUserInfo />
                        <LangComp />

                    </div>
                </div>


                <nav className="p-2 border-t lg:block hidden">
                    <div className="max-w-screen-xl mx-auto px-4">
                    <ul className="flex flex-row space-x-12 items-center ">
                                <li className="relative group">
                                    <div className="hover:text-gray-600 flex flex-row items-center space-x-2 p-1 cursor-pointer">
                                    <a href="/products" className="text-white flex flex-row items-center space-x-2 px-6 py-2 rounded-lg bg-red-600">                 
                                    <span>{t('products')}</span>
                                    <ChevronDown className="w-4 h-4" />
                                    </a>
                                    </div>
                                    <div className="hidden group-hover:block absolute left-0 right-0 top-full -ml-[20px] w-[1024px] shadow-xl z-40"
                                         onMouseLeave={() => {
                                             setActiveCategory(null);
                                             setActiveSubCategory(null);
                                         }}>
                                        <div className="px-4 max-w-screen-2xl mx-auto mt-[17px] border bg-white shadow rounded">
                                            <div className="flex">
                                                {/* Ana kategori listesi */}
                                                <ul className="w-80 relative bg-white">
                                                    {kategoriler && kategoriler.map((kategori: any, index: number) => (
                                                        <li key={kategori.id} 
                                                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} relative`}
                                                            onMouseEnter={() => {
                                                                if (kategori.altKategoriler?.length) {
                                                                    setActiveCategory(kategori.id);
                                                                    setActiveSubCategory(null);
                                                                }
                                                            }}
                                                            onMouseLeave={() => {
                                                                // Alt kategori varsa mouse leave'de kapatma
                                                                if (!kategori.altKategoriler?.length) {
                                                                    setActiveCategory(null);
                                                                    setActiveSubCategory(null);
                                                                }
                                                            }}
                                                        >
                                                            <a href={`/products/${kategori.kategori_seo}`} className="block">
                                                                <div className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100
                                                                    ${activeCategory === kategori.id ? 'bg-red-50 text-red-600' : ''}`}>
                                                                    <div className="flex items-center gap-2">
                                                                        <Image 
                                                                            src={kategori.kategori_ikon ? 
                                                                                `${API_BASE_URL_RESIM_KATEGORI}${kategori.kategori_ikon}` : 
                                                                                `${API_BASE_URL_RESIM_KATEGORI}category.svg`} 
                                                                            alt={getCategoryName(kategori)} 
                                                                            width={20} 
                                                                            height={20} 
                                                                        />
                                                                        <span className="text-sm">{getCategoryName(kategori)}</span>
                                                                    </div>
                                                                    {kategori.altKategoriler?.length > 0 && (
                                                                        <ChevronRight className="w-4 h-4 ml-2" />
                                                                    )}
                                                                </div>
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>

                                                {/* İkinci seviye kategoriler */}
                                                {activeCategory !== null && (
                                                    <ul className="w-80 border-l bg-white">
                                                        {kategoriler.find((k: any) => k.id === activeCategory)?.altKategoriler?.map((altKategori: any, altIndex: number) => (
                                                            <li key={altKategori.id}
                                                                className={`${altIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                                                onMouseEnter={() => {
                                                                    if (altKategori.altKategoriler?.length) {
                                                                        setActiveSubCategory(altKategori.id);
                                                                    }
                                                                }}
                                                                onMouseLeave={() => {
                                                                    // Alt kategori varsa mouse leave'de kapatma
                                                                    if (!altKategori.altKategoriler?.length) {
                                                                        setActiveSubCategory(null);
                                                                    }
                                                                }}
                                                            >
                                                                <a href={`/products/${altKategori.kategori_seo}`} className="block">
                                                                    <div className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100
                                                                        ${activeSubCategory === altKategori.id ? 'bg-red-50 text-red-600' : ''}`}>
                                                                        <div className="flex items-center gap-2">
                                                                            <Image 
                                                                                src={altKategori.kategori_ikon ? 
                                                                                    `${API_BASE_URL_RESIM_KATEGORI}${altKategori.kategori_ikon}` : 
                                                                                    `${API_BASE_URL_RESIM_KATEGORI}category.svg`} 
                                                                                alt={getCategoryName(altKategori)} 
                                                                                width={20} 
                                                                                height={20} 
                                                                            />
                                                                            <span className="text-sm">{getCategoryName(altKategori)}</span>
                                                                        </div>
                                                                        {altKategori.altKategoriler?.length > 0 && (
                                                                            <ChevronRight className="w-4 h-4 ml-2" />
                                                                        )}
                                                                    </div>
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}

                                                {/* Üçüncü seviye kategoriler */}
                                                {activeSubCategory !== null && (
                                                    <ul className="w-80 border-l bg-white">
                                                        {kategoriler
                                                            .find((k: any) => k.id === activeCategory)
                                                            ?.altKategoriler
                                                            ?.find((ak: any) => ak.id === activeSubCategory)
                                                            ?.altKategoriler
                                                            ?.map((subAltKategori: any, subIndex: number) => (
                                                                <li key={subAltKategori.id}
                                                                    className={`${subIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                                                >
                                                                    <a href={`/products/${subAltKategori.kategori_seo}`} className="block">
                                                                        <div className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                                                                            <div className="flex items-center gap-2">
                                                                                <Image 
                                                                                    src={subAltKategori.kategori_ikon ? 
                                                                                        `${API_BASE_URL_RESIM_KATEGORI}${subAltKategori.kategori_ikon}` : 
                                                                                        `${API_BASE_URL_RESIM_KATEGORI}category.svg`} 
                                                                                    alt={getCategoryName(subAltKategori)} 
                                                                                    width={20} 
                                                                                    height={20} 
                                                                                />
                                                                                <span className="text-sm">{getCategoryName(subAltKategori)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </a>
                                                                </li>
                                                            ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>

                                <li><Link href="/new-products" className="hover:text-gray-600">
                                    <div className="flex flex-row items-center space-x-2">
                                        <PackagePlus className="w-6 h-6" />
                                        <span>{t('newproducts')}</span>
                                    </div>
                                </Link></li>
                                <li><Link href="/outlet-products" className="hover:text-gray-600">
                                    <div className="flex flex-row items-center space-x-2">
                                        <PackageSearch className="w-6 h-6" />
                                        <span>{t('outletproducts')}</span>
                                    </div>
                                </Link></li>
                                
                                <li><Link href="/orders" className="hover:text-gray-600">
                                    <div className="flex flex-row items-center space-x-2">
                                        <Store className="w-6 h-6" />
                                        <span>{t('orders')}</span>
                                    </div>
                                </Link></li>
                                {/* <li><Link href="/corporate" className="hover:text-gray-600">{t('corporate')}</Link></li> */}
                                <li><Link href="/catalog" className="hover:text-gray-600">
                                    <div className="flex flex-row items-center space-x-2">
                                        <BookOpenText className="w-6 h-6" />
                                        <span>{t('catalog')}</span>
                                    </div>
                                </Link></li>
                                {/* <li><Link href="/news" className="hover:text-gray-600">{t('news')}</Link></li> */}
                                {/* <li><Link href="/terms-of-use" className="hover:text-gray-600">{t('termsOfUse')}</Link></li> */}
                                <li><Link href="/contact" className="hover:text-gray-600">
                                    <div className="flex flex-row items-center space-x-2">
                                        <MapPinned className="w-6 h-6" />
                                        <span>{t('contact')}</span>
                                    </div>
                                </Link></li>
                                <li><TopluUrunEkleme /></li>
                            </ul>
                            </div>
                        </nav>
                    

                {/* Mobile Header */}
                <div className="lg:hidden w-full flex flex-row px-4 items-center justify-between py-2">
                    <div className="w-[220px] h-[62px] mb-2">
                        <Link href="/"><Image src={Logo} width={220} height={62} quality={100} alt="Horoz Europe Logo" priority /></Link>
                    </div>
                    <div className="flex flex-row items-center space-x-4">
                        <Cart />
                        <MenuIcon onClick={() => setMenuOpen(true)} className="w-8 h-8 -mt-2" />
                    </div>
                </div>

                {menuOpen && (
                    <div className="lg:hidden w-full p-4 flex flex-col px-4 fixed top-0 left-0 bottom-0 bg-white z-50 overflow-y-auto">
                        <div className="flex flex-row justify-between items-center mb-4">
                            <div className="w-[220px] h-[62px]">
                                <Link href="/" onClick={() => setMenuOpen(false)}>
                                    <Image src={Logo} width={220} height={62} quality={100} alt="Horoz Europe Logo" priority />
                                </Link>
                            </div>
                            <div>
                                <X onClick={() => setMenuOpen(false)} className="w-8 h-8" />
                            </div>
                        </div>
                        <SearchComp />
                        <div className="mt-3">
                            <BalanceComp />
                        </div>
                        <div className="mt-4 flex-1">
                            {renderMobileMenu()}
                        </div>
                        <div className="mt-4"><LangComp /></div>
                       {/* <div className="flex mt-4 flex-row justify-center items-center space-x-2 border p-1 px-2 rounded-md">
                            <GlobeLock /> <span>B2B</span>
                        </div>*/}
                    </div>
                )}



            </header>
        </>
    )
} 