'use client'
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_ENDPOINTS } from "@/config/api";
import api from "@/services/api";
import { toast, useToast } from "@/hooks/use-toast";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ArrowLeft, Loader2, PlusIcon, Save, Zap, ZapIcon } from "lucide-react"
import { useParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from 'next/dist/client/components/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import BreadcrumbComp from "@/app/components/breadcrumbComp";



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


import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UrunKategoriComp from "@/app/components/urun/urunKategoriComp";
import UrunDetayComp from "@/app/components/urun/urunDetayComp";
import UrunVaryantComp from "@/app/components/urun/urunVaryantComp";
import UrunFiyatComp from "@/app/components/urun/urunFiyatComp";
import UrunResimleri from "@/app/components/urun/urunResimleri";
import UrunSeceneklerComp from "@/app/components/urun/urunSeceneklerComp";
import dynamic from "next/dynamic";
import { Switch } from "@/components/ui/switch";

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

interface Urun {
    id: number;
   urunAltBilgileri: {
    urun_adi: string;
    urun_seo: string;
    urun_description: string;
    urun_information: string;
    urun_meta_description: string;
    urun_meta_keywords: string;
    urun_meta_title: string;
    },
    urunAnaBilgileri: {
    alis_fiyati: number;
    fiyat: number;
    stok_kodu: string;
    barkod: string;
    tip: string;
    kdv_orani: number;
    kdv_id: number;
    active: number;
    },
    kategoriler: any[];
}



// Tarih formatını ayarlayan yardımcı fonksiyon
const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm" formatında
};

export default function Urunler() {

    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const [openDialog, setOpenDialog] = useState(true)
    

    const [isLoading, setIsLoading] = useState(false);
    const [originalActive, setOriginalActive] = useState<number | null>(null);

    const [urunData, setUrunData] = useState<Urun>({
        id: 0,
        urunAltBilgileri: {
            urun_adi: '',   
            urun_seo: '',
            urun_description: '',
            urun_information: '',
            urun_meta_description: '',
            urun_meta_keywords: '',
            urun_meta_title: '',
        },
        urunAnaBilgileri: {
            alis_fiyati: 0,
            fiyat: 0,
            stok_kodu: '',
            barkod: '',
            tip: 'standart',
            kdv_orani: 0,
            kdv_id: 4,
            active: 1,
        },
        kategoriler: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.urunById + params.slug);
                if (response.status === 200) {
                    setUrunData(response.data);
                    setOriginalActive(response.data.urunAnaBilgileri?.active ?? null);
                }
            } catch (error) {
                toast({
                    title: "Hata!",
                    description: "Ürün bilgileri getirilirken bir hata oluştu.",
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
        const urunAdi = urunData.urunAltBilgileri.urun_adi || '';
        const suankiActive = urunData.urunAnaBilgileri.active;
        try {
            let response;
            if (params.slug) {
                const activeDegistu = originalActive !== null && originalActive !== suankiActive;
                let logMesaj: string;
                if (activeDegistu) {
                    logMesaj = suankiActive === 1
                        ? `Ürün aktife çekildi${urunAdi ? `: "${urunAdi}"` : ''}`
                        : `Ürün pasife çekildi${urunAdi ? `: "${urunAdi}"` : ''}`;
                } else {
                    logMesaj = `Ürün bilgileri güncellendi${urunAdi ? `: "${urunAdi}"` : ''}`;
                }
                response = await api.put(
                    `${API_ENDPOINTS.urunUpdate}${params.slug}`,
                    { ...urunData },
                    { _logAction: { action: logMesaj, category: 'Ürün' } } as object
                );
                if (response.status === 200) {
                    setOriginalActive(suankiActive);
                    toast({
                        title: "Başarılı!",
                        description: "Ürün kaydı başarıyla güncellendi.",
                        variant: "default",
                    });
                }
            } else {
                response = await api.post(
                    API_ENDPOINTS.urunCreate,
                    { ...urunData },
                    { _logAction: { action: `Yeni ürün oluşturuldu${urunAdi ? `: "${urunAdi}"` : ''}`, category: 'Ürün' } } as object
                );
                if (response.status === 200) {
                    router.push(`/urunler/${response.data.id}`);
                    toast({
                        title: "Başarılı!",
                        description: "Ürün kaydı başarıyla oluşturuldu.",
                        variant: "default",
                    });
                }
            }
        } catch (error: any) {
            toast({
                title: "Hata!",
                description: params.slug
                    ? "Ürün kaydı güncellenirken bir hata oluştu."
                    : error.response.data.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string | number) => {
        setUrunData(prev => {
            const newData = { ...prev };
            const keys = field.split('.');
            let current: any = newData;
            
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            
            return newData;
        });
    };

    const breadcrumbData = [
        { name: 'Ürün Listesi', link: '/urunler/liste' },
        { name: params.slug ? 'Ürün Düzenle' : 'Yeni Ürün', link: `/urunler/${params.slug}` }
    ];



    return (
        <>

            <AlertDialog open={params.slug ? false : openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent className="bg-white dark:bg-dark-500">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-black">Lütfen Ürün Tipi Seçiniz</AlertDialogTitle>
                        <AlertDialogDescription>
                            Ürün tipini seçerek devam ediniz. Bu seçim ürün detaylarını etkileyecektir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <RadioGroup value={urunData && urunData.urunAnaBilgileri.tip} defaultValue="standart" onValueChange={(value) => handleChange('urunAnaBilgileri.tip', value)}>
                            <div
                                className="flex items-center space-x-2 border border-gray-200 p-4 rounded-md cursor-pointer"
                                onClick={() => handleChange('urunAnaBilgileri.tip', "standart")}
                            >
                                <RadioGroupItem value="standart" id="standart" />
                                <Label htmlFor="standart">Standart</Label>
                            </div>
                            <div
                                className="flex items-center space-x-2 border border-gray-200 p-4 rounded-md cursor-pointer"
                                onClick={() => handleChange('urunAnaBilgileri.tip', "varyant")}
                            >
                                <RadioGroupItem value="varyant" id="varyant" />
                                <Label htmlFor="varyant">Varyant</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <AlertDialogFooter>
                       {isLoading ? <Button disabled>Lütfen bekleyiniz...</Button> : <Button onClick={handleSubmit}>Yeni Ürün Ekle</Button>}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
                                    <DropdownMenuItem><Link href="/urunler">Yeni Ürün</Link></DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                    </div>
                </div>
                <Separator className="my-5" />

                <div className="w-full">

                <div className="flex flex-row gap-2 mb-5 items-center">
                        <Label className="text-lg font-bold">Ürün Durumu ({urunData.urunAnaBilgileri.active === 1 ? 'Aktif' : 'Pasif'})</Label>
                        <Switch
                            checked={urunData.urunAnaBilgileri.active === 1}
                            onCheckedChange={(checked) => handleChange('urunAnaBilgileri.active', checked ? 1 : 0)}
                        />
                     </div>

                    <div className="flex flex-col gap-2 mb-5">
                        <Label>Ürün Adı</Label>
                        <Input
                            className="w-full"
                            name="urunAltBilgileri.urun_adi"
                            value={urunData.urunAltBilgileri.urun_adi}
                            onChange={(e) => handleChange('urunAltBilgileri.urun_adi', e.target.value)}
                            />
                     </div>

                    <Tabs defaultValue="aciklama" className="w-full">
                        <TabsList className="mb-5">
                            <TabsTrigger value="aciklama">Açıklama</TabsTrigger>
                            <TabsTrigger value="detaylar">Detaylar</TabsTrigger>
                          {urunData.urunAnaBilgileri.tip === "varyant" && <TabsTrigger value="varyantlar">Varyantlar</TabsTrigger>}
                            <TabsTrigger value="fiyatlandirma">Fiyatlandırma</TabsTrigger>
                            <TabsTrigger value="arama_motoru_optimizasyonu">Arama Motoru Optimizasyonu</TabsTrigger>
                            <TabsTrigger value="secenekler">Seçenekler</TabsTrigger>
                        </TabsList>
                        <TabsContent value="aciklama" className="flex flex-col gap-4">
                        <div>
                            <UrunResimleri urunData={urunData} />
                            <div className="flex flex-col gap-2 mb-5">
                            <Label className="text-lg font-bold">Ürün Bilgileri</Label>
                            <RichTextEditor
                                value={urunData.urunAltBilgileri.urun_information || ''}
                                onChange={(content) => handleChange('urunAltBilgileri.urun_information', content)}
                                />
                                 </div>
                             <div className="flex flex-col gap-2">
                            <Label className="text-lg font-bold">Ürün Açıklaması</Label>
                                <RichTextEditor
                                value={urunData.urunAltBilgileri.urun_description || ''}
                                onChange={(content) => handleChange('urunAltBilgileri.urun_description', content)}
                            />
                            </div>
                        </div>
                        <UrunKategoriComp urunData={urunData} handleChange={handleChange} />
                        
                        </TabsContent>

                        <TabsContent value="detaylar">
                            <UrunDetayComp urunData={urunData} handleChange={handleChange} />
                        </TabsContent>

                        <TabsContent value="varyantlar">
                            <UrunVaryantComp urunData={urunData} />
                        </TabsContent>

                        <TabsContent value="fiyatlandirma">
                            <UrunFiyatComp urunData={urunData} handleChange={handleChange} />
                        </TabsContent>

                        <TabsContent value="arama_motoru_optimizasyonu" className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                        <Label>Seo Url</Label>
                        <Input
                            className="w-full"
                            name="urun_seo"
                            value={urunData.urunAltBilgileri.urun_seo}
                            onChange={(e) => handleChange('urunAltBilgileri.urun_seo', e.target.value)}
                            />
                       </div>
                        <div className="flex flex-col gap-2">
                        <Label>Meta Başlık</Label>
                        <Input
                            className="w-full"
                            name="urunAltBilgileri.urun_meta_title"
                            value={urunData.urunAltBilgileri.urun_meta_title}
                            onChange={(e) => handleChange('urunAltBilgileri.urun_meta_title', e.target.value)}
                            />
                       </div>
                       <div className="flex flex-col gap-2">
                       <Label>Meta Açıklama</Label>
                       <Input
                            className="w-full"
                            name="urunAltBilgileri.urun_meta_description"
                            value={urunData.urunAltBilgileri.urun_meta_description}
                            onChange={(e) => handleChange('urunAltBilgileri.urun_meta_description', e.target.value)}
                            />
                       </div>
                       <div className="flex flex-col gap-2">
                       <Label>Etiketler</Label>
                       <Input
                            className="w-full"
                            name="urunAltBilgileri.urun_meta_keywords"
                            value={urunData.urunAltBilgileri.urun_meta_keywords}
                            onChange={(e) => handleChange('urunAltBilgileri.urun_meta_keywords', e.target.value)}
                            />
                       </div>
                    
                        </TabsContent>

                        <TabsContent value="secenekler">
                        <UrunSeceneklerComp urunData={urunData} />
                        </TabsContent>

                    </Tabs>

                


                  
                </div>
            </div>
        </>
    );
}
