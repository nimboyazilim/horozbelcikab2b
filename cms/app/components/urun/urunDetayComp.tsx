import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UrunOzellikleri from "./urunOzellikleri";
import UrunDosyalariComp from "./urunDosyalariComp";
import UrunStokMiktarlari from "./urunStokMiktarlari";
export default function UrunDetayComp({ urunData, handleChange }: { urunData: any, handleChange: any }) {
    return (
        <div className="flex flex-col gap-2">
            <UrunStokMiktarlari urunData={urunData} tip="ana"/>
            <div className="w-full flex flex-row gap-2">
                <div className="w-full flex flex-col gap-2">
                    <Label>Stok Kodu</Label>
                    <Input
                        className="w-full"
                        name="urunAnaBilgileri.stok_kodu"
                        value={urunData.urunAnaBilgileri.stok_kodu}
                        onChange={(e) => handleChange('urunAnaBilgileri.stok_kodu', e.target.value)}
                    />
                </div>
                <div className="w-full flex flex-col gap-2">
                    <Label>Barkod</Label>
                    <Input
                        className="w-full"
                        name="urunAnaBilgileri.barkod"
                        value={urunData.urunAnaBilgileri.barkod}
                        onChange={(e) => handleChange('urunAnaBilgileri.barkod', e.target.value)}
                    />
                </div>
            </div>
            <UrunOzellikleri urunData={urunData} />
            <UrunDosyalariComp urunData={urunData} />
        </div>
    )
}