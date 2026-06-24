import { useState, useEffect } from "react";
import { API_BASE_URL_RESIM, API_ENDPOINTS } from "@/config/api";
import api from "@/services/api";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

export default function UrunVaryantResimleri({ urunData }: { urunData: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [resimler, setResimler] = useState([]);

  
    const resimleriGetir = async () => {
        const response = await api.get(API_ENDPOINTS.urunResimListe + urunData.urun_id);
        setResimler(response.data);
    }

    useEffect(() => {
        resimleriGetir();
    }, [urunData]);

  

    const handleMakeCover = async (resimId: number,secim:string) => {
        try {
            const response = await api.post(`${API_ENDPOINTS.urunVaryantResimSec}`, {
                resimId,
                varyantId: urunData.id,
                secim
            });
            resimleriGetir();
            toast({
                title: "Başarılı",
                description: "Varyant resmi başarıyla seçildi",
            });
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error.response?.data?.message || "Varyant resmi seçilirken bir hata oluştu",
            });
        }
    };

    return (
        <>
        <div className="flex flex-col gap-2">
              <small className="text-xs font-bold">
            Müşteri bu varyantı seçtiğinde hangi görsellerin görüntüleneceğini belirtebilirsiniz. Hiçbir görsel seçmezseniz hepsi görüntülenir. Varyantın varsayılan görseli listeden seçilen ilk görsel olacaktır.
            </small>
        </div>
        <div className="flex flex-row gap-4 border rounded-lg p-2 mb-5">
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
                            {resim.varyant_id === urunData.id ? (
                               <button
                               onClick={() => handleMakeCover(resim.id,'iptal')}
                               className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm"
                           >
                               İptal Et
                           </button>
                            ) : (
                                <button
                                    onClick={() => handleMakeCover(resim.id,'sec')}
                                    className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md text-sm"
                                >
                                    Seç
                                </button>
                            )}
                          
                        </div>
                        {resim.varyant_id === urunData.id && (
                            <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-center text-xs py-1 rounded-b-lg">
                                Seçildi
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
        </>
    );
}