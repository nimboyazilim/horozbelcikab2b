import { Input } from "@/components/ui/input";
import { ImagePlus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL_RESIM, API_ENDPOINTS } from "@/config/api";
import api from "@/services/api";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

export default function UrunResimleri({ urunData }: { urunData: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [resimler, setResimler] = useState([]);
  
    const resimleriGetir = async () => {
        const response = await api.get(API_ENDPOINTS.urunResimListe + urunData.id);
        setResimler(response.data);
    }

    useEffect(() => {
        resimleriGetir();
    }, [urunData]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        
        setIsLoading(true);
        const files = Array.from(e.target.files);
        
        try {
            // Tek bir FormData oluştur ve tüm dosyaları ekle
            const formData = new FormData();
            
            // Her dosyayı aynı field name ile ekle
            files.forEach(file => {
                formData.append('image', file);
            });
            
            // urunId'yi ekle
            formData.append('urunId', urunData.id);
    
            // FormData içeriğini kontrol et
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]); // Debug için
            }
    
            const response = await api.post(API_ENDPOINTS.urunResimEkle, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            resimleriGetir();
            toast({
                title: "Başarılı",
                description: response.data.message,
            });
        } catch (error: any) {
            console.error("Resim yükleme hatası:", error);
            toast({
                title: "Hata",
                description: error.response?.data?.message || "Bir hata oluştu",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteImage = async (resimId: number) => {
        try {
            const response = await api.delete(`${API_ENDPOINTS.urunResimSil}${resimId}`);
            resimleriGetir();
            toast({
                title: "Başarılı",
                description: "Resim başarıyla silindi",
            });
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error.response?.data?.message || "Resim silinirken bir hata oluştu",
            });
        }
    };

    const handleMakeCover = async (resimId: number) => {
        try {
            const response = await api.post(`${API_ENDPOINTS.urunKapakResimYap}`, {
                resimId,
                urunId: urunData.id
            });
            resimleriGetir();
            toast({
                title: "Başarılı",
                description: "Kapak resmi başarıyla güncellendi",
            });
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error.response?.data?.message || "Kapak resmi güncellenirken bir hata oluştu",
            });
        }
    };

    return (
        <div className="flex flex-row gap-4 border rounded-lg p-2 mb-5">
            <div className="relative w-32 h-32">
                <Input
                    type="file"
                    name="image"
                    className="w-full h-full opacity-0 cursor-pointer absolute z-10"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                    multiple={true}
                />
                <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    {isLoading ? (
                        <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                    ) : (
                        <ImagePlus className="w-10 h-10 text-gray-400" />
                    )}
                </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full h32">
                {resimler && resimler.map((resim: any) => (
                    <div key={resim.id} className="relative group">
                        <Image 
                            src={`${API_BASE_URL_RESIM}${resim.resim}`} 
                            alt={resim.resim} 
                            width={128} 
                            height={128} 
                            className="w-32 h-32 rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex flex-col items-center justify-center gap-2">
                            {resim.varsayilan === 1 ? (
                                <span className="text-white bg-green-500 px-3 py-1 rounded-md text-sm">
                                    Kapak
                                </span>
                            ) : (
                                <button
                                    onClick={() => handleMakeCover(resim.id)}
                                    className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md text-sm"
                                >
                                    Kapak Yap
                                </button>
                            )}
                            <button
                                onClick={() => handleDeleteImage(resim.id)}
                                className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm"
                            >
                                Sil
                            </button>
                        </div>
                        {resim.varsayilan === 1 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-center text-xs py-1 rounded-b-lg">
                                Kapak
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}