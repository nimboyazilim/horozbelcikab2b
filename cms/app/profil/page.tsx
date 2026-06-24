'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import api from '@/services/api';
import { Save, Loader2, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import BreadcrumbComp from '@/app/components/breadcrumbComp';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface FormData {
    ad: string;
    soyad: string;
    eposta: string;
    sifre: string;
    yeniSifre: string;
    yeniSifreTekrar: string;
}

export default function ProfilPage() {
    const { toast } = useToast();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        ad: '',
        soyad: '',
        eposta: '',
        sifre: '',
        yeniSifre: '',
        yeniSifreTekrar: ''
    });

    const breadcrumbData = [
        { name: 'Profil Bilgilerim', link: '/profil' }
    ];

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.userProfile);
            
            if (response.data.status === 'success') {
                const userData = response.data.user;
                setFormData(prev => ({
                    ...prev,
                    ad: userData.ad || '',
                    soyad: userData.soyad || '',
                    eposta: userData.eposta || ''
                }));
            }
        } catch (error) {
            toast({
                title: "Hata",
                description: "Profil bilgileri yüklenirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.ad.trim()) {
            toast({
                title: "Uyarı",
                description: "Ad alanı zorunludur.",
                variant: "destructive",
            });
            return false;
        }

        if (!formData.soyad.trim()) {
            toast({
                title: "Uyarı",
                description: "Soyad alanı zorunludur.",
                variant: "destructive",
            });
            return false;
        }

        if (!formData.eposta.trim()) {
            toast({
                title: "Uyarı",
                description: "E-posta alanı zorunludur.",
                variant: "destructive",
            });
            return false;
        }

        // Email formatı kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.eposta)) {
            toast({
                title: "Uyarı",
                description: "Geçerli bir e-posta adresi giriniz.",
                variant: "destructive",
            });
            return false;
        }

        // Şifre değişikliği kontrolü
        if (formData.yeniSifre || formData.yeniSifreTekrar) {
            if (!formData.sifre) {
                toast({
                    title: "Uyarı",
                    description: "Yeni şifre belirlemek için mevcut şifrenizi girmelisiniz.",
                    variant: "destructive",
                });
                return false;
            }

            if (formData.yeniSifre.length < 6) {
                toast({
                    title: "Uyarı",
                    description: "Yeni şifre en az 6 karakter olmalıdır.",
                    variant: "destructive",
                });
                return false;
            }

            if (formData.yeniSifre !== formData.yeniSifreTekrar) {
                toast({
                    title: "Uyarı",
                    description: "Yeni şifreler eşleşmiyor.",
                    variant: "destructive",
                });
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsSaving(true);

            const updateData: any = {
                ad: formData.ad,
                soyad: formData.soyad,
                eposta: formData.eposta
            };

            // Eğer şifre değiştiriliyor ise ekle
            if (formData.yeniSifre) {
                updateData.sifre = formData.sifre;
                updateData.yeniSifre = formData.yeniSifre;
            }

            const response = await api.put(API_ENDPOINTS.userProfileUpdate, updateData);

            if (response.data.status === 'success') {
                toast({
                    title: "Başarılı",
                    description: response.data.message || "Profil bilgileriniz güncellendi.",
                    variant: "default",
                });

                // Şifre alanlarını temizle
                setFormData(prev => ({
                    ...prev,
                    sifre: '',
                    yeniSifre: '',
                    yeniSifreTekrar: ''
                }));
                
                // Profil bilgilerini yeniden yükle
                await fetchProfileData();
            } else {
                toast({
                    title: "Hata",
                    description: response.data.message || "Profil güncellenirken bir hata oluştu.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error.response?.data?.message || "Profil güncellenirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="w-full">
            <BreadcrumbComp data={breadcrumbData} />
            
            <div className="flex items-center justify-between mb-6 mt-6">
                <div>
                    <h1 className="text-2xl font-bold">Profil Bilgilerim</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Kişisel bilgilerinizi ve şifrenizi buradan güncelleyebilirsiniz.
                    </p>
                </div>
            </div>

            <Separator className="mb-6" />

            <div className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Kişisel Bilgiler
                            </CardTitle>
                            <CardDescription>
                                Ad, soyad ve e-posta bilgileriniz
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ad">Ad *</Label>
                                    <Input
                                        id="ad"
                                        value={formData.ad}
                                        onChange={(e) => handleChange('ad', e.target.value)}
                                        placeholder="Adınız"
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="soyad">Soyad *</Label>
                                    <Input
                                        id="soyad"
                                        value={formData.soyad}
                                        onChange={(e) => handleChange('soyad', e.target.value)}
                                        placeholder="Soyadınız"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="eposta" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    E-posta *
                                </Label>
                                <Input
                                    id="eposta"
                                    type="email"
                                    value={formData.eposta}
                                    onChange={(e) => handleChange('eposta', e.target.value)}
                                    placeholder="ornek@email.com"
                                    disabled={isSaving}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Şifre Değiştir
                            </CardTitle>
                            <CardDescription>
                                Şifrenizi değiştirmek isterseniz aşağıdaki alanları doldurun. 
                                Şifrenizi değiştirmek istemiyorsanız boş bırakın.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="sifre">Mevcut Şifre</Label>
                                <div className="relative">
                                    <Input
                                        id="sifre"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.sifre}
                                        onChange={(e) => handleChange('sifre', e.target.value)}
                                        placeholder="Mevcut şifreniz"
                                        disabled={isSaving}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isSaving}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="yeniSifre">Yeni Şifre</Label>
                                <div className="relative">
                                    <Input
                                        id="yeniSifre"
                                        type={showNewPassword ? "text" : "password"}
                                        value={formData.yeniSifre}
                                        onChange={(e) => handleChange('yeniSifre', e.target.value)}
                                        placeholder="Yeni şifreniz (en az 6 karakter)"
                                        disabled={isSaving}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        disabled={isSaving}
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="yeniSifreTekrar">Yeni Şifre Tekrar</Label>
                                <div className="relative">
                                    <Input
                                        id="yeniSifreTekrar"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.yeniSifreTekrar}
                                        onChange={(e) => handleChange('yeniSifreTekrar', e.target.value)}
                                        placeholder="Yeni şifrenizi tekrar girin"
                                        disabled={isSaving}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={isSaving}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button 
                            type="submit" 
                            disabled={isSaving}
                            className="min-w-[150px]"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Kaydet
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
