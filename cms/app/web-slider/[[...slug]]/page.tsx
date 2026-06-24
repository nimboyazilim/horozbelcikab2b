'use client'
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_ENDPOINTS, API_BASE_URL_SLIDER_RESIM } from "@/config/api";
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
interface Kategori {
    id: number;
    title: string;
    title_tr: string;
    title_en: string;
    title_ru: string;
    description: string;
    description_tr: string;
    description_en: string;
    description_ru: string;
    url: string;
    images: string;
    type?: string;
    video_url?: string;

}

// Tarih formatını ayarlayan yardımcı fonksiyon
const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm" formatında
};

export default function WebSlider() {

    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<Kategori>>({
        title: '',
        title_tr: '',
        title_en: '',
        title_ru: '',
        description_tr: '',
        description_en: '',
        description_ru: '',
        description: '',
        url: '',
        images: '',
        type: 'image'
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
                const response = await api.get(API_ENDPOINTS.webSliderById + params.slug);
                if (response.status === 200) {
                    setFormData(response.data);
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
            if (!formData.title_tr || !formData.title_en || !formData.title_ru ||
                !formData.description_tr || !formData.description_en || !formData.description_ru ||
                !formData.type) {
                toast({
                    title: "Hata!",
                    description: "Lütfen tüm alanları doldurunuz.",
                    variant: "destructive",
                });
                return;
            }

            // Yeni kayıt için resim/video zorunlu
            if (!params.slug && (!selectedFiles || !selectedFiles[0])) {
                toast({
                    title: "Hata!",
                    description: "Lütfen bir resim veya video seçiniz.",
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
                response = await api.put(`${API_ENDPOINTS.webSliderUpdate}${params.slug}`,
                    formDataToSend
                );
                if (response && response.status === 200) {
                    toast({
                        title: "Başarılı!",
                        description: "Slider kaydı başarıyla güncellendi.",
                        variant: "default",
                    });
                }
            } else {
                // Create new record
                response = await api.post(API_ENDPOINTS.webSliderCreate,
                    formDataToSend
                );
                if (response && response.status === 200) {
                    console.log(response.data);
                    router.push(`/web-slider/${response.data.kayitlar[0].id}`);
                    toast({
                        title: "Başarılı!",
                        description: "Slider kaydı başarıyla oluşturuldu.",
                        variant: "default",
                    });
                }
            }
        } catch (error: any) {
            toast({
                title: "Hata!",
                description: params.slug
                    ? "Slider kaydı güncellenirken bir hata oluştu."
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
        { name: 'Web Slider Listesi', link: '/web-slider/liste' },
        { name: params.slug ? 'Web Slider Düzenle' : 'Yeni Web Slider', link: `/web-slider/${params.slug}` }
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
                                <DropdownMenuItem><Link href="/web-slider">Yeni Slider</Link></DropdownMenuItem>
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
                                <Label>Slider Başlığı (TR)</Label>
                                <Input className="w-full" name="title_tr" value={formData.title_tr || ''} onChange={e => handleChange('title_tr', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Slider Başlığı (EN)</Label>
                                <Input className="w-full" name="title_en" value={formData.title_en || ''} onChange={e => handleChange('title_en', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Slider Başlığı (RU)</Label>
                                <Input className="w-full" name="title_ru" value={formData.title_ru || ''} onChange={e => handleChange('title_ru', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Slider Açıklaması (TR)</Label>
                                <Input className="w-full" name="description_tr" value={formData.description_tr || ''} onChange={e => handleChange('description_tr', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Slider Açıklaması (EN)</Label>
                                <Input className="w-full" name="description_en" value={formData.description_en || ''} onChange={e => handleChange('description_en', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Slider Açıklaması (RU)</Label>
                                <Input className="w-full" name="description_ru" value={formData.description_ru || ''} onChange={e => handleChange('description_ru', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Slider Url</Label>
                                <Input
                                    className="w-full"
                                    name="url"
                                    value={formData.url}
                                    onChange={(e) => handleChange('url', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Slider Türü</Label>
                                <select
                                    className="w-full border rounded-md p-2"
                                    value={formData.type || 'image'}
                                    onChange={e => handleChange('type', e.target.value)}
                                >
                                    <option value="image">Resim</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>

                        </div>
                    </div>

                    {/* Sağ Kolon */}
                    <div className="w-1/2">
                        <div className="flex flex-col gap-4">
                            {(formData.type === 'image' || !formData.type) && (
                                <div className="flex flex-col gap-2">
                                    <Label>Slider Resmi</Label>
                                    <Input
                                        type="file"
                                        placeholder="Resim"
                                        name="images"
                                        onChange={handleFileSelect}
                                        accept="image/*"
                                    />
                                    {formData.images && (
                                        <div className="mt-2">
                                            {formData.images.includes('.mp4') || formData.images.includes('.webm') || formData.images.includes('.mov') ? (
                                                <video width={300} height={200} controls>
                                                    <source src={`${API_BASE_URL_SLIDER_RESIM}/${formData.images}`} type="video/mp4" />
                                                    Tarayıcınız video etiketini desteklemiyor.
                                                </video>
                                            ) : (
                                                <Image
                                                    src={`${API_BASE_URL_SLIDER_RESIM}/${formData.images}`}
                                                    alt="Resim"
                                                    width={300}
                                                    height={300}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {formData.type === 'video' && (
                                <div className="flex flex-col gap-2">
                                    <Label>Video Dosyası</Label>
                                    <Input
                                        type="file"
                                        placeholder="Video"
                                        name="images"
                                        onChange={handleFileSelect}
                                        accept="video/*"
                                    />
                                    {formData.images && (
                                        <video width={300} height={200} controls>
                                            <source src={`${API_BASE_URL_SLIDER_RESIM}/${formData.images}`} type="video/mp4" />
                                            Tarayıcınız video etiketini desteklemiyor.
                                        </video>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}