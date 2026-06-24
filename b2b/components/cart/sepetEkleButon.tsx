'use client'
import { useCart } from '@/context/cartContext';
import Cookies from 'js-cookie';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "react-hot-toast";

export default function SepetEkleButton({ data }: { data: any }) {
    const { items, addToCart } = useCart();
    const t = useTranslations('Header');
    const [musteriId, setMusteriId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1); // Adet state'i

    // JWT'den musteri_id'yi çeken fonksiyon
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

    // JWT'den payload'ı decode eden yardımcı fonksiyon
    function decodeJWT(token: string) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Türkçe karakterler için decode işlemi
            payload.adsoyad = decodeURIComponent(escape(payload.adsoyad));
            payload.eposta = decodeURIComponent(escape(payload.eposta));
            return payload;
        } catch (e) {
            return null;
        }
    }

    const handleAddToCart = () => {
        if (quantity === 0 || quantity === null || quantity === undefined) {
            toast.error("Lütfen adet giriniz.", {
                duration: 2000,
                position: "top-center",
                style: {
                    background: "#333",
                    color: "#fff",
                },
            });
            return;
        }

        let cartId = '';

        if (items.length > 0) {
            cartId = Cookies.get('cartId') || '';
        } else {
            cartId = uuidv4();
            Cookies.set('cartId', cartId);
        }

        addToCart({
            id: data.id,
            varyant_id: "0",
            urun_id: data.id,
            miktar: quantity,
            cartId: cartId,
            musteri_id: musteriId,
            urun_adi: data.urun_adi,
            stok_kodu: data.stok_kodu,
            varyantAdi: "",
            varyant_urun_adi: "",
            miktar2: 0,
            resim: '',
            fiyat: data.fiyat,
            urun_seo: data.urun_seo,
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

    const handleQuantityChange = (value: number) => {
        if (value >= 1) {
            setQuantity(value);
        }
    };

    return (
        <>
            {data && data.tip === 'standart' && (
                <div className="my-5 flex items-center space-x-4">
                    <div className="flex items-center border rounded overflow-hidden shadow-sm">
                        <button
                            className="px-2 py-2 hover:bg-gray-200 transition-colors"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={data.miktar <= 0}
                        >
                            -
                        </button>
                        <input
                            type="number"
                            value={quantity === 0 ? "" : quantity}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                    setQuantity(0);
                                } else {
                                    const parsedValue = parseInt(value, 10);
                                    if (!isNaN(parsedValue) && parsedValue >= 0) {
                                        setQuantity(parsedValue);
                                    }
                                }
                            }}
                            className="w-16 text-center border-none outline-none focus:ring-2 focus:ring-blue-500"
                            min={1}
                        />
                        <button
                            className="px-2 py-2 hover:bg-gray-200 transition-colors"
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={data.miktar <= 0}
                        >
                            +
                        </button>
                    </div>
                    <button
                        className={`w-72 px-6 py-2 rounded-lg flex items-center justify-center shadow-md transition-transform transform ${data.miktar > 0
                            ? "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
                            : "bg-gray-400 text-gray-700 cursor-not-allowed"
                            }`}
                        onClick={handleAddToCart}
                        disabled={data.miktar <= 0}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        {t('cartButon')}
                    </button>
                </div>
            )}
        </>
    );
}