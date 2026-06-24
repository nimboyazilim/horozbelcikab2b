import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UrunOzelFiyatComp from "./urunOzelFiyatComp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UrunFiyatComp({ urunData, handleChange }: { urunData: any, handleChange: any }) {
    
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price);
    };


    return (
        <div className="flex flex-col gap-2">
        <div className="w-full flex flex-row gap-2">


        <div className="w-full flex flex-col gap-2">
                <Label>Alış Fiyatı</Label>
                <Input
                    className="w-full"
                    name="urunAnaBilgileri.alis_fiyati"
                    value={urunData.urunAnaBilgileri.alis_fiyati}
                    onChange={(e) => handleChange('urunAnaBilgileri.alis_fiyati', e.target.value)}
                    type="number"
                />
            </div>

            <div className="w-full flex flex-col gap-2">
                <Label>Fiyat</Label>
                <Input
                    className="w-full"
                    name="urunAnaBilgileri.fiyat"
                    value={urunData.urunAnaBilgileri.fiyat}
                    onChange={(e) => handleChange('urunAnaBilgileri.fiyat', e.target.value)}
                    type="number"
                />
            </div>
         
            
            <div className="w-full flex flex-col gap-2"> 
                <Label>Kdv Oranı</Label>
                <Select 
                    value={urunData.urunAnaBilgileri.kdv_id.toString()} 
                    onValueChange={(value) => {handleChange('urunAnaBilgileri.kdv_id', value)
                        value == '1' ? handleChange('urunAnaBilgileri.kdv_orani', 1) : value == '2' ? handleChange('urunAnaBilgileri.kdv_orani', 10) : value == '3' ? handleChange('urunAnaBilgileri.kdv_orani', 20) : handleChange('urunAnaBilgileri.kdv_orani', 0)
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
         
            
        </div>


        <div className="w-full flex flex-col gap-2 mt-5">
            <div>Kdv Hariç Fiyat : {formatPrice(urunData.urunAnaBilgileri.fiyat)}</div>
            <div>Kdv Dahil Fiyat : {formatPrice(urunData.urunAnaBilgileri.fiyat * (1 + urunData.urunAnaBilgileri.kdv_orani / 100))}</div>
        </div>

        <UrunOzelFiyatComp urunData={urunData} tip="ana" />
        
    </div>
    )
}