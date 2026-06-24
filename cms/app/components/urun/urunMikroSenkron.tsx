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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { API_ENDPOINTS } from "@/config/api";
import api from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
export default function UrunMikroSenkron() {

    const [isLoadingFiyatSenkronize, setIsLoadingFiyatSenkronize] = useState(false);
    const [isLoadingOzelFiyatSenkronize, setIsLoadingOzelFiyatSenkronize] = useState(false);
    const [isLoadingUrunVaryantBirlestirmeSenkronize, setIsLoadingUrunVaryantBirlestirmeSenkronize] = useState(false);
    const [isLoadingVaryantNitelikleriSenkronize, setIsLoadingVaryantNitelikleriSenkronize] = useState(false);
    const [isLoadingUrunSenkronize, setIsLoadingUrunSenkronize] = useState(false);
    const [isLoadingMiktarSenkronize, setIsLoadingMiktarSenkronize] = useState(false);
    const [isLoadingVergiSenkronize, setIsLoadingVergiSenkronize] = useState(false);
    const handleFiyatSenkronize = async () => {
        try {
            setIsLoadingFiyatSenkronize(true);
            const response = await api.get(API_ENDPOINTS.mikroUrunFiyatSenkron, {
                _logAction: { action: 'Mikro\'dan ürün fiyatları senkronize edildi', category: 'Mikro Entegrasyon' },
            } as object);
            if(response.data.status == 'success'){
                toast({
                title: "Başarılı!",
                    description: response.data.message,
                });
            } else {
                toast({
                    title: "Hata!",
                    description: response.data.message,
                });
            }
        } catch (error: any) {
            toast({
                title: "Hata!",
                description: error.response.data.message,
            });
        } finally {
            setIsLoadingFiyatSenkronize(false);
        }
    }

    const handleOzelFiyatSenkronize = async () => {
        try {
            setIsLoadingOzelFiyatSenkronize(true);
            const response = await api.get(API_ENDPOINTS.mikroUrunOzelFiyatSenkron, {
                _logAction: { action: 'Mikro\'dan özel bayi fiyatları senkronize edildi', category: 'Mikro Entegrasyon' },
            } as object);
            if(response.data.status == 'success'){
                toast({
                title: "Başarılı!",
                    description: response.data.message,
                });
            } else {
                toast({
                    title: "Hata!",
                    description: response.data.message,
                });
            }
        } catch (error: any) {
            toast({
                title: "Hata!",
                description: error.response.data.message,
            });
        } finally {
            setIsLoadingOzelFiyatSenkronize(false);
        }
    }

    const handleUrunVaryantBirlestirmeSenkronize = async () => {
        try {
            setIsLoadingUrunVaryantBirlestirmeSenkronize(true);
            const response = await api.get(API_ENDPOINTS.mikroUrunVaryantEslestirmeSenkron, {
                _logAction: { action: 'Mikro ürün-varyant birleştirme senkronizasyonu yapıldı', category: 'Mikro Entegrasyon' },
            } as object);
            if(response.data.status == 'success'){
                toast({
                title: "Başarılı!",
                    description: response.data.message,
                });
            } else {
                toast({
                    title: "Hata!",
                    description: response.data.message,
                });
            }
        } catch (error: any) {
            toast({
                title: "Hata!",
                description: error.response.data.message,
            });
        } finally {
            setIsLoadingUrunVaryantBirlestirmeSenkronize(false);
        }
    }

    const handleVaryantNitelikleriSenkronize = async () => {
        try {
            setIsLoadingVaryantNitelikleriSenkronize(true);
            const response = await api.get(API_ENDPOINTS.mikroUrunVaryantNitelikleriSenkron, {
                _logAction: { action: 'Mikro\'dan varyant nitelikleri senkronize edildi', category: 'Mikro Entegrasyon' },
            } as object);
            if(response.data.status == 'success'){
                toast({
                title: "Başarılı!",
                    description: response.data.message,
                });
            } else {
                toast({
                    title: "Hata!",
                    description: response.data.message,
                });
            }
        } catch (error: any) {
            toast({
                title: "Error!",
                description: error.response.data.message,
            });
        } finally {
            setIsLoadingVaryantNitelikleriSenkronize(false);
        }
    }

    const handleUrunSenkronize = async () => {
        try {
            setIsLoadingUrunSenkronize(true);
            const response = await api.get(API_ENDPOINTS.mikroUrunSenkron, {
                _logAction: { action: 'Mikro\'dan ürünler senkronize edildi', category: 'Mikro Entegrasyon' },
            } as object);
            if(response.data.status == 'success'){
                toast({
                title: "Başarılı!",
                    description: response.data.message,
                });
            } else {
                console.log(response.data);
                toast({
                    title: "Hata!",
                    description: response.data.message,
                });
            }
        } catch (error: any) {
            console.log(error);
            toast({
                title: "Error!",
                description: error.response.data.message,
            });
        } finally {
            setIsLoadingUrunSenkronize(false);
        }
    }

    const handleMiktarSenkronize = async () => {
        try {
            setIsLoadingMiktarSenkronize(true);
            const response = await api.get(API_ENDPOINTS.mikroUrunMiktarSenkron, {
                _logAction: { action: 'Mikro\'dan ürün miktarları senkronize edildi', category: 'Mikro Entegrasyon' },
            } as object);
            if(response.data.status == 'success'){
                toast({
                    title: "Başarılı!",
                    description: response.data.message,
                });
            } else {
                toast({
                    title: "Hata!",
                    description: response.data.message,
                });
            }
        } catch (error: any) {
            toast({
                title: "Hata!",
                description: error.response.data.message,
            });
        } finally {
            setIsLoadingMiktarSenkronize(false);
        }
    }

    const handleVergiSenkronize = async () => {
        try {
            setIsLoadingVergiSenkronize(true);
            const response = await api.get(API_ENDPOINTS.mikroUrunVergiSenkron);
            if(response.data.status == 'success'){
                toast({
                    title: "Başarılı!",
                    description: response.data.message + " Güncellenen Vergi Sayısı: " + response.data.count.guncellenen + " ,Eklenen Vergi Sayısı: " + response.data.count.eklenen,
                });
            } else {
                toast({
                    title: "Hata!",
                    description: response.data.message,
                });
            }
        } catch (error: any) {
            toast({
                title: "Hata!",
                description: error.response.data.message,
            });
        } finally {
            setIsLoadingVergiSenkronize(false);
        }
    }

    return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">Senkron İşlemleri</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-screen-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Senkron İşlemleri</AlertDialogTitle>
                        <AlertDialogDescription>
                           Lütfen işlemleri sırası ile yapınız.<br></br>
                           <span className="text-red-500 font-bold">Not: Mikro'dan alınan verilerin doğru olduğundan emin olunuz.</span>
                           <br></br>
                           <span> - Yeni ürün veya ürün güncellemeleri için ürünleri senkronize et butonuna tıklayınız.</span>
                           <br></br>
                           <span> - Varyant niteliklerini(Örnek: Renk, Beden, Şekil, Watt vb.) senkronize et butonuna tıklayınız.</span>
                           <br></br>
                           <span> - Yeni ürün ve varyant nitelikleri güncellemelerinde bir değişiklik olursa,Ürün varyantlarını birleştirme butonuna tıklayınız.</span>
                           <br></br>
                           <span className="text-red-500">Yukarıdaki işlemlerde bir problem yoksa, ürün fiyatlarını,ürün miktarlarını ve ürün vergilerini senkronize et butonlarına tıklayınız.
                            Ürün fiyat,miktar ve vergi senkronizasyonları ürünlerde ve varyantlarda bir değişiklik olmadığı sürece her zaman tek başına senkronize edilebilir.
                           </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-4">

                      <Button variant="outline" onClick={handleUrunSenkronize} disabled={isLoadingUrunSenkronize}>
                        {isLoadingUrunSenkronize ? 
                        <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 ml-2 animate-spin" /> 
                        <span className="ml-2">Senkronizasyon Yapılıyor...</span></div> : 
                        <span>Ürünleri Senkronize Et</span>}
                       </Button>

                
                      <Button variant="outline" onClick={handleVaryantNitelikleriSenkronize} disabled={isLoadingVaryantNitelikleriSenkronize}>
                        {isLoadingVaryantNitelikleriSenkronize ? 
                        <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 ml-2 animate-spin" /> 
                        <span className="ml-2">Senkronizasyon Yapılıyor...</span></div> : 
                        <span>Varyant Niteliklerini Senkronize Et</span>}
                       </Button>

                      <Button variant="outline" onClick={handleUrunVaryantBirlestirmeSenkronize} disabled={isLoadingUrunVaryantBirlestirmeSenkronize}>
                        {isLoadingUrunVaryantBirlestirmeSenkronize ? 
                        <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 ml-2 animate-spin" /> 
                        <span className="ml-2">Senkronizasyon Yapılıyor...</span></div> : 
                        <span>Ürünler ile Varyant Niteliklerini Birleştirme</span>}
                       </Button>


                      {/* <Button variant="outline" onClick={handleFiyatSenkronize} disabled={isLoadingFiyatSenkronize}>
                        {isLoadingFiyatSenkronize ? 
                        <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 ml-2 animate-spin" /> 
                        <span className="ml-2">Senkronizasyon Yapılıyor...</span></div> : 
                        <span>Ürün Fiyatlarını Senkronize Et</span>}
                       </Button> */}


                      <Button variant="outline" onClick={handleOzelFiyatSenkronize} disabled={isLoadingOzelFiyatSenkronize}>
                        {isLoadingOzelFiyatSenkronize ? 
                        <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 ml-2 animate-spin" /> 
                        <span className="ml-2">Senkronizasyon Yapılıyor...</span></div> : 
                        <span>Ürün Özel Bayi Fiyatlarını Senkronize Et</span>}
                       </Button>

                      <Button variant="outline" onClick={handleMiktarSenkronize} disabled={isLoadingMiktarSenkronize}>
                        {isLoadingMiktarSenkronize ? 
                        <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 ml-2 animate-spin" /> 
                        <span className="ml-2">Senkronizasyon Yapılıyor...</span></div> : 
                        <span>Ürün Miktarlarını Senkronize Et</span>}
                       </Button>

                     {/* <Button variant="outline" onClick={handleVergiSenkronize} disabled={isLoadingVergiSenkronize}>
                        {isLoadingVergiSenkronize ? 
                        <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 ml-2 animate-spin" /> 
                        <span className="ml-2">Senkronizasyon Yapılıyor...</span></div> : 
                        <span>Ürün Vergilerini Senkronize Et</span>}
                       </Button> */}

                    </div>
                    <AlertDialogFooter>
          <AlertDialogCancel>Kapat</AlertDialogCancel>
        </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
    );
}