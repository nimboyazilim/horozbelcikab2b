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
export default function KategoriMikroSenkron() {

    const [isLoadingKategoriUrunBirlestirmeSenkronize, setIsLoadingKategoriUrunBirlestirmeSenkronize] = useState(false);
    const [isLoadingKategoriSenkronize, setIsLoadingKategoriSenkronize] = useState(false);
   

    const handleKategoriUrunBirlestirmeSenkronize = async () => {
        try {
            setIsLoadingKategoriUrunBirlestirmeSenkronize(true);
            const response = await api.get(API_ENDPOINTS.mikroKategoriUrunBirlestirmeSenkron);
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
            setIsLoadingKategoriUrunBirlestirmeSenkronize(false);
        }
    }

    const handleKategoriSenkronize = async () => {
        try {
            setIsLoadingKategoriSenkronize(true);
            const response = await api.get(API_ENDPOINTS.mikroKategoriSenkron);
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
            setIsLoadingKategoriSenkronize(false);
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
                           <span> - Yeni kategori veya kategori güncellemeleri için kategorileri senkronize et butonuna tıklayınız.</span>
                           <br></br>
                           <span> - Yeni kategori ve ürün güncellemelerinde bir değişiklik olursa,kategoriler ile ürünleri birleştirme butonuna tıklayınız.</span>
                           <br></br>
                           <span className="text-red-500">
                            Yeni bir ürün eklenmiş ise ona ait kategori varsa kategoriler ile ürünleri birleştirme butonuna tıklayınız.
                            Eğer kategorilerde ve ürünlerde bir değişklik oldu ise işlemleri sırası ile yapınız. <br/><br/>
                            1. Kategorileri senkronize et<br/>
                            2. Kategoriler ile ürünleri birleştir<br/>
                            Not: Ürünleri senkronize etmeden kategoriler ile ürünleri birleştirme butonuna tıklarsanız, ürünlerin kategorileri güncellenmez.
                           </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-4">

                      <Button variant="outline" onClick={handleKategoriSenkronize} disabled={isLoadingKategoriSenkronize}>
                        {isLoadingKategoriSenkronize ? 
                        <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 ml-2 animate-spin" /> 
                        <span className="ml-2">Senkronizasyon Yapılıyor...</span></div> : 
                        <span>Kategorileri Senkronize Et</span>}
                       </Button>

                

                      <Button variant="outline" onClick={handleKategoriUrunBirlestirmeSenkronize} disabled={isLoadingKategoriUrunBirlestirmeSenkronize}>
                        {isLoadingKategoriUrunBirlestirmeSenkronize ? 
                        <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 ml-2 animate-spin" /> 
                        <span className="ml-2">Senkronizasyon Yapılıyor...</span></div> : 
                        <span>Kategoriler ile Ürünleri Birleştirme</span>}
                       </Button>



                    </div>
                    <AlertDialogFooter>
          <AlertDialogCancel>Kapat</AlertDialogCancel>
        </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
    );
}