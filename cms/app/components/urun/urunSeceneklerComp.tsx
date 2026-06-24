import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { API_ENDPOINTS } from "@/config/api";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { Save } from "lucide-react";
import { useState, useEffect } from "react";

export default function UrunSeceneklerComp({ urunData }: { urunData: any }) {
    const [secilenDurum, setSecilenDurum] = useState<string>('');
    const [durumlar, setDurumlar] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            await anaDurumlariGetir();
            await urunDurumGetir();
        };
        fetchData();
    }, [urunData]);

    const anaDurumlariGetir = async () => {
        const response = await api.get(`${API_ENDPOINTS.urunAnaDurumlari}`);
        setDurumlar(response.data);
    }

    const urunDurumGetir = async () => {
        const response = await api.get(`${API_ENDPOINTS.urunDurumGetir}/${urunData.id}`);
        setSecilenDurum(response.data.durum_id);
    }

    const durumGuncelle = async () => {
        try {
            const durumAdi = durumlar.find((d: any) => String(d.id) === String(secilenDurum))?.durum_adi || secilenDurum;
            const urunAdi = urunData?.urunAltBilgileri?.urun_adi || urunData?.urun_adi || urunData?.adi || '';
            const response = await api.put(
                `${API_ENDPOINTS.urunDurumGuncelle}/${urunData.id}/${secilenDurum}`,
                undefined,
                {
                    _logAction: {
                        action: `Ürün durumu "${durumAdi}" olarak güncellendi${urunAdi ? ` — "${urunAdi}"` : ''}`,
                        category: 'Ürün',
                    },
                } as object
            );
            if (response.status === 200) {
                toast({
                    title: "Başarılı!",
                    description: "Ürün durumu güncellendi",
                });
            }
        } catch (error: any) {
            toast({
                title: "Hata!",
                description: error.response.data.message,
                variant: "destructive",
            });
        }
    }

    return (
        <>
        <div className="flex flex-row gap-2 items-center">
            <div className="flex flex-col gap-2 w-96">
                <Label>Ürün Durum</Label>
        <Select value={secilenDurum} onValueChange={(value) => setSecilenDurum(value)}>
            <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
            </SelectTrigger>
            <SelectContent>
                {durumlar.map((durum: any) => (
                    <SelectItem key={durum.id} value={durum.id}>{durum.durum_adi}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        </div>
        <div className="flex flex-col gap-2">
            <Label className="mb-3"></Label>
            <Button onClick={durumGuncelle}>
                <Save />
                Güncelle
            </Button>
         </div>
        </div>
        </>
    )
}