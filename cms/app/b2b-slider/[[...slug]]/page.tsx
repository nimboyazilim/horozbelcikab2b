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
    description: string;
    url: string;
    images: string;
}

// Tarih formatını ayarlayan yardımcı fonksiyon
const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm" formatında
};

export default function B2bSlider() {

    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<Kategori>>({
        title: '',
        description: '',
        url: '',
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
                const response = await api.get(API_ENDPOINTS.b2bSliderById + params.slug);
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
            if (formData.title === '' || formData.description === '') {
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
                response = await api.put(`${API_ENDPOINTS.b2bSliderUpdate}${params.slug}`, 
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
                response = await api.post(API_ENDPOINTS.b2bSliderCreate, 
                    formDataToSend
                );
                if (response && response.status === 200) {
                    console.log(response.data);
                    router.push(`/b2b-slider/${response.data.kayitlar[0].id}`);
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
        { name: 'B2B Slider Listesi', link: '/b2b-slider/liste' },
        { name: params.slug ? 'B2B Slider Düzenle' : 'Yeni B2B Slider', link: `/b2b-slider/${params.slug}` }
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
                                <DropdownMenuItem><Link href="/b2b-slider">Yeni Slider</Link></DropdownMenuItem>
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
                                <Label>Slider Başlığı</Label>
                                <Input
                                    className="w-full"
                                    name="title"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Slider Açıklaması</Label>
                                <Input
                                    className="w-full"
                                    name="description"
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                />
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
                            
                        </div>
                    </div>

                    {/* Sağ Kolon */}
                    <div className="w-1/2">
                        <div className="flex flex-col gap-4">
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
                                    <Image 
                                        src={`${API_BASE_URL_SLIDER_RESIM}/${formData.images}`} 
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