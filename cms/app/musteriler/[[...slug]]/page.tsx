'use client'
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_ENDPOINTS, API_BASE_URL_KATEGORI_RESIM } from "@/config/api";
import api from "@/services/api";
import { toast, useToast } from "@/hooks/use-toast";

import { ArrowLeft, DotIcon, Ellipsis, Loader2, PlusIcon, Save, Zap, ZapIcon } from "lucide-react"
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
import MusteriErpBul from "@/app/components/musteriErpBul";
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
    durum: number;
    sifre: string;
    sifre1: string;
}

// Tarih formatını ayarlayan yardımcı fonksiyon
const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm" formatında
};

export default function Musteriler() {

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
        fiyat_grup_id: 0,
        durum: 0,
        sifre: '',
        sifre1: ''
    });
    const [adreslerData, setAdreslerData] = useState<any[]>([]);
    const [fiyatGrupData, setFiyatGrupData] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(false);
 



    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.musterilerById + params.slug);
                if (response.status === 200) {
                    setFormData(response.data);
                }
            } catch (error) {
                toast({
                    title: "Hata!",
                    description: "Müşteri kaydı getirilirken bir hata oluştu.",
                    variant: "destructive",
                });
            }
        };
        const fetchAdreslerData = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.musterilerAdreslerListe + params.slug);
                if (response.status === 200) {
                    setAdreslerData(response.data);
                }
            } catch (error) {
                toast({
                    title: "Hata!",
                    description: "Müşteri kaydı getirilirken bir hata oluştu.",
                    variant: "destructive",
                });
            }
        };
        const fetchFiyatGrupData = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.musterilerFiyatGrupListe);
                if (response.status === 200) {
                    setFiyatGrupData(response.data.data);
                }
            } catch (error) {
                toast({
                    title: "Hata!",
                    description: "Fiyat grupları getirilirken bir hata oluştu.",
                    variant: "destructive",
                });
            }
        };

        // Fiyat grupları her zaman yüklensin (yeni müşteri ve düzenleme için gerekli)
        fetchFiyatGrupData();
        
        // Sadece slug varsa müşteri verilerini ve adresleri yükle
        if (params.slug) {
            fetchData();
            fetchAdreslerData();
        }
    }, [params.slug]);


    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (formData.ad === '' || formData.soyad === '' || formData.eposta ==='') {
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
                        description: "Müşteri kaydı başarıyla güncellendi.",
                        variant: "default",
                    });
                }
            } else {
                // Create new record
                const response = await api.post(API_ENDPOINTS.musterilerCreate, 
                    formData
                );
                if (response.data.status === 'success') {
                    router.push(`/musteriler/${response.data.id}`);
                    toast({
                        title: "Başarılı!",
                        description: "Müşteri kaydı başarıyla oluşturuldu.",
                        variant: "default",
                    });
                }
                else {
                    toast({
                        title: "Hata!",
                        description: response.data.message,
                        variant: "destructive",
                    });
                }
            }
        } catch (error: any) {
            toast({
                title: "Hata!",
                description: params.slug
                    ? "Müşteri kaydı güncellenirken bir hata oluştu."
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


    const DURUM_LABEL: Record<string, string> = {
        '0': 'Beklemede',
        '1': 'Onaylandı',
        '2': 'Onaylanmadı',
    };

    const handleDurumChange = async (value: string) => {
        setIsLoading(true);
        const updatedData = {
            ...formData,
            durum: Number(value)
        };
        const musteriAdi = [formData.ad, formData.soyad].filter(Boolean).join(' ');
        const durumLabel = DURUM_LABEL[value] || value;
        const logAction = {
            action: `Müşteri durumu "${durumLabel}" olarak güncellendi${musteriAdi ? ` — ${musteriAdi}` : ''}`,
            category: 'Müşteri',
        };

        try {
            const response = await api.put(
                `${API_ENDPOINTS.musterilerUpdate}${params.slug}`,
                updatedData,
                { _logAction: logAction } as object
            );
            if (response.data.status === 'success') {
                setFormData(updatedData); // Update state after successful API call
                toast({
                    title: "Başarılı!",
                    description: "Müşteri durumu başarıyla güncellendi.",
                    variant: "default",
                });
            }
        } catch (error) {
            toast({
                title: "Hata!",
                description: "Müşteri durumu güncellenirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };


    const breadcrumbData = [
        { name: 'Müşteri Listesi', link: '/musteriler/liste' },
        { name: params.slug ? 'Müşteri Düzenle' : 'Yeni Müşteri', link: `/musteriler/${params.slug}` }
    ];



    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex justify-between items-center">
                <div>
                    <BreadcrumbComp data={breadcrumbData} />
                </div>
                <div className="flex flex-row space-x-4">

{params.slug && (
    <Select value={formData.durum?.toString()} onValueChange={handleDurumChange} disabled={isLoading}>
    <SelectTrigger className="w-36">
        <SelectValue placeholder="Durum Seçiniz" />
    </SelectTrigger>
    <SelectContent>
        <SelectItem value="0">Beklemede</SelectItem>
        <SelectItem value="1">Onaylandı</SelectItem>
        <SelectItem value="2">Onaylanmadı</SelectItem>
    </SelectContent>
</Select>  
)}

                    {isLoading ? (
                        <Button disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Lütfen bekleyiniz...
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                            <Save className="h-4 w-4" />
                            Kaydet
                        </Button>
                    )}
                    {params.slug && (
                   <>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <ZapIcon className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem><Link href="/musteriler">Yeni Müşteri</Link></DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </>
                    )}

                </div>
            </div>
            <Separator className="my-5" />

            <div className="w-full max-w-screen-2xl">
                <div className="flex flex-row gap-8">
                    {/* Sol Kolon */}
                    <div className="w-1/2">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Kod</Label>
                                <div className="flex flex-row gap-2">
                                <Input
                                    className="w-full"
                                    name="kodu"
                                    value={formData.kodu}
                                    onChange={(e) => handleChange('kodu', e.target.value)}
                                />
                               <MusteriErpBul formData={formData} setFormData={setFormData} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Ad</Label>
                                <Input
                                    className="w-full"
                                    name="ad"
                                    value={formData.ad}
                                    onChange={(e) => handleChange('ad', e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Soyad</Label>
                                <Input
                                    className="w-full"
                                    name="soyad"
                                    value={formData.soyad}
                                    onChange={(e) => handleChange('soyad', e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>VKN/TCKN </Label>
                                <Input
                                    className="w-full"
                                    name="vkntckn"
                                    value={formData.vkntckn}
                                    onChange={(e) => handleChange('vkntckn', e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>E-Posta</Label>
                                <Input
                                    className="w-full"
                                    name="eposta"
                                    value={formData.eposta}
                                    onChange={(e) => handleChange('eposta', e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Telefon</Label>
                                <Input
                                    className="w-full"
                                    name="telefon"
                                    value={formData.telefon}
                                    onChange={(e) => handleChange('telefon', e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>İskonto Oranı</Label>
                                <Input
                                    className="w-full"
                                    name="iskonto_yuzde"
                                    value={formData.iskonto_yuzde?.toString() || '0'}
                                    onChange={(e) => handleChange('iskonto_yuzde', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Fiyat Grubu</Label>
                               <Select
                               disabled={true}
                                    name="fiyat_grup_id"
                                    value={formData.fiyat_grup_id?.toString()}
                                    onValueChange={(value) => handleChange('fiyat_grup_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Fiyat Grubu Seçiniz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Genel Fiyat Grubu</SelectItem>
                                        {fiyatGrupData && fiyatGrupData.map((fiyatGrup: any) => (
                                            <SelectItem key={fiyatGrup.id} value={fiyatGrup.id.toString()}>{fiyatGrup.adi}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Şifre</Label>
                                <Input
                                    className="w-full"
                                    name="sifre1"
                                    value={formData.sifre1}
                                    onChange={(e) => handleChange('sifre1', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sağ Kolon */}
                    <div className="w-1/2">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Adresler</Label>
                                <div className="flex flex-col gap-2">
                                    {adreslerData.map((adres) => (
                                        <div key={adres.id} className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md">
                                            <div className="flex flex-col gap-2">
                                                <div className="font-bold">{adres.adres_turu == "1" ? "Gönderim Adresi" : adres.adres_turu == "2" ? "Fatura Adresi" : "Gönderim + Fatura Adresi"}</div>
                                                <div>{adres.adres}
                                                {adres.ilce}
                                                {adres.il}
                                                {adres.ulke}
                                                {adres.posta_kodu}
                                                </div>
                                                <div>{adres.tel}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}