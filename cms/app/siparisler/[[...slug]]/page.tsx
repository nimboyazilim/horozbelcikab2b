'use client'
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_ENDPOINTS, API_BASE_URL_KATEGORI_RESIM, API_BASE_URL_RESIM } from "@/config/api";
import api from "@/services/api";
import { toast, useToast } from "@/hooks/use-toast";

import { ArrowLeft, FolderSync, Loader2, PlusIcon, Save, Zap, ZapIcon, FileIcon } from "lucide-react"
import { useParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from 'next/dist/client/components/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import BreadcrumbComp from "@/app/components/breadcrumbComp";

import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { TableHeader } from "@/components/ui/table";
interface Kategori {
    id: number;
    kodu: string;
    ad: string;
    soyad: string;
    vkntckn: string;
    eposta: string;
    telefon: string;
    iskonto_yuzde: number;
    fiyat_grup_id: number;
}

// Tarih formatını ayarlayan yardımcı fonksiyon
const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm" formatında
};

// Add this helper function near the top of the file, after imports
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(',', '');
};

export default function Siparisler() {

    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<Kategori>>({
        kodu: '',
        ad: '',
        soyad: '',
        vkntckn: '',
        eposta: '',
        telefon: '',
        iskonto_yuzde: 0,
        fiyat_grup_id: 0
    });
    const [data, setData] = useState<any>();
    const [durum, setDurum] = useState<any>();

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPdf, setIsLoadingPdf] = useState(false);
    const [isLoadingOrderPdf, setIsLoadingOrderPdf] = useState(false);
    const [isLoadingFaturaPdf, setIsLoadingFaturaPdf] = useState(false);


    useEffect(() => {
        if (params.slug) {
            fetchData();
        }
    }, [params.slug]);

    useEffect(() => {
        setDurum(data?.siparislerGenel?.durum.toString());
    }, [data]);

    const fetchData = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.siparislerById + params.slug);
            if (response.status === 200) {
                setData(response.data);
            }
        } catch (error) {
            toast({
                title: "Hata!",
                description: "Sipariş kaydı getirilirken bir hata oluştu.",
                variant: "destructive",
            });
        }
    };


    const SIPARIS_DURUM_LABEL: Record<string, string> = {
        '0': 'Beklemede',
        '1': 'Onaylandı',
        '2': 'Hazırlanıyor',
        '3': 'Kargoda',
        '4': 'Teslim Edildi',
        '5': 'İptal Edildi',
        '6': 'Hazır',
    };

    const handleDurumChange = async (value: string) => {
        setIsLoading(true);
        setDurum(value);
        const durumLabel = SIPARIS_DURUM_LABEL[value] || value;
        const siparisMusteriAdi = data?.siparislerGenel?.musteri_adi || data?.siparislerGenel?.musteri_ad || '';
        const logAction = {
            action: `Sipariş durumu "${durumLabel}" olarak güncellendi${siparisMusteriAdi ? ` — ${siparisMusteriAdi}` : ''}`,
            category: 'Sipariş',
        };
        try {
        const response = await api.put(
            `${API_ENDPOINTS.siparisDurumUpdate}${params.slug}`,
            { durum: value },
            { _logAction: logAction } as object
        );
        if (response.data.status === 'success') {
            toast({
                title: "Başarılı!",
                description: "Sipariş durumu başarıyla güncellendi.",
                variant: "default",
            });
        }
    } catch (error) {
        toast({
            title: "Hata!",
            description: "Sipariş durumu güncellenirken bir hata oluştu.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
    };


    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (formData.ad === '' || formData.soyad === '' || formData.eposta === '') {
                toast({
                    title: "Hata!",
                    description: "Lütfen tüm alanları doldurunuz.",
                    variant: "destructive",
                });
                return;
            }


            if (params.slug) {
                // Update existing record
                const response = await api.put(`${API_ENDPOINTS.musterilerUpdate}${params.slug}`,
                    formData
                );
                if (response.data.status === 'success') {
                    toast({
                        title: "Başarılı!",
                        description: "Sipariş kaydı başarıyla güncellendi.",
                        variant: "default",
                    });
                }
            } else {
                // Create new record
                const response = await api.post(API_ENDPOINTS.musterilerCreate,
                    formData
                );
                if (response.data.status === 'success') {
                    router.push(`/siparisler/${response.data.id}`);
                    toast({
                        title: "Başarılı!",
                        description: "Sipariş kaydı başarıyla oluşturuldu.",
                        variant: "default",
                    });
                }
            }
        } catch (error: any) {
            toast({
                title: "Hata!",
                description: params.slug
                    ? "Sipariş kaydı güncellenirken bir hata oluştu."
                    : error.response.data.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === 'iskonto_yuzde' || field === 'fiyat_grup_id'
                ? Number(value) || 0
                : value
        }));
    };


    const handleErpAktar = async () => {
        setIsLoading(true);
        try {
            const response = await api.put(`${API_ENDPOINTS.siparisErpAktar}${params.slug}`);
            if (response.data.status === 'success') {
                toast({
                    title: "Başarılı!",
                    description: response.data.message,
                    variant: "default",
                });
                fetchData();
            }else{
                toast({
                    title: "Hata!",
                    description: response.data.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Hata!",
                description: "Erp aktarılırken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };  


    const handleProformaFaturaPdf = async () => {
        setIsLoadingPdf(true);
        try {
            const response = await api.get(`${API_ENDPOINTS.proformaFaturaPdf}${data?.siparislerGenel?.siparis_no}`, {
                responseType: 'blob'
            });
            
            if (response.status === 200) {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                
                // Direkt indirme işlemi
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `proforma-fatura-${data?.siparislerGenel?.siparis_no || params.slug}.pdf`);
                document.body.appendChild(link);
                link.click();
                
                // Temizleme işlemi
                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }, 1000);
                
                toast({
                    title: "Başarılı!",
                    description: "Proforma fatura indirildi.",
                });
            } else {
                toast({
                    title: "Hata!",
                    description: "PDF oluşturulurken bir hata oluştu.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Hata!",
                description: "Proforma fatura pdf oluşturulurken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsLoadingPdf(false);
        }
    }
    const handleOrderPdf = async () => {
        setIsLoadingOrderPdf(true);
        try {
            const response = await api.get(`${API_ENDPOINTS.orderPdf}${data?.siparislerGenel?.siparis_no}`, {
                responseType: 'blob'
            });
            
            if (response.status === 200) {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                
                // Direkt indirme işlemi
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `order-${data?.siparislerGenel?.siparis_no || params.slug}.pdf`);
                document.body.appendChild(link);
                link.click();
                
                // Temizleme işlemi
                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }, 1000);
                
                toast({
                    title: "Başarılı!",
                    description: "Order PDF indirildi.",
                });
            } else {
                toast({
                    title: "Hata!",
                    description: "PDF oluşturulurken bir hata oluştu.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Hata!",
                description: "Order pdf oluşturulurken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsLoadingOrderPdf(false);
        }
    }

    const handleFaturaPdf = async () => {
        setIsLoadingFaturaPdf(true);
        try {
            const response = await api.get(`${API_ENDPOINTS.faturaPdf}${data?.siparislerGenel?.siparis_no}`, {
                responseType: 'blob'
            });
            
            if (response.status === 200) {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                
                // Direkt indirme işlemi
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `fatura-${data?.siparislerGenel?.siparis_no || params.slug}.pdf`);
                document.body.appendChild(link);
                link.click();
                
                // Temizleme işlemi
                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }, 1000);
                
                toast({
                    title: "Başarılı!",
                    description: "Fatura PDF indirildi.",
                });
            } else {
                toast({
                    title: "Hata!",
                    description: "PDF oluşturulurken bir hata oluştu.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Hata!",
                description: "Fatura pdf oluşturulurken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsLoadingFaturaPdf(false);
        }
    }



    const breadcrumbData = [
        { name: 'Sipariş Listesi', link: '/siparisler/liste' },
        { name: params.slug ? 'Sipariş Bilgileri' : 'Yeni Sipariş', link: `/siparisler/${params.slug}` }
    ];



    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex justify-between items-center">
                <div>
                    <BreadcrumbComp data={breadcrumbData} />
                </div>
                <div className="flex flex-row space-x-4">
                    
                <div className="font-bold p-2 rounded-md bg-orange-500 text-white">Erp Seri-Sıra: {data?.siparislerGenel?.erp_seri} - {data?.siparislerGenel?.erp_sira}</div>
                <div className="font-bold p-2 rounded-md bg-green-900 text-white">Sipariş No: {data?.siparislerGenel?.siparis_no}</div>
               <div className="p-2 rounded-md bg-black text-white">Tarih: {formatDate(data?.siparislerGenel?.create_date)}</div>
               

                </div>
            </div>
            <Separator className="my-5" />
         <div className="flex flex-row gap-2 justify-between">
         <div className="flex flex-row gap-2 mb-5 items-center">
            <Select value={durum} onValueChange={handleDurumChange} disabled={isLoading}>
                <SelectTrigger className="w-52">
                    <SelectValue placeholder="Durum Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="0">Beklemede</SelectItem>
                    <SelectItem value="1">Onaylandı</SelectItem>
                    <SelectItem value="2">Hazırlanıyor</SelectItem>
                    <SelectItem value="6">Hazır</SelectItem>
                    <SelectItem value="3">Kargoda</SelectItem>
                    <SelectItem value="4">Teslim Edildi</SelectItem>
                    <SelectItem value="5">İptal Edildi</SelectItem>
                </SelectContent>
            </Select>   
           {/* <div className="p-1 rounded-md bg-orange-500 text-white text-center">
                {data?.siparislerGenel?.odeme == 0 ? 'Havale' : 'Kredi Kartı'}
            </div>*/}
         </div>

        <div className="flex flex-row gap-2">

          {data?.siparislerGenel?.erp_durum == 1 && <Button variant="outline" onClick={handleOrderPdf} disabled={isLoadingOrderPdf} className={`bg-orange-500 text-white flex flex-row gap-2 items-center`}>
                <FileIcon className="w-4 h-4" />
                {isLoadingOrderPdf && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Order Pdf</span>
            </Button>}

          {data?.siparislerGenel?.erp_durum == 1 && <Button variant="outline" onClick={handleProformaFaturaPdf} disabled={isLoadingPdf} className={`bg-red-500 text-white flex flex-row gap-2 items-center`}>
                <FileIcon className="w-4 h-4" />
                {isLoadingPdf && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Proforma Fatura Pdf</span>
            </Button>}

          {data?.siparislerGenel?.erp_durum == 1 && <Button variant="outline" onClick={handleFaturaPdf} disabled={isLoadingFaturaPdf} className={`bg-blue-500 text-white flex flex-row gap-2 items-center`}>
                <FileIcon className="w-4 h-4" />
                {isLoadingFaturaPdf && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Fatura Pdf</span>
            </Button>}

            <Button variant="outline" onClick={ data?.siparislerGenel?.erp_durum == 0 ? handleErpAktar : undefined} disabled={isLoading} className={`${data?.siparislerGenel?.erp_durum == 0 ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                <FolderSync className="w-4 h-4" />
                <span>{data?.siparislerGenel?.erp_durum == 0 ? 'Erp Aktarılmadı (Aktar)' : 'Erp Aktarıldı'}</span>
            </Button>
            
        </div>

         </div>
          

            <div className="w-full">
                <div className="flex flex-row gap-8">
                    {/* Sol Kolon */}
                    <div className="w-1/2 border p-4 rounded-md border-t-2 border-t-blue-500">
                        <div className="flex flex-col gap-2">
                            <Label className="text-lg font-bold">Müşteri Bilgileri</Label>
                            <div className="flex flex-col gap-2">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 text-sm rounded-md">
                                    {data?.siparislerGenel?.kodu} - {data?.siparislerGenel?.musteri_adi}</div>
                                <div className="flex flex-row gap-2 flex-wrap">
                                    <div className="flex flex-col gap-2 text-sm p-2 w-1/2">
                                        <Label className="font-bold">E-posta</Label>
                                        <div>{data?.siparislerGenel?.eposta}</div>
                                    </div>
                                    <div className="flex flex-col gap-2 text-sm p-2">
                                        <Label className="font-bold">Telefon</Label>
                                        <div>{data?.siparislerGenel?.telefon}</div>
                                    </div>
                                    <div className="flex flex-col gap-2 text-sm p-2 w-1/2">
                                        <Label className="font-bold">Vergi No</Label>
                                        <div>{data?.siparislerGenel?.vkntckn}</div>
                                    </div>
                                </div>
                                <div className="flex flex-row gap-2 w-full">
                                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-1/2">
                                        <div className="font-bold text-sm">Gönderim Adresi</div>
                                        <div className="text-sm">{data?.kargoAdresi?.adres}<br />
                                            {data?.kargoAdresi?.ilce} / {data?.kargoAdresi?.il}<br />
                                            {data?.kargoAdresi?.ulke} / {data?.kargoAdresi?.posta_kodu}
                                            <br />
                                            {data?.kargoAdresi?.tel}
                                        </div>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-1/2">
                                        <div className="font-bold text-sm">Fatura Adresi</div>
                                        <div className="text-sm">{data?.faturaAdresi?.adres}<br />
                                            {data?.faturaAdresi?.ilce} / {data?.faturaAdresi?.il}<br />
                                            {data?.faturaAdresi?.ulke} / {data?.faturaAdresi?.posta_kodu}<br />
                                            {data?.faturaAdresi?.tel}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-full mt-2">
                                    <div className="font-bold text-sm">Teslim Türü</div>
                                    <div className="text-sm">{
                                        data?.siparislerGenel?.teslim_turu === 'magaza' ? 'Müşteri Gelip Alacak'
                                        : data?.siparislerGenel?.teslim_turu === 'kargo' ? 'Kargo'
                                        : data?.siparislerGenel?.teslim_turu === 'adrese' ? 'Adrese Teslim'
                                        : '-'
                                    }</div>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-full mt-2">
                                    <div className="font-bold text-sm">Açıklama</div>
                                    <div className="text-sm">{data?.siparislerGenel?.aciklama}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sağ Kolon */}
                    <div className="w-full border p-4 rounded-md border-t-2 border-t-blue-500">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label className="text-lg font-bold">Ürünler</Label>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead></TableHead>
                                        <TableHead>Ürün</TableHead>
                                        <TableHead>Miktar</TableHead>
                                        <TableHead>Fiyat</TableHead>
                                        <TableHead>Toplam</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.siparislerAlt?.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                               {item.vergi_kodu == null ? <Image src={item.resim ? API_BASE_URL_RESIM + item.resim : API_BASE_URL_RESIM+'urun-gorsel.webp'} alt={item.urun_adi} width={50 } height={50} /> : ''}
                                                </TableCell>
                                            <TableCell>
                                           {item.vergi_kodu == null ? <div className="flex flex-col">
                                            <span className="font-bold">{item.urun_adi}</span>
                                            <span className="text-xs">{item.stok_kodu} <br /> {item.varyant_urun_adi}</span>
                                            </div> : 
                                            <div className="flex flex-col">
                                            <span className="font-bold">{item.vergi_kodu}</span>
                                            <span className="text-xs">{item.stok_kodu}</span>
                                            </div>
                                            }
                                            </TableCell>
                                            <TableCell>{item.miktar}</TableCell>
                                            <TableCell>{Number(item.net_birim_fiyat).toFixed(2).replace('.', ',')}</TableCell>
                                            <TableCell>{Number(item.net_birim_fiyat * item.miktar).toFixed(2).replace('.', ',')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="flex flex-row gap-2">
                                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-full text-center">
                                            <div className="font-bold text-sm">Toplam Satır</div>
                                            <div className="text-sm">
                                                {Number(
                                                    data?.siparislerAlt?.length
                                                ).toFixed(2).replace('.', ',')}
                                            </div>
                                        </div>

                                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-full text-center">
                                            <div className="font-bold text-sm">Ara Toplam</div>
                                            <div className="text-sm">
                                                {Number(
                                                    data?.siparislerAlt?.reduce((total: number, item: any) => 
                                                        total + (Number(item.net_birim_fiyat * item.miktar) || 0), 0)
                                                ).toFixed(2).replace('.', ',')}
                                            </div>
                                        </div>

                                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-full text-center">
                                            <div className="font-bold text-sm">İskonto</div>
                                            <div className="text-sm">
                                                {Number(
                                                    data?.siparislerAlt?.reduce((total: number, item: any) => 
                                                        total + (Number(item.iskonto_tutari) || 0), 0)
                                                ).toFixed(2).replace('.', ',')}
                                            </div>
                                        </div>
                                      
                                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-full text-center">
                                            <div className="font-bold text-sm">Kdv</div>
                                            <div className="text-sm">
                                                {Number(
                                                    data?.siparislerAlt?.reduce((total: number, item: any) => 
                                                        total + (Number(item.kdv_fiyat) || 0), 0)
                                                ).toFixed(2).replace('.', ',')}
                                            </div>
                                        </div>

                                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-full text-center">
                                            <div className="font-bold text-sm">Genel Toplam</div>
                                            <div className="text-sm">
                                                {Number(
                                                    data?.siparislerAlt?.reduce((total: number, item: any) => 
                                                        total + (Number(item.fiyat) || 0), 0)
                                                ).toFixed(2).replace('.', ',')}
                                            </div>
                                        </div>
                                        
                                    </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}