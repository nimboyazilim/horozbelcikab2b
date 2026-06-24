'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import api from '@/services/api';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import BreadcrumbComp from '@/app/components/breadcrumbComp';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface FormData {
    ad: string;
    soyad: string;
    eposta: string;
    sifre: string;
    sifre_tekrar: string;
    durum: number;
}

export default function KullanicilarPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string[];
    const userId = slug && slug.length > 0 ? slug[0] : null;
    const isEditMode = !!userId;

    const [isLoading, setIsLoading] = useState(false);
    const [originalDurum, setOriginalDurum] = useState<number | null>(null);
    const [formData, setFormData] = useState<FormData>({
        ad: '',
        soyad: '',
        eposta: '',
        sifre: '',
        sifre_tekrar: '',
        durum: 1
    });

    const breadcrumbData = [
        { name: 'Kullanıcılar', link: '/kullanicilar/liste' },
        { name: isEditMode ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı', link: '#' }
    ];

    useEffect(() => {
        if (isEditMode && userId) {
            fetchUserData();
        }
    }, [userId, isEditMode]);

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`${API_ENDPOINTS.userById}${userId}`);
            const userData = response.data;
            
            setFormData({
                ad: userData.ad || '',
                soyad: userData.soyad || '',
                eposta: userData.eposta || '',
                sifre: '',
                sifre_tekrar: '',
                durum: userData.durum || 1
            });
            setOriginalDurum(userData.durum ?? null);
        } catch (error) {
            toast({
                title: "Hata",
                description: "Kullanıcı bilgileri yüklenirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof FormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.ad.trim()) {
            toast({
                title: "Hata",
                description: "Ad alanı zorunludur.",
                variant: "destructive",
            });
            return false;
        }

        if (!formData.soyad.trim()) {
            toast({
                title: "Hata",
                description: "Soyad alanı zorunludur.",
                variant: "destructive",
            });
            return false;
        }

        if (!formData.eposta.trim()) {
            toast({
                title: "Hata",
                description: "E-posta alanı zorunludur.",
                variant: "destructive",
            });
            return false;
        }

        // E-posta formatı kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.eposta)) {
            toast({
                title: "Hata",
                description: "Geçerli bir e-posta adresi giriniz.",
                variant: "destructive",
            });
            return false;
        }

        if (!isEditMode) {
            if (!formData.sifre.trim()) {
                toast({
                    title: "Hata",
                    description: "Şifre alanı zorunludur.",
                    variant: "destructive",
                });
                return false;
            }

            if (formData.sifre.length < 6) {
                toast({
                    title: "Hata",
                    description: "Şifre en az 6 karakter olmalıdır.",
                    variant: "destructive",
                });
                return false;
            }

            if (formData.sifre !== formData.sifre_tekrar) {
                toast({
                    title: "Hata",
                    description: "Şifreler eşleşmiyor.",
                    variant: "destructive",
                });
                return false;
            }
        } else {
            // Güncelleme modunda şifre girilmişse kontrol et
            if (formData.sifre.trim()) {
                if (formData.sifre.length < 6) {
                    toast({
                        title: "Hata",
                        description: "Şifre en az 6 karakter olmalıdır.",
                        variant: "destructive",
                    });
                    return false;
                }

                if (formData.sifre !== formData.sifre_tekrar) {
                    toast({
                        title: "Hata",
                        description: "Şifreler eşleşmiyor.",
                        variant: "destructive",
                    });
                    return false;
                }
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);

            const submitData: any = {
                ad: formData.ad.trim(),
                soyad: formData.soyad.trim(),
                eposta: formData.eposta.trim(),
                durum: formData.durum
            };

            // Şifre sadece girilmişse ekle
            if (formData.sifre.trim()) {
                submitData.sifre = formData.sifre;
            }

            const tamAd = [formData.ad.trim(), formData.soyad.trim()].filter(Boolean).join(' ');
            let logAction: { action: string; category: string };
            if (isEditMode) {
                const durumDegistu = originalDurum !== null && originalDurum !== formData.durum;
                if (durumDegistu) {
                    logAction = {
                        action: formData.durum === 1
                            ? `Kullanıcı aktife çekildi: "${tamAd}"`
                            : `Kullanıcı pasife çekildi: "${tamAd}"`,
                        category: 'Kullanıcı',
                    };
                } else {
                    logAction = { action: `Kullanıcı bilgileri güncellendi: "${tamAd}"`, category: 'Kullanıcı' };
                }
            } else {
                logAction = { action: `Yeni kullanıcı oluşturuldu: "${tamAd}"`, category: 'Kullanıcı' };
            }

            let response;
            if (isEditMode) {
                response = await api.put(`${API_ENDPOINTS.userUpdate}${userId}`, submitData, { _logAction: logAction } as object);
            } else {
                response = await api.post(API_ENDPOINTS.userCreate, submitData, { _logAction: logAction } as object);
            }

            if (response.data.status === 'success') {
                toast({
                    title: "Başarılı",
                    description: response.data.message,
                });

                if (!isEditMode && response.data.user_id) {
                    // Yeni kullanıcı oluşturulduysa güncelleme sayfasına yönlendir
                    router.push(`/kullanicilar/${response.data.user_id}`);
                } else {
                    // Güncelleme başarılıysa liste sayfasına dön
                    router.push('/kullanicilar/liste');
                }
            } else {
                toast({
                    title: "Hata",
                    description: response.data.message || "Bir hata oluştu.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error.response?.data?.message || "Bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            const response = await api.delete(`${API_ENDPOINTS.userDelete}${userId}`);
            
            if (response.data.status === 'success') {
                toast({
                    title: "Başarılı",
                    description: response.data.message,
                });
                router.push('/kullanicilar/liste');
            } else {
                toast({
                    title: "Hata",
                    description: response.data.message || "Bir hata oluştu.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error.response?.data?.message || "Bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && isEditMode) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <BreadcrumbComp data={breadcrumbData} />
                <Link href="/kullanicilar/liste">
                    <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Geri Dön
                    </Button>
                </Link>
            </div>

            <Separator className="my-5" />

            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h1 className="text-2xl font-bold mb-6">
                        {isEditMode ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
                    </h1>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ad">Ad *</Label>
                                <Input
                                    id="ad"
                                    value={formData.ad}
                                    onChange={(e) => handleChange('ad', e.target.value)}
                                    placeholder="Ad"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="soyad">Soyad *</Label>
                                <Input
                                    id="soyad"
                                    value={formData.soyad}
                                    onChange={(e) => handleChange('soyad', e.target.value)}
                                    placeholder="Soyad"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="eposta">E-posta *</Label>
                            <Input
                                id="eposta"
                                type="email"
                                value={formData.eposta}
                                onChange={(e) => handleChange('eposta', e.target.value)}
                                placeholder="ornek@email.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sifre">
                                    Şifre {!isEditMode && '*'}
                                </Label>
                                <Input
                                    id="sifre"
                                    type="password"
                                    value={formData.sifre}
                                    onChange={(e) => handleChange('sifre', e.target.value)}
                                    placeholder={isEditMode ? "Değiştirmek için doldurun" : "Şifre"}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sifre_tekrar">
                                    Şifre Tekrar {!isEditMode && '*'}
                                </Label>
                                <Input
                                    id="sifre_tekrar"
                                    type="password"
                                    value={formData.sifre_tekrar}
                                    onChange={(e) => handleChange('sifre_tekrar', e.target.value)}
                                    placeholder="Şifre tekrar"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="durum">Durum</Label>
                            <select
                                id="durum"
                                value={formData.durum}
                                onChange={(e) => handleChange('durum', parseInt(e.target.value))}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            >
                                <option value={1}>Aktif</option>
                                <option value={0}>Pasif</option>
                            </select>
                        </div>

                        <div className="pt-4 flex gap-2">
                            <Button 
                                onClick={handleSubmit} 
                                disabled={isLoading}
                                className="flex-1"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {isEditMode ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        {isEditMode ? 'Güncelle' : 'Oluştur'}
                                    </>
                                )}
                            </Button>
                            
                            {isEditMode && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={isLoading}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>İptal</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                Sil
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}