'use client'
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_ENDPOINTS, API_BASE_URL_HABERLER_RESIM } from "@/config/api";
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


import Image from "next/image";
import dynamic from "next/dynamic";


// Zengin metin editörü dinamik olarak import edilir
const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), {
    ssr: false,
    loading: () => (
        <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 p-4 h-32">
            <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    ),
});



interface Kategori {
    id: number;
    title: string;
    title_en?: string;
    title_ru?: string;
    long_article: string;
    long_article_en?: string;
    long_article_ru?: string;
    images: string;
}

// Tarih formatını ayarlayan yardımcı fonksiyon
const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm" formatında
};



export default function Haberler() {

    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<Kategori>>({
        title: '',
        title_en: '',
        title_ru: '',
        long_article: '',
        long_article_en: '',
        long_article_ru: '',
        images: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setSelectedFiles(e.target.files);
    };




    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.webHaberById + params.slug);
                if (response.status === 200) {
                    console.log(response.data);
                    // Null değerleri boş string'e çevir
                    const cleanedData = {
                        ...response.data,
                        title: response.data.title || '',
                        title_en: response.data.title_en || '',
                        title_ru: response.data.title_ru || '',
                        long_article: response.data.long_article || '',
                        long_article_en: response.data.long_article_en || '',
                        long_article_ru: response.data.long_article_ru || '',
                        images: response.data.images || ''
                    };
                    setFormData(cleanedData);
                }
            } catch (error) {
                toast({
                    title: "Hata!",
                    description: "Slider kaydı getirilirken bir hata oluştu.",
                    variant: "destructive",
                });
            }
        };

        if (params.slug) {
            fetchData();
        }
    }, [params.slug]);



    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (formData.title === '') {
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
                formDataToSend.append('images', selectedFiles[0]);
            }


            let response;
            if (params.slug) {
                // Update existing record
                response = await api.put(`${API_ENDPOINTS.webHaberUpdate}${params.slug}`,
                    formDataToSend
                );
                if (response && response.status === 200) {
                    toast({
                        title: "Başarılı!",
                        description: "Haber kaydı başarıyla güncellendi.",
                        variant: "default",
                    });
                }
            } else {
                // Create new record
                response = await api.post(API_ENDPOINTS.webHaberCreate,
                    formDataToSend
                );
                if (response && response.status === 200) {
                    console.log(response.data);
                    router.push(`/haberler/${response.data.kayitlar[0].id}`);
                    toast({
                        title: "Başarılı!",
                        description: "Haber kaydı başarıyla oluşturuldu.",
                        variant: "default",
                    });
                }
            }
        } catch (error: any) {
            toast({
                title: "Hata!",
                description: params.slug
                    ? "Haber kaydı güncellenirken bir hata oluştu."
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
        { name: 'Haberler Listesi', link: '/haberler/liste' },
        { name: params.slug ? 'Haber Düzenle' : 'Yeni Haber', link: `/haberler/${params.slug}` }
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
                                <DropdownMenuItem><Link href="/haberler">Yeni Haber</Link></DropdownMenuItem>
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
                            {/* Türkçe Başlık */}
                            <div className="flex flex-col gap-2">
                                <Label>Haber Başlığı (TR)</Label>
                                <Input
                                    className="w-full"
                                    name="title"
                                    value={formData.title || ''}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                />
                            </div>

                            {/* İngilizce Başlık */}
                            <div className="flex flex-col gap-2">
                                <Label>Haber Başlığı (EN)</Label>
                                <Input
                                    className="w-full"
                                    name="title_en"
                                    value={formData.title_en || ''}
                                    onChange={(e) => handleChange('title_en', e.target.value)}
                                />
                            </div>

                            {/* Rusça Başlık */}
                            <div className="flex flex-col gap-2">
                                <Label>Haber Başlığı (RU)</Label>
                                <Input
                                    className="w-full"
                                    name="title_ru"
                                    value={formData.title_ru || ''}
                                    onChange={(e) => handleChange('title_ru', e.target.value)}
                                />
                            </div>

                            {/* Türkçe İçerik */}
                            <div className="flex flex-col gap-2">
                                <Label className="text-lg font-bold">Haber İçeriği (TR)</Label>
                             <RichTextEditor
  value={formData.long_article || ''}
  onChange={(c) => handleChange('long_article', c)}
/>
                            </div>

                            {/* İngilizce İçerik */}
                            <div className="flex flex-col gap-2">
                                <Label className="text-lg font-bold">Haber İçeriği (EN)</Label>
                              <RichTextEditor
  value={formData.long_article_en || ''}
  onChange={(c) => handleChange('long_article_en', c)}
/>
                            </div>

                            {/* Rusça İçerik */}
                            <div className="flex flex-col gap-2">
                                <Label className="text-lg font-bold">Haber İçeriği (RU)</Label>
                           <RichTextEditor
  value={formData.long_article_ru || ''}
  onChange={(c) => handleChange('long_article_ru', c)}
/>
                            </div>
                        </div>
                    </div>

                    {/* Sağ Kolon */}
                    <div className="w-1/2">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Haber Resmi</Label>
                                <Input
                                    type="file"
                                    placeholder="Resim"
                                    name="images"
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                />
                                {formData.images && (
                                    <Image
                                        src={`${API_BASE_URL_HABERLER_RESIM}/${formData.images}`}
                                        alt="Resim"
                                        width={300}
                                        height={300}
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