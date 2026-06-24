import { ShoppingBag, X } from "lucide-react";
import { useCart } from "@/context/cartContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from 'js-cookie';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "../ui/button";
import { API_BASE_URL_RESIM } from "@/services/api";
import { toast } from "react-hot-toast";

export default function Cart() {
  const { totalItems, loadCart, items, genel_toplam, updateQuantity, removeFromCart } = useCart();
  const t = useTranslations('Header');
  const cartId = Cookies.get('cartId');
  const [inputValues, setInputValues] = useState<{[key: string]: number}>({});
  useEffect(() => {
    const accessToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1];

    if (accessToken) {
      const decodedToken = decodeJWT(accessToken);
      if (decodedToken) {
        loadCart(decodedToken.musteri_id);
      }
    }
  }, []);

  // Input değerlerini güncelle
  useEffect(() => {
    const newInputValues: {[key: string]: number} = {};
    items.forEach(item => {
      const key = `${item.urun_id}-${item.varyant_id}`;
      newInputValues[key] = item.miktar;
    });
    setInputValues(newInputValues);
  }, [items]);


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


  // Sayıları formatlamak için yardımcı fonksiyon
  const formatNumber = (number: number) => {
    // Önce sayıyı string'e çevir ve gereksiz sıfırları kaldır
    const formatted = Number(number).toString();
    // Eğer tam sayı ise direkt döndür
    if (Number.isInteger(Number(formatted))) {
        return formatted;
    }
    // Değilse, noktadan sonraki gereksiz sıfırları kaldır
    return Number(formatted).toFixed(2).replace(/\.?0+$/, '');
};



  return (
    <>


      <Sheet>
        <SheetTrigger>
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-4 -right-5 bg-red-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
        </SheetTrigger>
        <SheetContent className="opacity-90">
          <div className="h-full flex flex-col">
            <SheetHeader>
              <SheetTitle>{t('cart')}</SheetTitle>
              <SheetDescription> </SheetDescription>
            </SheetHeader>

            {/* Scrollable ürün listesi */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.map((item, index) => (
                <div key={index} className="flex flex-row gap-2 justify-between border-b border-gray-200 pb-2 mb-3">
                  <div className="flex flex-row gap-2">
                    <div className="flex flex-row gap-2">
                      {item.vergi_id == 0 && <div className="relative">
                        <div>
                          <Button className="bg-gray-600 text-white rounded-full p-2 w-6 h-6" onClick={() => removeFromCart(item.urun_id, item.varyant_id)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <Image src={`${item.resim == undefined ? API_BASE_URL_RESIM + '/urun-gorsel.webp' : API_BASE_URL_RESIM + '/' + item.resim}`} alt={item.urun_adi} width={50} height={50} />
                      </div>}
                      <div className="flex flex-col">
                        <Link href={`/product-detail/${item.urun_seo}`}><span className="text-sm font-bold">{item.urun_adi}</span></Link>
                        <span className="text-xs font-bold">{item.stok_kodu}</span>
                        <span className="text-xs">{item.varyant_urun_adi}</span>
                        {/* <span className="text-xs">{item.varyantAdi}</span> */}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {item.indirimli_fiyat > 0 && <div className="flex flex-row gap-2">
                      <span className="text-sm line-through">{Number(item.fiyat).toFixed(2).replace('.', ',')} $</span>
                      <span className="text-sm">{Number(item.indirimli_fiyat).toFixed(2).replace('.', ',')} $</span>
                    </div>}
                    {item.indirimli_fiyat == 0 && <span className="text-sm">{Number(item.fiyat).toFixed(2).replace('.', ',')} $</span>}

                    {item.vergi_id == 0 ? (
                      <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                        <button
                          onClick={() => {
                            // Mevcut miktarı koli adetine göre yuvarla
                            const currentBoxes = Math.floor(item.miktar / item.miktar2);
                            const newBoxes = Math.max(currentBoxes - 1, 1);
                            const newQuantity = newBoxes * item.miktar2;
                            updateQuantity(item.urun_id, item.varyant_id, newQuantity, item.miktar2);
                          }}
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-100"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={inputValues[`${item.urun_id}-${item.varyant_id}`] || item.miktar}
                          data-item-id={`${item.urun_id}-${item.varyant_id}`}
                          onChange={(e) => {
                            let value = parseInt(e.target.value) || 1;
                            if (value < 1) value = 1;
                            const key = `${item.urun_id}-${item.varyant_id}`;
                            setInputValues(prev => ({...prev, [key]: value}));
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value);
                            if((value % item.miktar2 !== 0) && value > 1) {
                              const key = `${item.urun_id}-${item.varyant_id}`;
                              setInputValues(prev => ({...prev, [key]: item.miktar}));
                              toast.error('Miktar, koli adeti olan '+formatNumber(item.miktar2)+' katları olmalıdır');
                              return;
                            }
                            updateQuantity(item.urun_id, item.varyant_id, value, item.miktar2);
                          }}
                          className="w-12 text-center border-none outline-none text-xs focus:ring-2 focus:ring-blue-500"
                          min={1}
                        />
                        <button
                          onClick={() => {
                            // Mevcut miktarı koli adetine göre yuvarla
                            const currentBoxes = Math.floor(item.miktar / item.miktar2);
                            const newBoxes = currentBoxes + 1;
                            const newQuantity = newBoxes * item.miktar2;
                            updateQuantity(item.urun_id, item.varyant_id, newQuantity, item.miktar2);
                          }}
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm">{item.miktar}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sabit alt kısım */}
            <div className="border-t mt-auto">
              <div className="flex flex-col gap-2 py-4">
                <h1 className="font-bold">{t('toplamFiyat')}: {Number(genel_toplam).toFixed(2).replace('.', ',')} $</h1>
                <Link href={`/cart/${cartId}`}> <Button className="w-full bg-blue-600 bg-hover:bg-blue-700 text-white">{t('siparisTamamla')}</Button></Link>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>



    </>
  )
}