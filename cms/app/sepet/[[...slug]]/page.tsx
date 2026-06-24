'use client'
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_ENDPOINTS, API_BASE_URL_KATEGORI_RESIM, API_BASE_URL_RESIM } from "@/config/api";
import api from "@/services/api";
import { toast, useToast } from "@/hooks/use-toast";

import { ArrowLeft, FolderSync, Loader2, PlusIcon, Save, Zap, ZapIcon } from "lucide-react"
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

export default function Sepet() {

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
            const response = await api.get(API_ENDPOINTS.sepetById + params.slug);
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


    const handleDurumChange = async (value: string) => {
        setIsLoading(true);
        setDurum(value);
        try {
        const response = await api.put(`${API_ENDPOINTS.siparisDurumUpdate}${params.slug}`,
            {durum: value}
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

    const breadcrumbData = [
        { name: 'Sepet Listesi', link: '/sepet/liste' },
        { name: params.slug ? 'Sepet Bilgileri' : 'Yeni Sepet', link: `/sepet/${params.slug}` }
    ];



    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex justify-between items-center">
                <div>
                    <BreadcrumbComp data={breadcrumbData} />
                </div>
                <div className="flex flex-row space-x-4">
                    
                    
                <div className="p-2 rounded-md bg-black text-white">Oluşturma Tarihi: {formatDate(data?.sepetAlt[0]?.create_date)}</div>
                <div className="p-2 rounded-md bg-black text-white">Güncelleme Tarihi: {formatDate(data?.sepetAlt[data?.sepetAlt.length - 1]?.update_date)}</div>
               

                </div>
            </div>
            <Separator className="my-5" />
         <div className="flex flex-row gap-2 justify-between">
        

       

         </div>
          

            <div className="w-full">
                <div className="flex flex-row gap-8">
                    {/* Sol Kolon */}
                    <div className="w-1/2 border p-4 rounded-md border-t-2 border-t-blue-500">
                        <div className="flex flex-col gap-2">
                            <Label className="text-lg font-bold">Müşteri Bilgileri</Label>
                            <div className="flex flex-col gap-2">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 text-sm rounded-md">
                                    {data?.sepet?.kodu} - {data?.sepet?.musteri_adi}</div>
                                <div className="flex flex-row gap-2 flex-wrap">
                                    <div className="flex flex-col gap-2 text-sm p-2 w-1/2">
                                        <Label className="font-bold">E-posta</Label>
                                        <div>{data?.sepet?.eposta}</div>
                                    </div>
                                    <div className="flex flex-col gap-2 text-sm p-2">
                                        <Label className="font-bold">Telefon</Label>
                                        <div>{data?.sepet?.telefon}</div>
                                    </div>
                                    <div className="flex flex-col gap-2 text-sm p-2 w-1/2">
                                        <Label className="font-bold">Vergi No</Label>
                                        <div>{data?.sepet?.vkntckn}</div>
                                    </div>
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
                                    {data?.sepetAlt?.map((item: any) => (
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
                                            <TableCell>{Number(item.fiyat).toFixed(2).replace('.', ',')}</TableCell>
                                            <TableCell>{Number(item.fiyat * item.miktar).toFixed(2).replace('.', ',')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="flex flex-row gap-2">
                                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-full text-center">
                                            <div className="font-bold text-sm">Ara Toplam</div>
                                            <div className="text-sm">
                                                {Number(
                                                    data?.sepetAlt?.reduce((total: number, item: any) => 
                                                        total + (Number(item.fiyat * item.miktar) || 0), 0)
                                                ).toFixed(2).replace('.', ',')}
                                            </div>
                                        </div>

                                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-full text-center">
                                            <div className="font-bold text-sm">İskonto</div>
                                            <div className="text-sm">
                                                {Number(
                                                    data?.sepetAlt?.reduce((total: number, item: any) => 
                                                        total + (Number(item.iskonto_tutari) || 0), 0)
                                                ).toFixed(2).replace('.', ',')}
                                            </div>
                                        </div>
                                      
                                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-full text-center">
                                            <div className="font-bold text-sm">Kdv</div>
                                            <div className="text-sm">
                                                {Number(
                                                    data?.sepetAlt?.reduce((total: number, item: any) => 
                                                        total + (Number(item.kdv_fiyat) || 0), 0)
                                                ).toFixed(2).replace('.', ',')}
                                            </div>
                                        </div>

                                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-full text-center">
                                            <div className="font-bold text-sm">Genel Toplam</div>
                                            <div className="text-sm">
                                                {Number(
                                                    data?.sepetAlt?.reduce((total: number, item: any) => 
                                                        total + (Number(item.fiyat * item.miktar) || 0), 0)
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