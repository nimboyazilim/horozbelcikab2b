"use client"
import { createContext, useContext, useState, ReactNode } from 'react';
import SepetServices from '@/services/sepetServices';
//import { useToast } from "@/hooks/use-toast"
import { toast } from "react-hot-toast";
interface CartItem {
    id: string;
    cartId: string;
    musteri_id: string;
    urun_adi: string;
    stok_kodu: string;
    varyantAdi: string;
    varyant_urun_adi: string;
    resim: string;
    urun_id: string;
    varyant_id: string;
    miktar: number;
    miktar2: number;
    fiyat: number;
    urun_seo: string;
    vergi_id: number;
    kdv_fiyat: number;
    ara_toplam: number;
    birim_fiyat: number;
    genel_toplam: number;
    iskonto_tutari: number;
    iskonto_orani: number;
    indirimli_fiyat: number;
}

interface CartContextType {
    items: CartItem[];
    totalItems: number;
    araToplam: number;
    iskontoToplam: number;
    iskontoOrani: number;
    totalKdv: number;
    genel_toplam: number;
    addToCart: (item: CartItem) => Promise<void>;
    removeFromCart: (urun_id: string, varyant_id: string) => Promise<void>;
    loadCart: (musteri_id: string) => Promise<void>;
    updateQuantity: (urun_id: string, varyant_id: string, quantity: number, miktar2: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    //const { toast } = useToast();
    const [items, setItems] = useState<CartItem[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [araToplam, setAraToplam] = useState(0);
    const [totalKdv, setTotalKdv] = useState(0);
    const [genel_toplam, setGenel_toplam] = useState(0);
    const [iskontoToplam, setIskontoToplam] = useState(0);
    const [iskontoOrani, setIskontoOrani] = useState(0);

    const updateCartTotals = (newItems: CartItem[]) => {
        setTotalItems(newItems
            .filter(item => item.vergi_id === 0)
            .reduce((sum, item) => sum + item.miktar, 0));
        setAraToplam(newItems.reduce((sum, item) => sum + (item.ara_toplam), 0));
        setTotalKdv(newItems.reduce((sum, item) => sum + (item.kdv_fiyat), 0));
        setGenel_toplam(newItems.reduce((sum, item) => sum + (item.genel_toplam), 0));
        setIskontoToplam(newItems.reduce((sum, item) => sum + (item.iskonto_tutari), 0));
        setIskontoOrani(newItems.reduce((sum, item) => (item.iskonto_orani), 0));
    };

    const loadCart = async (musteri_id: string) => {
        try {
            const response = await SepetServices.getSepet(musteri_id);
            if (response.status === 'success') {
                setItems(response.sepet);
                updateCartTotals(response.sepet);
            }
        } catch (error) {
            toast.error('Sepet yükleme hatası');
            console.error('Sepet yükleme hatası:', error);
        }
    };

    const addToCart = async (item: CartItem) => {
        try {
            const response = await SepetServices.createSepet(item);
            if (response.status === 'success') {
                const newItems = [...items, item];
                loadCart(item.musteri_id);
                updateCartTotals(newItems);
                toast.success('Sepete Eklendi');

            }
        } catch (error) {
            toast.error('Sepete ekleme hatası');
            console.error('Sepete ekleme hatası:', error);
        }
    };

    const updateQuantity = async (urun_id: string, varyant_id: string, quantity: number, miktar2: number) => {

        if(quantity % miktar2 !== 0) {
            toast.error('Miktar, koli adeti olan '+miktar2+'nin katları olmalıdır');
            return;
        }


        try {
            const response = await SepetServices.updateSepet(urun_id, varyant_id, quantity);
            if (response.status === 'success') {
                const newItems = items.map(item => 
                    item.urun_id === urun_id && item.varyant_id === varyant_id ? { ...item, miktar: quantity } : item
                );
                loadCart(items[0].musteri_id);
                updateCartTotals(newItems);
                toast.success('Sepet miktarı güncellendi');
            }
        } catch (error) {
            console.error('Sepet miktarı güncelleme hatası:', error);
        }
    };

    const removeFromCart = async (urun_id: string, varyant_id: string) => {
        try {
            const response = await SepetServices.deleteSepetItem(urun_id, varyant_id);
            if (response.status === 'success') {
                const newItems = items.filter(item => item.urun_id !== urun_id && item.varyant_id !== varyant_id);
                loadCart(items[0].musteri_id);
                updateCartTotals(newItems);
                toast.success('Sepetten silindi');
            }
        } catch (error) {
            console.error('Sepetten silme hatası:', error);
        }
    };

 

    return (
        <CartContext.Provider value={{
            items,
            totalItems,
            araToplam,
            iskontoToplam,
            iskontoOrani,
            totalKdv,
            genel_toplam,
            addToCart,
            removeFromCart,
            loadCart,
            updateQuantity
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}