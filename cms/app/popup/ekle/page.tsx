'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import api from '@/services/api';
import BreadcrumbComp from '@/app/components/breadcrumbComp';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function PopupEklePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title_tr: '',
        title_en: '',
        title_ru: '',
        title_ro: '',
        description_tr: '',
        description_en: '',
        description_ru: '',
        description_ro: '',
        link: '',
        is_active: '1',
        order1: '0',
        image: null as File | null
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.image) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Lütfen bir görsel seçin."
            });
            return;
        }

        try {
            setIsLoading(true);
            const submitData = new FormData();
            submitData.append('title_tr', formData.title_tr);
            submitData.append('title_en', formData.title_en);
            submitData.append('title_ru', formData.title_ru);
            submitData.append('title_ro', formData.title_ro);
            submitData.append('description_tr', formData.description_tr);
            submitData.append('description_en', formData.description_en);
            submitData.append('description_ru', formData.description_ru);
            submitData.append('description_ro', formData.description_ro);
            submitData.append('link', formData.link);
            submitData.append('is_active', formData.is_active);
            submitData.append('order1', formData.order1);
            submitData.append('image', formData.image);

            await api.post('/popup/create', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast({
                variant: "default",
                title: "Başarılı",
                description: "Pop-up başarıyla eklendi."
            });

            router.push('/popup/liste');
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Pop-up eklenirken bir hata oluştu."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const breadcrumbData = [
        { name: 'Pop-up Listesi', link: '/popup/liste' },
        { name: 'Yeni Pop-up Ekle', link: '/popup/ekle' },
    ];

    return (
        <div>
            <BreadcrumbComp data={breadcrumbData} />

            <div className="flex justify-between items-center mb-4 mt-8">
                <h1 className="text-3xl font-bold tracking-tight">Yeni Pop-up Ekle</h1>
            </div>

            <Separator className="my-4" />

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Görsel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="image">Görsel Seç *</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                required
                            />
                        </div>
                        {previewImage && (
                            <div className="mt-4">
                                <Label>Önizleme</Label>
                                <div className="relative w-64 h-64 mt-2">
                                    <Image
                                        src={previewImage}
                                        alt="Preview"
                                        fill
                                        className="object-contain rounded border"
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Türkçe İçerik</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title_tr">Başlık (TR) *</Label>
                            <Input
                                id="title_tr"
                                value={formData.title_tr}
                                onChange={(e) => setFormData({ ...formData, title_tr: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="description_tr">Açıklama (TR)</Label>
                            <Textarea
                                id="description_tr"
                                value={formData.description_tr}
                                onChange={(e) => setFormData({ ...formData, description_tr: e.target.value })}
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>İngilizce İçerik</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title_en">Başlık (EN)</Label>
                            <Input
                                id="title_en"
                                value={formData.title_en}
                                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="description_en">Açıklama (EN)</Label>
                            <Textarea
                                id="description_en"
                                value={formData.description_en}
                                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Rusça İçerik</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title_ru">Başlık (RU)</Label>
                            <Input
                                id="title_ru"
                                value={formData.title_ru}
                                onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="description_ru">Açıklama (RU)</Label>
                            <Textarea
                                id="description_ru"
                                value={formData.description_ru}
                                onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    {/* <CardHeader>
                        <CardTitle>Romence İçerik</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title_ro">Başlık (RO)</Label>
                            <Input
                                id="title_ro"
                                value={formData.title_ro}
                                onChange={(e) => setFormData({ ...formData, title_ro: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="description_ro">Açıklama (RO)</Label>
                            <Textarea
                                id="description_ro"
                                value={formData.description_ro}
                                onChange={(e) => setFormData({ ...formData, description_ro: e.target.value })}
                                rows={4}
                            />
                        </div>
                    </CardContent> */}
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Diğer Ayarlar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="link">Link (Opsiyonel)</Label>
                            <Input
                                id="link"
                                type="url"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                placeholder="https://ornek.com"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Görsele tıklandığında yönlendirilecek link
                            </p>
                        </div>
                        <div>
                            <Label htmlFor="is_active">Durum</Label>
                            <Select
                                value={formData.is_active}
                                onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Aktif</SelectItem>
                                    <SelectItem value="0">Pasif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="order1">Sıra</Label>
                            <Input
                                id="order1"
                                type="number"
                                value={formData.order1}
                                onChange={(e) => setFormData({ ...formData, order1: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/popup/liste')}
                    >
                        İptal
                    </Button>
                </div>
            </form>
        </div>
    );
}
