'use client'
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_ENDPOINTS, API_BASE_URL_KATEGORI_RESIM } from "@/config/api";
import api from "@/services/api";
import { toast, useToast } from "@/hooks/use-toast";

import { ArrowLeft, Loader2, PlusIcon, Save, Zap, ZapIcon } from "lucide-react"
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
interface Kategori {
    id: number;
    kategori_adi: string;
    kategori_adi_en: string;
    kategori_adi_tr: string;
    kategori_seo: string;
    kategori_ust_id: number;
    kategori_ikon: string;
    kategori_resim: string;
}

// Tarih formatını ayarlayan yardımcı fonksiyon
const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm" formatında
};

export default function Kategoriler() {

    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<Kategori>>({
        kategori_ust_id: 0,
        kategori_adi: '',
        kategori_adi_en: '',
        kategori_adi_tr: '',
        kategori_seo: '',
        kategori_ikon: '',
        kategori_resim: ''
    });
    const [open, setOpen] = useState(false)
    const [kategoriUstleri, setKategoriUstleri] = useState<Kategori[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [selectedFiles1, setSelectedFiles1] = useState<FileList | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setSelectedFiles(e.target.files);
    };

    const handleFileSelect1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setSelectedFiles1(e.target.files);
    };



    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.kategoriById + params.slug);
                if (response.status === 200) {
                    setFormData(response.data);
                }
            } catch (error) {
                toast({
                    title: "Hata!",
                    description: "Servis kaydı getirilirken bir hata oluştu.",
                    variant: "destructive",
                });
            }
        };

        if (params.slug) {
            fetchData();
        }
    }, [params.slug]);

    const kategoriUstleriFetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.kategoriListe);
            setKategoriUstleri(response.data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Kategori üstleri yüklenirken bir hata oluştu."
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        kategoriUstleriFetchData();
    }, []);


    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (formData.kategori_adi === '' || formData.kategori_seo === '') {
                toast({
                    title: "Hata!",
                    description: "Lütfen tüm alanları doldurunuz.",
                    variant: "destructive",
                });
                return;
            }

            const formDataToSend = new FormData();

            // Normal form verilerini ekle
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formDataToSend.append(key, String(value));
                }
            });

            // Dosyaları ekle
            if (selectedFiles && selectedFiles[0]) {
                formDataToSend.append('kategori_ikon', selectedFiles[0]);
            }
            if (selectedFiles1 && selectedFiles1[0]) {
                formDataToSend.append('kategori_resim', selectedFiles1[0]);
            }

            let response;
            if (params.slug) {
                // Update existing record
                response = await api.put(`${API_ENDPOINTS.kategoriUpdate}${params.slug}`, 
                    formDataToSend
                );
                if (response.status === 200) {
                    toast({
                        title: "Başarılı!",
                        description: "Kategori kaydı başarıyla güncellendi.",
                        variant: "default",
                    });
                }
            } else {
                // Create new record
                response = await api.post(API_ENDPOINTS.kategoriCreate, 
                    formDataToSend
                );
                if (response.status === 200) {
                    router.push(`/kategoriler/${response.data.id}`);
                    toast({
                        title: "Başarılı!",
                        description: "Kategori kaydı başarıyla oluşturuldu.",
                        variant: "default",
                    });
                }
            }
        } catch (error: any) {
            toast({
                title: "Hata!",
                description: params.slug
                    ? "Kategori kaydı güncellenirken bir hata oluştu."
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
            [field]: value
        }));
    };

    const breadcrumbData = [
        { name: 'Kategori Listesi', link: '/kategoriler/liste' },
        { name: params.slug ? 'Kategori Düzenle' : 'Yeni Kategori', link: `/kategoriler/${params.slug}` }
    ];



    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex justify-between items-center">
                <div>
                    <BreadcrumbComp data={breadcrumbData} />
                </div>
                <div className="flex flex-row space-x-4">
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <ZapIcon className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem><Link href="/kategoriler">Yeni Kategori</Link></DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                                <Label>Kategori Adı (İngilizce)</Label>
                                <Input
                                    className="w-full"
                                    name="kategori_adi"
                                    value={formData.kategori_adi}
                                    onChange={(e) => handleChange('kategori_adi', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Kategori Adı (Rusça)</Label>
                                <Input
                                    className="w-full"
                                    name="kategori_adi_en"
                                    value={formData.kategori_adi_en || ''}
                                    onChange={(e) => handleChange('kategori_adi_en', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Kategori Adı (Türkçe)</Label>
                                <Input
                                    className="w-full"
                                    name="kategori_adi_tr"
                                    value={formData.kategori_adi_tr || ''}
                                    onChange={(e) => handleChange('kategori_adi_tr', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Kategori Seo</Label>
                                <Input
                                    className="w-full"
                                    name="kategori_seo"
                                    value={formData.kategori_seo}
                                    onChange={(e) => handleChange('kategori_seo', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Kategori Üst</Label>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-full justify-between"
                                        >
                                            {kategoriUstleri.find((kategoriUst) => kategoriUst.id === formData.kategori_ust_id)?.kategori_adi || "Kategori Üst Seçiniz"}
                                            <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Kategori Üst Seçiniz" className="h-9" />
                                            <CommandList>
                                                <CommandEmpty>Kategori üstleri bulunamadı.</CommandEmpty>
                                                <CommandGroup>
                                                    {kategoriUstleri.map((kategoriUst) => (
                                                        <CommandItem
                                                            key={kategoriUst.id}
                                                            value={String(kategoriUst.id)}
                                                            onSelect={() => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    kategori_ust_id: kategoriUst.id === formData.kategori_ust_id ? 0 : kategoriUst.id
                                                                }));
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            {kategoriUst.kategori_adi}
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto",
                                                                    formData.kategori_ust_id === kategoriUst.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    {/* Sağ Kolon */}
                    <div className="w-1/2">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Kategori İkonu</Label>
                                <Input
                                    type="file"
                                    placeholder="İkon"
                                    name="kategori_ikon"
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                />
                                {formData.kategori_ikon && (
                                    <Image 
                                        src={`${API_BASE_URL_KATEGORI_RESIM}/${formData.kategori_ikon}`} 
                                        alt="İkon" 
                                        width={100} 
                                        height={100} 
                                    />
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Kategori Resmi</Label>
                                <Input
                                    type="file"
                                    placeholder="Resim"
                                    name="kategori_resim"
                                    onChange={handleFileSelect1}
                                    accept="image/*"
                                />
                                {formData.kategori_resim && (
                                    <Image 
                                        src={`${API_BASE_URL_KATEGORI_RESIM}/${formData.kategori_resim}`} 
                                        alt="Resim" 
                                        width={100} 
                                        height={100} 
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}