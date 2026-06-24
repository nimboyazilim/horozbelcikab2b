'use client'
import SiparislerServices from '@/services/siparislerServices'
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from 'next/image';
import { API_BASE_URL_RESIM } from '@/services/api';
import { Banknote, ChartBar, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast'
export default function Orders() {

    const t = useTranslations('Header');
    const [siparislerData, setSiparislerData] = useState([]);
    const [odeme, setOdeme] = useState(
        {
            0: t('havale'),
        }
    );
    const [durum, setDurum] = useState(
        {
            0: t('beklemede'),
            1: t('onaylandi'),
            2: t('hazirlaniyor'),
            3: t('kargoda'),
            4: t('teslimEdildi'),
            5: t('iptalEdildi'),
            6: t('hazir')
        }
    );
    
    useEffect(() => {
        const accessToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('accessToken='))
            ?.split('=')[1];
  
        if (accessToken) {
            const decodedToken = decodeJWT(accessToken);
            if (decodedToken) {
                siparisler(decodedToken.musteri_id);
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


  const siparisler = async (musteriId: string) => {
        const siparisler = await SiparislerServices.getSiparisler(musteriId);
        
        setSiparislerData(siparisler.siparisler);
  };

      // Stok kodunu formatlayan yardımcı fonksiyon
      const formatStokKodu = (kod: string) => {
        const parts = kod.split('-');
        if (parts.length >= 4) {
            return parts.slice(1, 4).join('-');
        }
        return kod;
    };

    const [isLoadingPdf, setIsLoadingPdf] = useState<{[key: string]: boolean}>({});
    const [isLoadingOrderPdf, setIsLoadingOrderPdf] = useState<{[key: string]: boolean}>({});
    const [isLoadingInvoicePdf, setIsLoadingInvoicePdf] = useState<{[key: string]: boolean}>({});

    const handleProformaFaturaPdf = async (siparisNo: string) => {
        setIsLoadingPdf(prev => ({ ...prev, [siparisNo]: true }));
        try {
            const response = await SiparislerServices.proformaFaturaPdf(siparisNo);
           
            if (response.status === 200) {
             
                if(response.headers['content-length'] == 0) {
                    toast.error("Bu siparişe ait proforma fatura hazırlanıyor...");
                    return;
                }

                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                
                // Yeni pencerede aç
                const newWindow = window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                if (newWindow) {
                    newWindow.focus();
                    // Pop-up engellenmişse kullanıcıya bilgi ver
                    setTimeout(() => {
                        if (newWindow.closed) {
                            // Pop-up engellenmiş, indirme işlemini başlat
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `proforma-fatura-${siparisNo}.pdf`);
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            toast.success("PDF indiriliyor. Pop-up engellenmiş olabilir.");
                        }
                    }, 1000);
                } else {
                    // Pop-up engellenmişse indirme işlemini başlat
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `proforma-fatura-${siparisNo}.pdf`);
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    toast.success("PDF indiriliyor. Pop-up engellenmiş olabilir.");
                }
                
                // URL'i temizle
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                }, 1000);
            } else {
                toast.error("PDF oluşturulurken bir hata oluştu.");
            }
        } catch (error) {
            console.error('PDF hatası:', error);
            toast.error("Proforma fatura pdf oluşturulurken bir hata oluştu.");
        } finally {
            setIsLoadingPdf(prev => ({ ...prev, [siparisNo]: false }));
        }
    }
    const handleOrderPdf = async (siparisNo: string) => {
        setIsLoadingOrderPdf(prev => ({ ...prev, [siparisNo]: true }));
        try {
            const response = await SiparislerServices.orderPdf(siparisNo);
            
            if (response.status === 200) {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                
                // Yeni pencerede aç
                const newWindow = window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                if (newWindow) {
                    newWindow.focus();
                    // Pop-up engellenmişse kullanıcıya bilgi ver
                    setTimeout(() => {
                        if (newWindow.closed) {
                            // Pop-up engellenmiş, indirme işlemini başlat
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `order-${siparisNo}.pdf`);
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            toast.success("PDF indiriliyor. Pop-up engellenmiş olabilir.");
                        }
                    }, 1000);
                } else {
                    // Pop-up engellenmişse indirme işlemini başlat
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `order-${siparisNo}.pdf`);
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    toast.success("PDF indiriliyor. Pop-up engellenmiş olabilir.");
                }
                
                // URL'i temizle
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                }, 1000);
            } else {
                toast.error("PDF oluşturulurken bir hata oluştu.");
            }
        } catch (error) {
            console.error('PDF hatası:', error);
            toast.error("Order pdf oluşturulurken bir hata oluştu.");
        } finally {
            setIsLoadingOrderPdf(prev => ({ ...prev, [siparisNo]: false }));
        }
    }
    const handleInvoicePdf = async (siparisNo: string) => {
        setIsLoadingInvoicePdf(prev => ({ ...prev, [siparisNo]: true }));
        try {
            const response = await SiparislerServices.faturaPdf(siparisNo);
           
            if (response.status === 200) {
             
                if(response.headers['content-length'] == 0) {
                    toast.error("Bu siparişe ait fatura hazırlanıyor...");
                    return;
                }

                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                
                // Yeni pencerede aç
                const newWindow = window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                if (newWindow) {
                    newWindow.focus();
                    // Pop-up engellenmişse kullanıcıya bilgi ver
                    setTimeout(() => {
                        if (newWindow.closed) {
                            // Pop-up engellenmiş, indirme işlemini başlat
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `fatura-${siparisNo}.pdf`);
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            toast.success("PDF indiriliyor. Pop-up engellenmiş olabilir.");
                        }
                    }, 1000);
                } else {
                    // Pop-up engellenmişse indirme işlemini başlat
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `fatura-${siparisNo}.pdf`);
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    toast.success("PDF indiriliyor. Pop-up engellenmiş olabilir.");
                }
                
                // URL'i temizle
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                }, 1000);
            } else {
                toast.error("PDF oluşturulurken bir hata oluştu.");
            }
        } catch (error) {
            console.error('PDF hatası:', error);
            toast.error("Fatura pdf oluşturulurken bir hata oluştu.");
        } finally {
            setIsLoadingInvoicePdf(prev => ({ ...prev, [siparisNo]: false }));
        }
    }


    return (
        <div className="max-w-screen-xl mx-auto px-4 my-10">
            <div className="flex flex-col gap-4 mb-10">
                <h1 className="text-2xl font-bold">{t('orders')}</h1>
            </div>


            {siparislerData.length === 0 && <div className="flex flex-col gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>}

            {siparislerData.length > 0 && siparislerData.map((siparis: any) => (
                <Accordion type="single" collapsible key={siparis.id} className="no-underline bg-gray-50 p-2 rounded-lg mb-5">
                    <AccordionItem value={siparis.id.toString()}>
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex flex-col gap-4 w-full">
                                <div className="text-sm text-gray-500 font-bold">
                                    {new Date(siparis.create_date).toLocaleString('tr-TR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    }).replace(',', '')}
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className='flex flex-row gap-2'>
                                        <div>{siparis.siparis_no}</div>
                                        <div className='font-bold'>{Number(siparis.alt_siparisler.reduce((acc: number, altSiparis: any) => acc + (Number(altSiparis.fiyat)), 0)).toFixed(2).replace('.', ',')} $</div>
                                    </div>
                                    <div className='flex flex-row gap-2'>
                                        <div className="bg-gray-300 px-2 py-1 rounded-md flex flex-row gap-2 items-center"><ChartBar className='w-4 h-4' /><span className='text-sm'>{durum[siparis.durum as keyof typeof durum]}</span></div>
                                        {/*<div className="bg-gray-200 px-2 py-1 rounded-md flex flex-row gap-2 items-center"><Banknote className='w-4 h-4' /><span className='text-sm'>{odeme[siparis.odeme as keyof typeof odeme]}</span></div>*/}
                                      {siparis.erp_durum == 1 && <div className="bg-orange-400 text-white px-2 py-1 rounded-md flex flex-row gap-2 items-center cursor-pointer" onClick={(e) => {
                                            e.stopPropagation();
                                            handleOrderPdf(siparis.siparis_no);
                                        }}>
                                            <FileText className='w-4 h-4' /> {isLoadingOrderPdf[siparis.siparis_no] && <Loader2 className='w-4 h-4 animate-spin' />} <span className='text-sm'>{t('order')}</span>
                                        </div>}
                                      {siparis.erp_durum == 1 && <div className="bg-red-400 text-white px-2 py-1 rounded-md flex flex-row gap-2 items-center cursor-pointer" onClick={(e) => {
                                            e.stopPropagation();
                                            handleProformaFaturaPdf(siparis.siparis_no);
                                        }}>
                                            <FileText className='w-4 h-4' /> {isLoadingPdf[siparis.siparis_no] && <Loader2 className='w-4 h-4 animate-spin' />} <span className='text-sm'>Proforma</span>
                                        </div>}
                                      {siparis.erp_durum == 1 && <div className="bg-green-400 text-white px-2 py-1 rounded-md flex flex-row gap-2 items-center cursor-pointer" onClick={(e) => {
                                            e.stopPropagation();
                                            handleInvoicePdf(siparis.siparis_no);
                                        }}>
                                            <FileText className='w-4 h-4' /> {isLoadingInvoicePdf[siparis.siparis_no] && <Loader2 className='w-4 h-4 animate-spin' />} <span className='text-sm'>{t('invoice')}</span>
                                        </div>}
                                    </div>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            {siparis.alt_siparisler && siparis.alt_siparisler.map((altSiparis: any) => (
                                <div key={altSiparis.id} className="p-4 border-t">
                                    <div className='flex flex-col gap-2'>
                                        {altSiparis.vergi_kodu == null && <div><Image src={altSiparis.resim ? API_BASE_URL_RESIM + altSiparis.resim : API_BASE_URL_RESIM + 'urun-gorsel.webp'} alt={altSiparis.urun_adi} width={50} height={50} /></div>}
                                        <div className="flex flex-row gap-4 justify-between">
                                            <div className='font-bold'>{altSiparis.vergi_kodu == null ? <Link href={`/product-detail/${altSiparis.urun_seo}`}>{altSiparis.urun_adi + ' | ' + altSiparis.stok_kodu}</Link> : altSiparis.vergi_kodu}</div>
                                        </div>
                                        <div className='flex flex-row gap-4 justify-between'>
                                            {altSiparis.vergi_kodu != null ? '-' : <div>{altSiparis.varyant_urun_adi}</div>}
                                        </div>
                                        <div className='flex flex-row gap-4 justify-between border-t pt-2'>
                                            <div>{t('fiyat')}</div>
                                            <div className='font-bold'>{Number(altSiparis.net_birim_fiyat).toFixed(2).replace('.', ',')} $</div>
                                        </div>
                                        <div className='flex flex-row gap-4 justify-between border-t pt-2'>
                                            <div>{t('miktar')}</div>
                                            <div className='font-bold'>{altSiparis.miktar}</div>
                                        </div>
                                        {/*<div className='flex flex-row gap-4 justify-between border-t pt-2'>
                                            <div>İskonto</div>
                                            <div className='font-bold'>{Number(altSiparis.iskonto_tutari).toFixed(2).replace('.', ',')} $</div>
                                        </div>
                                        <div className='flex flex-row gap-4 justify-between border-t pt-2'>
                                            <div>Toplam</div>
                                            <div className='font-bold'>{Number(altSiparis.fiyat - altSiparis.kdv_fiyat).toFixed(2).replace('.', ',')} $</div>
                                        </div>
                                        <div className='flex flex-row gap-4 justify-between border-t pt-2'>
                                            <div>Kdv</div>
                                            <div className='font-bold'>{Number(altSiparis.kdv_fiyat).toFixed(2).replace('.', ',')} $</div>
                                        </div>
                                        */}
                                        <div className='flex flex-row gap-4 justify-between border-t pt-2'>
                                            <div>{t('genelToplam')}</div>
                                            <div className='font-bold'>{Number(altSiparis.fiyat).toFixed(2).replace('.', ',')} $</div>
                                        </div>
                                       
                                    </div>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            ))}

        </div>
    )
}