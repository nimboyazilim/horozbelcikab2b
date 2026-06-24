'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

interface PopupData {
    id: number;
    title_tr: string;
    title_en: string;
    title_ru: string;
    title_ro: string;
    description_tr: string;
    description_en: string;
    description_ru: string;
    description_ro: string;
    image: string;
    link: string | null;
    is_active: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_POPUP_URL = process.env.NEXT_PUBLIC_API_URL_POPUP || `${API_BASE_URL}/uploads/popup`;

// Cookie helper functions
const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

export default function PopupModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [popupData, setPopupData] = useState<PopupData | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const locale = useLocale();
    const pathname = usePathname();

    // Login kontrolü
    useEffect(() => {
        const token = Cookies.get('accessToken');
        const loggedIn = !!token;
        setIsLoggedIn(loggedIn);
    }, [pathname]);

    useEffect(() => {
        
        // Sadece login olduysa popup göster
        if (!isLoggedIn) {
            console.log('PopupModal - Kullanıcı login olmamış, popup gösterilmeyecek');
            return;
        }

        // Cookie'den popup'ın daha önce gösterilip gösterilmediğini kontrol et
        const popupShown = getCookie('popupShown');
        
        if (!popupShown) {
            // Biraz gecikme ekleyelim ki sayfa yüklenmesini tamamlasın
            setTimeout(() => {
                fetchPopup();
            }, 1000);
        } else {
            console.log('PopupModal - Cookie var, popup gösterilmeyecek');
        }
    }, [isLoggedIn]);

    const fetchPopup = async () => {
        try {
            const url = `${API_BASE_URL}/popup/web/active`;
            
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Popup data:', data);
                
                if (data && data.is_active) {
                    setPopupData(data);
                    setIsOpen(true);
                } else {
                    console.log('Popup aktif değil veya veri yok');
                }
            } else {
                console.error('Response error:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Popup yüklenirken hata:', error);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        // Popup kapatıldığında cookie'ye kaydet (1 gün geçerli)
        setCookie('popupShown', 'true', 1);
    };

    const handleImageClick = () => {
        if (popupData?.link) {
            window.open(popupData.link, '_blank');
            handleClose();
        }
    };

    if (!isOpen || !popupData) return null;

    const getTitle = () => {
        switch (locale) {
            case 'en':
                return popupData.title_en || popupData.title_tr;
            case 'ru':
                return popupData.title_ru || popupData.title_tr;
            case 'ro':
                return popupData.title_ro || popupData.title_tr;
            default:
                return popupData.title_tr;
        }
    };

    const getDescription = () => {
        switch (locale) {
            case 'en':
                return popupData.description_en || popupData.description_tr;
            case 'ru':
                return popupData.description_ru || popupData.description_tr;
            case 'ro':
                return popupData.description_ro || popupData.description_tr;
            default:
                return popupData.description_tr;
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-[9998] animate-in fade-in duration-200"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                        aria-label="Kapat"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Content */}
                    <div className="flex flex-col">
                        {/* Image */}
                        <div
                            className={`relative w-full aspect-[4/3] mt-10 ${popupData.link ? 'cursor-pointer' : ''}`}
                            onClick={handleImageClick}
                        >
                            <Image
                                src={`${API_POPUP_URL}/${popupData.image}`}
                                alt={getTitle()}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        {/* Text Content */}
                        {(getTitle() || getDescription()) && (
                            <div className="p-6 space-y-3">
                                {getTitle() && (
                                    <h2 className="text-2xl font-bold text-[#d61d25] text-center">
                                        {getTitle()}
                                    </h2>
                                )}
                                {getDescription() && (
                                    <p className="text-gray-700 text-center text-sm md:text-base">
                                        {getDescription()}
                                    </p>
                                )}
                                {popupData.link && (
                                    <div className="flex justify-center pt-2">
                                        <button
                                            onClick={handleImageClick}
                                            className="bg-[#d61d25] hover:bg-[#b01820] text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Daha Fazla Bilgi
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
