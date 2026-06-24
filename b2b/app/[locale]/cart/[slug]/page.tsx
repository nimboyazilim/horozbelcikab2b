'use client'
import { useCart } from "@/context/cartContext";
import Logo from "../../../../public/assets/horoz-electric-logo.png"
import Image from "next/image"
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { API_BASE_URL_RESIM } from "@/services/api";
import { Trash2, X, LaptopMinimalCheck } from "lucide-react";
import SiparislerServices from "@/services/siparislerServices";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
interface Adres {
  id: number;
  adres: string;
  adres_turu: number;
  varsayilan: number;
  il: string;
  ilce: string;
  ulke: string;
  tel: string;
  posta_kodu: string;
}

export default function Cart() {

    const { totalItems,loadCart,updateQuantity, removeFromCart, items, araToplam, iskontoOrani, iskontoToplam, totalKdv, genel_toplam } = useCart();
    const t = useTranslations('Header');
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [siparisNo, setSiparisNo] = useState('');
    const [musteriAdresleri, setMusteriAdresleri] = useState<Adres[]>([]);
    const [aciklama, setAciklama] = useState('');
    const [kargoAdresId, setKargoAdresId] = useState<number | null>(null);
    const [faturaAdresId, setFaturaAdresId] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const cartId = params.slug as string;
  


    useEffect(() => {
      const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('accessToken='))
          ?.split('=')[1];

      if (accessToken) {
          const decodedToken = decodeJWT(accessToken);
          if (decodedToken) {
            loadCart(decodedToken.musteri_id);
            getMusteriAdresleri(decodedToken.musteri_id);
          }
      }
  }, []);

  useEffect(() => {
    const varsayilanKargoAdresi = musteriAdresleri.find((adres: Adres) => (adres.adres_turu === 1 || adres.adres_turu === 3) && adres.varsayilan === 1);
    if (varsayilanKargoAdresi && kargoAdresId === null) {
        setKargoAdresId(varsayilanKargoAdresi.id);
    }
  }, [musteriAdresleri]);

  useEffect(() => {
    const varsayilanFaturaAdresi = musteriAdresleri.find((adres: Adres) => (adres.adres_turu === 2 || adres.adres_turu === 3) && adres.varsayilan === 1);
    if (varsayilanFaturaAdresi && faturaAdresId === null) {
        setFaturaAdresId(varsayilanFaturaAdresi.id);
    }
  }, [musteriAdresleri]);

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


  async function getMusteriAdresleri(musteriId: string){
    const response = await SiparislerServices.getMusteriAdresleri(musteriId);
    setMusteriAdresleri(response);
  }


 const siparisTamamla = async () => {
  try{
    if(!kargoAdresId || !faturaAdresId){
      toast.error(t('kargoFaturaAdresiSecilmedi'));
      return;
    }
    setLoading(true);
    const response = await SiparislerServices.createSiparis(cartId,kargoAdresId,faturaAdresId,aciklama);
    
    if(response.status === 'success'){
      toast.success(t('siparisBasarili'));
      setSiparisNo(response.siparisNo);
      setOpen(true);
    }else{
      toast.error(t('siparisBasarisiz'));
    }
  }catch(error:any){
    toast.error(error.response.data.message);
  }finally{
    setLoading(false);
  }
 }

 const urunleriSil = () => {
  items.forEach(item => {
    removeFromCart(item.urun_id, item.varyant_id);
  });
  toast.success(t('sepetBosaltildi'));
  setDeleteDialogOpen(false);
 }

     // Stok kodunu formatlayan yardımcı fonksiyon
     const formatStokKodu = (kod: string) => {
      const parts = kod.split('-');
      if (parts.length >= 4) {
          return parts.slice(1, 4).join('-');
      }
      return kod;
  };

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
        
       <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">{t('siparisBilgi')}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-center">
                <p>{t('siparisBasarili')}</p>
                <LaptopMinimalCheck className="w-16 h-16 mx-auto text-green-600" />
                <p className="font-bold text-xl">{t('siparisNo')}: {siparisNo}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <Link href={'/'} className="w-full">
              <Button variant="outline" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                {t('alisveriseDevamEt')}
              </Button>
            </Link>
            <Link href={`/orders`} className="w-full">
              <Button variant="outline" className="w-full bg-green-600 hover:bg-green-700 text-white">
                {t('siparislerim')}
              </Button>
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
       </AlertDialog>

       {/* Ürünleri Sil Onay Dialog'u */}
       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('sepetiBosaltOnay')}</AlertDialogTitle>
            <AlertDialogDescription>
             {t('sepetiBosaltOnayMesaj')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('iptal')}
            </Button>
            <Button variant="destructive" onClick={urunleriSil}>
              {t('sepetiBosalt')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
       </AlertDialog>


        <div className="bg-gray-100 fixed left-0 right-0 top-0 bottom-0 overflow-y-auto">
        <div className="flex flex-col md:flex-row min-h-screen max-w-screen-xl mx-auto">
            {/* Sol Sütun - Kullanıcı Bilgileri */}
            <div className="w-full md:w-1/2 p-3 md:p-6">
                <div className="mb-3 md:mb-5">
                    <Link href="/" className="cursor-pointer">
                        <Image src={Logo} alt="Logo" width={180} height={125} className="w-32 md:w-[180px] h-auto" />
                    </Link>
                </div>

            {/* <div className="my-5 font-bold">{t('gonderiAdresi')}</div>
            {musteriAdresleri.length > 0 && musteriAdresleri
              .filter((adres: Adres) => adres.adres_turu === 1 || adres.adres_turu === 3)
              .map((adres: Adres) => (
              <div key={adres.id} 
                   onClick={() => setKargoAdresId(adres.id)}
                   className={`bg-gray-200 h-20 flex flex-col p-2 rounded-lg my-5 text-sm cursor-pointer relative ${kargoAdresId === adres.id ? 'ring-2 ring-blue-500' : ''}`}>
                <input
                  type="radio"
                  name="kargoAdresi"
                  checked={kargoAdresId === adres.id}
                  onChange={() => setKargoAdresId(adres.id)}
                  className="absolute right-2 top-2"
                />
                <div>
                  <p>{adres.adres}</p>
                </div>
                <div className="flex flex-row">
                  <span> {adres.ilce} </span>
                  <span className="mr-2"> {adres.il} </span>
                  <span className="mr-2"> {adres.ulke} </span>
                  <span className="mr-2"> {adres.posta_kodu} </span>
                </div>
                <div className="flex flex-row">
                  <p>{adres.tel}</p>
                </div>
              </div>
            ))}

            <div className="my-5 font-bold">{t('faturaAdresi')}</div>
            {musteriAdresleri.length > 0 && musteriAdresleri
              .filter((adres: Adres) => adres.adres_turu === 2 || adres.adres_turu === 3)
              .map((adres: Adres) => (
              <div key={adres.id}
                   onClick={() => setFaturaAdresId(adres.id)}
                   className={`bg-gray-200 h-20 flex flex-col p-2 rounded-lg my-5 text-sm cursor-pointer relative ${faturaAdresId === adres.id ? 'ring-2 ring-blue-500' : ''}`}>
                <input
                  type="radio"
                  name="faturaAdresi"
                  checked={faturaAdresId === adres.id}
                  onChange={() => setFaturaAdresId(adres.id)}
                  className="absolute right-2 top-2"
                />
                <div>
                  <p>{adres.adres}</p>
                </div>
                <div className="flex flex-row">
                  <span> {adres.ilce} </span>
                  <span className="mr-2"> {adres.il} </span>
                  <span className="mr-2"> {adres.ulke} </span>
                  <span className="mr-2"> {adres.posta_kodu} </span>
                </div>
                <div className="flex flex-row">
                  <p>{adres.tel}</p>
                </div>
              </div>
            ))} */}
      

      <div className="my-3 md:my-5">
            <Textarea placeholder={t('sepetAciklama')} value={aciklama} onChange={(e) => setAciklama(e.target.value)} className="text-sm md:text-base" />
      </div>
        

                 <Button className="w-full bg-blue-600 bg-hover:bg-blue-700 text-white text-sm md:text-base" onClick={siparisTamamla} disabled={loading} >{loading ? t('siparisOlusturuluyor') : t('siparisTamamla')}</Button>
            <Link href={`/`}> <Button className="w-full mt-3 md:mt-5 bg-orange-600 bg-hover:bg-orange-700 text-white text-sm md:text-base">{t('alisveriseDevamEt')}</Button></Link>

             {/* Ürünleri Sil Butonu */}
             <div className="mt-2 md:mt-4">
                    <Button 
                        variant="destructive" 
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-sm md:text-base"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        {t('sepetiBosalt')}
                    </Button>
                </div>
            </div>

           

            {/* Dikey Çizgi - Sadece desktop'ta göster */}
            <div className="hidden md:block w-px bg-gray-200"></div>

            {/* Sağ Sütun - Ürün ve Fiyat Detayları */}
            <div className="w-full md:w-1/2 p-3 md:p-6 flex flex-col md:h-screen">
                
                
                
      <div className="flex-1 overflow-y-auto max-h-[500px] md:max-h-[calc(100vh-200px)] py-2 md:py-4">
        {items.map((item,index) => (
          <div key={index} className="flex flex-col md:flex-row gap-2 md:gap-2 justify-between border-b border-gray-200 pb-2 mb-2 md:mb-3">
            <div className="flex flex-row gap-2">
              <div className="flex flex-row gap-2">
              {item.vergi_id == 0 &&  <div className="relative">
               <div className="absolute -top-2 left-0">
                  <Button className="bg-gray-600 text-white rounded-full p-2 w-6 h-6" onClick={() => removeFromCart(item.urun_id, item.varyant_id)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <Image src={`${item.resim == undefined ? API_BASE_URL_RESIM+'/urun-gorsel.webp' : API_BASE_URL_RESIM+'/'+item.resim}`} alt={item.urun_adi} width={50} height={50} className="w-12 h-12 md:w-[50px] md:h-[50px]" />
                </div> }
                <div className="flex flex-col">
                  <Link href={`/product-detail/${item.urun_seo}`}><span className="text-xs md:text-sm font-bold">{item.urun_adi}</span></Link>
                  <span className="text-[10px] md:text-xs font-bold">{item.stok_kodu}</span>
                  <span className="text-[10px] md:text-xs">{item.varyant_urun_adi}</span>
                  {/* <span className="text-xs text-gray-500">{item.varyantAdi}</span> */}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 md:gap-2 items-end">
            {item.indirimli_fiyat > 0 ? (
                      <div className="flex flex-row gap-2">
                        <span className="text-xs md:text-sm line-through text-gray-500">{Number(item.fiyat).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span>
                        <span className="text-xs md:text-sm">{Number(item.indirimli_fiyat).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span>
                      </div>
                    ) : (
                      <span className="text-xs md:text-sm">{Number(item.fiyat).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span>
                    )}
                    {/* <span className="text-sm">{t('birimFiyat')}: {Number(item.birim_fiyat).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span> */}
                    <span className="text-xs md:text-sm">{t('toplam')}: {Number(item.ara_toplam).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span>
              {item.vergi_id == 0 ?  <div className="flex items-center gap-1 md:gap-2 border border-gray-200 rounded-lg">
                <button 
                  onClick={async () => {
                    const miktar = Number(item.miktar);
                    const miktar2 = Number(item.miktar2);
                    const newValue = Math.max(miktar2, miktar - miktar2);
                   // console.log('Mevcut miktar:', miktar, 'Koli adeti:', miktar2, 'Yeni değer:', newValue);
                    await updateQuantity(item.urun_id, item.varyant_id, newValue, miktar2);
                  }}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-100"
                >
                  -
                </button>
                <Input 
                  type="number" 
                  value={item.miktar}
                  data-item-id={`${item.urun_id}-${item.varyant_id}`}
                  onChange={(e) => {
                    const miktar2 = Number(item.miktar2);
                    let value = parseInt(e.target.value) || miktar2;
                    if (value < miktar2) value = miktar2;
                    e.target.value = value.toString();
                  }}
                  onBlur={async (e) => {
                    const miktar2 = Number(item.miktar2);
                    const inputValue = parseInt(e.target.value) || miktar2;
                    const newValue = Math.max(miktar2, Math.floor(inputValue / miktar2) * miktar2);
                    console.log('Input değeri:', inputValue, 'Koli adeti:', miktar2, 'Yeni değer:', newValue);
                    if (newValue !== inputValue) {
                      e.target.value = newValue.toString();
                      toast.error('Miktar, koli adeti olan '+formatNumber(miktar2)+' katları olmalıdır');
                    }
                    await updateQuantity(item.urun_id, item.varyant_id, newValue, miktar2);
                  }}
                  min={Number(item.miktar2)}
                  className="w-12 md:w-20 text-center text-xs md:text-sm border-none focus:outline-none focus:ring-0 focus:border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                />
                <button 
                  onClick={async () => {
                    const miktar = Number(item.miktar);
                    const miktar2 = Number(item.miktar2);
                    const newValue = miktar + miktar2;
                    //console.log('Mevcut miktar:', miktar, 'Koli adeti:', miktar2, 'Yeni değer:', newValue);
                    await updateQuantity(item.urun_id, item.varyant_id, newValue, miktar2);
                  }}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
              </div> : <div className="text-xs md:text-sm">{item.miktar}</div> }
            </div>
          </div>
        ))}
      </div>

      {/* Sabit alt kısım */}
      <div className="border-t mt-2 md:mt-5">
        <div className="flex flex-col gap-1 md:gap-2 py-2 md:py-4">
          <div className="flex flex-row justify-between">
            <span className="text-base md:text-xl font-bold">{t('araToplam')}</span>
            <span className="text-base md:text-xl font-bold">{Number(araToplam).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span>
          </div>
          {iskontoOrani > 0 && (
                  <div className="flex flex-row justify-between">
                    <span className="text-base md:text-xl font-bold">{t('iskonto')}(%{Number(iskontoOrani).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })})</span>
                    <span className="text-base md:text-xl font-bold">{Number(iskontoToplam).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span>
                  </div>
                )}
               {/* <div className="flex flex-row justify-between">
                  <span className="text-xl font-bold">{t('kdv')}</span>
                  <span className="text-xl font-bold">{Number(totalKdv).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span>
                </div> */}
          <div className="flex flex-row justify-between">
            <span className="text-base md:text-xl font-bold">{t('toplamFiyat')}</span>
            <span className="text-base md:text-xl font-bold">{Number(genel_toplam).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span>
          </div>
        </div>
      </div>



            </div>
         </div>
        </div>

        </>
    )
}