import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { API_ENDPOINTS } from "@/config/api";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { useEffect, useState } from "react";
import UrunOzelFiyatComp from "./urunOzelFiyatComp";
import UrunVaryantResimleri from "./urunVaryantResimleri";
import UrunStokMiktarlari from "./urunStokMiktarlari";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface UrunVaryantDetay {
    id: number;
    urun_id: number;
    varyant_urun_adi: string;
    fiyat: number;
    stok_kodu: string;
    varsayilan: number;
    barkod: string;
    varyant_adi: string;
    ana_urun_fiyat: number;
    alis_fiyati: number;
    kdv_orani: number;
    kdv_id: number;
    urunAnaBilgileri: {
        tip: string;
    }
}

export default function UrunVaryantDetayComp({ varyantId }: { varyantId: number }) {
    const [urunData, setUrunData] = useState<UrunVaryantDetay>({
        id: 0,
        urun_id: 0,
        varyant_urun_adi: '',
        fiyat: 0,
        stok_kodu: '',
        barkod: '',
        varyant_adi: '',
        varsayilan: 0,
        ana_urun_fiyat: 0,
        alis_fiyati: 0,
        kdv_orani: 0,
        kdv_id: 0,
        urunAnaBilgileri: {
            tip: '',
        }
    });
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.urunVaryantDetay + varyantId);
                if (response.status === 200) {
                    setUrunData(response.data);
                }
            } catch (error: any) {
                toast({
                    title: "Hata!",
                    description: error.response.data.message,
                    variant: "destructive",
                });
            }
        };

        if (varyantId) {
            fetchData();
        }
    }, [varyantId]);

    const handleSave = async () => {
        try {
            const response = await api.put(API_ENDPOINTS.urunVaryantUpdate + urunData.id, urunData);
            if (response.status === 200) {
                toast({
                    title: "Başarılı!",
                    description: "Varyant başarıyla güncellendi.",
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price);
    };

    return (
        <>
            <div className="w-full flex flex-col gap-4">
                <UrunVaryantResimleri urunData={urunData} />
                <div className="flex flex-col gap-2">
                    {urunData.varyant_adi}
                </div>
                <div className="flex flex-row items-center space-x-2">
                    <Switch
                        id="varsayilan-switch"
                        checked={urunData.varsayilan === 1}
                        onCheckedChange={(checked) => setUrunData(prev => ({
                            ...prev,
                            varsayilan: checked ? 1 : 0
                        }))}
                        className="data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="varsayilan-switch" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Varsayılan
                    </Label>
                </div>

                <UrunStokMiktarlari urunData={urunData} tip="varyant" />

                <div className="w-full flex flex-col gap-2 mt-5 text-sm">
            <div>Kdv Hariç Fiyat : {formatPrice(urunData.fiyat)}</div>
            <div>Kdv Dahil Fiyat : {formatPrice(urunData.fiyat * (1 + urunData.kdv_orani / 100) || urunData.fiyat)}</div>
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Fiyat</Label>
                    <Input
                        value={urunData.fiyat}
                        onChange={(e) => setUrunData(prev => ({
                            ...prev,
                            fiyat: Number(e.target.value)
                        }))}
                        type="number"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Alış Fiyatı</Label>
                    <Input
                        value={urunData.alis_fiyati}
                        onChange={(e) => setUrunData(prev => ({
                            ...prev,
                            alis_fiyati: Number(e.target.value)
                        }))}
                        type="number"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Kdv Oranı</Label>
                    <Select
                        value={urunData.kdv_id?.toString()}
                        onValueChange={(value) => {
                            setUrunData(prev => ({
                                ...prev,
                                kdv_id: Number(value),
                                kdv_orani: value === '1' ? 1 : value === '2' ? 10 : value === '3' ? 20 : 0
                            }))
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="KDV Oranı Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">KDV %1</SelectItem>
                            <SelectItem value="2">KDV %10</SelectItem>
                            <SelectItem value="3">KDV %20</SelectItem>
                            <SelectItem value="4">Vergi Yok</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Stok Kodu</Label>
                    <Input
                        value={urunData.stok_kodu}
                        onChange={(e) => setUrunData(prev => ({
                            ...prev,
                            stok_kodu: e.target.value
                        }))}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Varyant Ürün Adı</Label>
                    <Input
                        value={urunData.varyant_urun_adi}
                        onChange={(e) => setUrunData(prev => ({
                            ...prev,
                            varyant_urun_adi: e.target.value
                        }))}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Barkod</Label>
                    <Input
                        value={urunData.barkod}
                        onChange={(e) => setUrunData(prev => ({
                            ...prev,
                            barkod: e.target.value
                        }))}
                    />
                </div>
                
                <UrunOzelFiyatComp urunData={urunData} tip="varyant" />

                <div className="flex flex-col gap-2">
                    <Button onClick={handleSave}>Kaydet</Button>
                </div>

            </div>
        </>
    );
}