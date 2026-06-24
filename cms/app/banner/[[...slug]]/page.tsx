'use client'
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_ENDPOINTS, API_BASE_URL_RESIM_BANNER } from '@/config/api';
import api from '@/services/api';
import { useToast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from 'next/dist/client/components/navigation';
import { Separator } from "@/components/ui/separator";
import BreadcrumbComp from "@/app/components/breadcrumbComp";
import Image from "next/image";

export default function BannerPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        title_tr: '',
        title_en: '',
        title_ru: '',
        description_tr: '',
        description_en: '',
        description_ru: '',
        description: '',
        button_text: '',
        button_text_tr: '',
        button_text_en: '',
        button_text_ru: '',
        button_url: '',
        image: ''
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
                const response = await api.get(API_ENDPOINTS.bannerById + params.slug);
                if (response.status === 200) setFormData(response.data);
            } catch (error) {
                toast({ title: "Hata!", description: "Banner kaydı getirilirken bir hata oluştu.", variant: "destructive" });
            }
        };
        if (params.slug) fetchData();
    }, [params.slug]);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (!formData.title_tr || !formData.title_en || !formData.title_ru ||
                !formData.description_tr || !formData.description_en || !formData.description_ru) {
                toast({ title: "Hata!", description: "Lütfen tüm alanları doldurunuz.", variant: "destructive" });
                return;
            }
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) formDataToSend.append(key, String(value));
            });
            if (selectedFiles && selectedFiles[0]) formDataToSend.append('image', selectedFiles[0]);
            let response;
            if (params.slug) {
                response = await api.put(`${API_ENDPOINTS.bannerUpdate}${params.slug}`, formDataToSend);
                if (response && response.status === 200) {
                    toast({ title: "Başarılı!", description: "Banner kaydı başarıyla güncellendi.", variant: "default" });
                }
            } else {
                response = await api.post(API_ENDPOINTS.bannerCreate, formDataToSend);
                if (response && response.status === 200) {
                    router.push(`/banner/${response.data.id}`);
                    toast({ title: "Başarılı!", description: "Banner kaydı başarıyla oluşturuldu.", variant: "default" });
                }
            }
        } catch (error: any) {
            toast({ title: "Hata!", description: error.response?.data?.message || "Bir hata oluştu.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const breadcrumbData = [
        { name: 'Banner Listesi', link: '/banner/liste' },
        { name: params.slug ? 'Banner Düzenle' : 'Yeni Banner', link: `/banner/${params.slug}` }
    ];

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex justify-between items-center">
                <div>
                    <BreadcrumbComp data={breadcrumbData} />
                </div>
                <div>
                    <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                        Kaydet
                    </Button>
                </div>
            </div>
            <Separator className="my-5" />
            <div className="w-full max-w-screen-2xl">
                <div className="flex flex-row gap-8">
                    {/* Sol Kolon */}
                    <div className="w-1/2">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Banner Başlığı (TR)</Label>
                                <Input className="w-full" name="title_tr" value={formData.title_tr || ''} onChange={(e) => handleChange('title_tr', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Banner Başlığı (EN)</Label>
                                <Input className="w-full" name="title_en" value={formData.title_en || ''} onChange={(e) => handleChange('title_en', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Banner Başlığı (RU)</Label>
                                <Input className="w-full" name="title_ru" value={formData.title_ru || ''} onChange={(e) => handleChange('title_ru', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Banner Açıklaması (TR)</Label>
                                <Input className="w-full" name="description_tr" value={formData.description_tr || ''} onChange={(e) => handleChange('description_tr', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Banner Açıklaması (EN)</Label>
                                <Input className="w-full" name="description_en" value={formData.description_en || ''} onChange={(e) => handleChange('description_en', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Banner Açıklaması (RU)</Label>
                                <Input className="w-full" name="description_ru" value={formData.description_ru || ''} onChange={(e) => handleChange('description_ru', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Buton Metni (TR)</Label>
                                <Input className="w-full" name="button_text_tr" value={formData.button_text_tr || ''} onChange={(e) => handleChange('button_text_tr', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Buton Metni (EN)</Label>
                                <Input className="w-full" name="button_text_en" value={formData.button_text_en || ''} onChange={(e) => handleChange('button_text_en', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Buton Metni (RU)</Label>
                                <Input className="w-full" name="button_text_ru" value={formData.button_text_ru || ''} onChange={(e) => handleChange('button_text_ru', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Buton Linki</Label>
                                <Input className="w-full" name="button_url" value={formData.button_url} onChange={(e) => handleChange('button_url', e.target.value)} />
                            </div>
                        </div>
                    </div>
                    {/* Sağ Kolon */}
                    <div className="w-1/2">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Banner Resmi</Label>
                                <Input type="file" placeholder="Resim" name="image" onChange={handleFileSelect} accept="image/*" />
                                {formData.image && (
                                    <Image src={`${API_BASE_URL_RESIM_BANNER}/${formData.image}`} alt="Resim" width={300} height={300} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}