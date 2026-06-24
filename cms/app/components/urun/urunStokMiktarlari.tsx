import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_ENDPOINTS } from "@/config/api";
import api from "@/services/api";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
export default function UrunStokMiktarlari({ urunData, tip }: { urunData: any, tip: string }) {
    const [disabled, setDisabled] = useState(false);
    const [stok_miktari, setStokMiktari] = useState(0);
   


    useEffect(() => {
        fetchStokMiktari();
        disabledKontrol();
    }, [urunData]);

    const disabledKontrol = () => {
        if(urunData.urunAnaBilgileri.tip === 'varyant'){
            setDisabled(true);
        }
    }

    const fetchStokMiktari = async () => {

        let urunId = 0;
        let varyantId = 0;
        if(tip === 'ana'){ 
            urunId = urunData.id
            varyantId = 0
        } else {
            urunId = urunData.urun_id
            varyantId = urunData.id
        }


        const response = await api.get(API_ENDPOINTS.urunStokMiktariGetir + urunId + '/' + varyantId);
        if(response.data.miktar != undefined){
            setStokMiktari(response.data.miktar);
        }
       
    }

    const handleStokMiktariGuncelle = async () => {
        try {

            let urunId = 0;
            let varyantId = 0;
            if(tip === 'ana'){ 
                urunId = urunData.id
                varyantId = 0
            } else {
                urunId = urunData.urun_id
                varyantId = urunData.id
            }

            const response = await api.put(API_ENDPOINTS.urunStokMiktariGuncelle + urunId + '/' + varyantId, {
                miktar: stok_miktari,
            });
        if(response.status == 200){
            toast({
                title: 'Stok miktarı güncellendi',
                description: 'Stok miktarı güncellendi',
                variant: 'default'
            });
        }else{
            toast({
                title: 'Stok miktarı güncellenemedi',
                description: 'Stok miktarı güncellenemedi',
                variant: 'destructive'
            });
        }
        } catch (error) {
            toast({
                title: 'Stok miktarı güncellenemedi',
                description: 'Stok miktarı güncellenemedi',
                variant: 'destructive'
            });
        }
    }

    return (
        <div>
            <div className="flex flex-row items-center gap-2 mb-5">
                <div className="flex flex-col gap-2">
                    <Label>Stok Miktarı</Label>
                    <Input 
                        type="number" 
                        value={stok_miktari} 
                        onChange={(e) => setStokMiktari(Number(e.target.value))}
                        disabled={disabled} 
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Güncelle</Label>
                    <Button disabled={disabled} onClick={handleStokMiktariGuncelle}>Güncelle</Button>
                </div>
            </div>  
        </div>
    )
}