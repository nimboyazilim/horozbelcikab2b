'use client'
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_ENDPOINTS, API_BASE_URL_KATALOG_RESIM } from "@/config/api";
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
    images: string;
    dosya: string;
}

// Tarih formatını ayarlayan yardımcı fonksiyon
const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm" formatında
};

export default function Kataloglar() {

    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<Kategori>>({
        title: '',
        images: '',
        dosya: ''
    });
  
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [selectedDosya, setSelectedDosya] = useState<FileList | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setSelectedFiles(e.target.files);
    };

    const handleDosyaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setSelectedDosya(e.target.files);
    };




    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.katalogById + params.slug);
                if (response.status === 200) {
                    setFormData(response.data);
                }
            } catch (error) {
                toast({
                    title: "Hata!",
                    description: "Katalog kaydı getirilirken bir hata oluştu.",
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
            if (selectedDosya && selectedDosya[0]) {
                formDataToSend.append('dosya', selectedDosya[0]);
            }
           

            let response;
            if (params.slug) {
                // Update existing record
                response = await api.put(`${API_ENDPOINTS.katalogUpdate}${params.slug}`, 
                    formDataToSend
                );
                if (response && response.status === 200) {
                    toast({
                        title: "Başarılı!",
                        description: "Katalog kaydı başarıyla güncellendi.",
                        variant: "default",
                    });
                }
            } else {
                // Create new record
                response = await api.post(API_ENDPOINTS.katalogCreate, 
                    formDataToSend
                );
                if (response && response.status === 200) {
                    console.log(response.data);
                    router.push(`/kataloglar/${response.data.id}`);
                    toast({
                        title: "Başarılı!",
                        description: "Katalog kaydı başarıyla oluşturuldu.",
                        variant: "default",
                    });
                }
            }
        } catch (error: any) {
            toast({
                title: "Hata!",
                description: params.slug
                    ? "Katalog kaydı güncellenirken bir hata oluştu."
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
        { name: 'Kataloglar Listesi', link: '/kataloglar/liste' },
        { name: params.slug ? 'Katalog Düzenle' : 'Yeni Katalog', link: `/kataloglar/${params.slug}` }
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
                                <DropdownMenuItem><Link href="/kataloglar">Yeni Katalog</Link></DropdownMenuItem>
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
                                <Label>Katalog Başlığı</Label>
                                <Input
                                    className="w-full"
                                    name="title"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                />
                            </div>
                           
                            
                        </div>
                    </div>

                    {/* Sağ Kolon */}
                    <div className="w-1/2">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Katalog Resmi</Label>
                                <Input
                                    type="file"
                                    placeholder="Resim"
                                    name="images"
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                />
                                {formData.images && (
                                    <Image 
                                        src={`${API_BASE_URL_KATALOG_RESIM}/${formData.images}`} 
                                        alt="Resim" 
                                        width={100} 
                                        height={100} 
                                    />
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Katalog Dosyası</Label>
                                <Input
                                    type="file"
                                    placeholder="Dosya"
                                    name="dosya"
                                    onChange={handleDosyaSelect}
                                    accept="application/pdf"
                                />
                                {formData.dosya && (
                                    <Link href={`${API_BASE_URL_KATALOG_RESIM}/${formData.dosya}`} target="_blank">
                                        <Image 
                                            src={`${API_BASE_URL_KATALOG_RESIM}/${formData.images}`} 
                                            alt="Dosya" 
                                            width={100} 
                                            height={100} 
                                        />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}