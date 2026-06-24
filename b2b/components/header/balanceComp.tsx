'use client'
import { useState, useEffect, useRef } from "react";
import { TrendingDown, TrendingUp, Minus, Wallet } from "lucide-react";
import Cookies from 'js-cookie';
import { useTranslations } from "next-intl";
import { getCariBalance } from "@/services/kategoriSevices";

export default function BalanceComp() {
    const t = useTranslations('Header');
    const [bakiye, setBakiye] = useState<number | null>(null);
    const [bakiyeLoading, setBakiyeLoading] = useState(true);
    const isFetchingRef = useRef(false);

    useEffect(() => {
        const token = Cookies.get('accessToken');
        if (!token) {
            setBakiyeLoading(false);
            return;
        }
        
        // İlk önce cache'den hızlıca yükle
        // if (typeof window !== 'undefined' && window.localStorage) {
        //     const cachedData = localStorage.getItem('cari_bakiye_cache');
        //     if (cachedData) {
        //         try {
        //             const parsed = JSON.parse(cachedData);
        //             setBakiye(parsed.bakiye ?? null);
        //             setBakiyeLoading(false);
        //             console.log('Bakiye cache\'den hızlıca yüklendi');
        //         } catch (e) {
        //             console.error('Cache parse hatası:', e);
        //         }
        //     }
        // }
        
        // // Zaten bir istek yapılıyorsa tekrar yapma
        // if (isFetchingRef.current) {
        //     return;
        // }
        
        isFetchingRef.current = true;
        
        // Arka planda güncel veriyi çek
        getCariBalance()
            .then((data: any) => {
                setBakiye(data?.bakiye ?? null);
            })
            .catch(() => {
                // Cache zaten yüklendiyse bir şey yapma
                console.log('Bakiye çekilemedi, cache kullanılıyor');
            })
            .finally(() => {
                setBakiyeLoading(false);
                isFetchingRef.current = false;
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (bakiyeLoading) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-md w-full lg:w-auto border border-slate-200">
                <Wallet className="w-4 h-4 text-slate-400" />
                <div className="h-5 w-32 bg-slate-200 animate-pulse rounded" />
            </div>
        );
    }

    // bakiye null ise hiç gösterme (veri alınamadı)
    if (bakiye === null || bakiye === undefined) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-md border border-slate-200 whitespace-nowrap w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-slate-600" />
                <span className="text-xs text-slate-600">{t('guncelBakiye')}:</span>
            </div>
            <div className="flex items-center gap-1">
                {bakiye > 0 ? (
                    <>
                        <TrendingDown className="w-3 h-3 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">
                            +{bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </span>
                    </>
                ) : bakiye < 0 ? (
                    <>
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">
                            {bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </span>
                    </>
                ) : (
                    <>
                        <Minus className="w-3 h-3 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-500">
                            0,00 ₺
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
