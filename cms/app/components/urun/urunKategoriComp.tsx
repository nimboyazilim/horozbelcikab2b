import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react"
import { toast, useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/config/api";
import api from "@/services/api";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"

interface Kategori {
    id: number;
    kategori_adi: string;
    kategori_seo: string;
    kategori_ust_id: number;
    kategori_ikon: string;
    kategori_resim: string;
    alt_kategoriler?: Kategori[];
}

export default function UrunKategoriComp({ urunData, handleChange }: { urunData: any, handleChange: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
    const [seciliKategoriler, setSeciliKategoriler] = useState<number[]>(urunData?.kategoriler || []);

    // urunData.kategoriler değiştiğinde seciliKategoriler'i güncelle
    useEffect(() => {
        if (Array.isArray(urunData?.kategoriler)) {
            setSeciliKategoriler(urunData.kategoriler);
        }
    }, [urunData.kategoriler]);

    const kategorilerFetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.kategoriListe);
            
            // Recursive olarak alt kategorileri düzenleyen yardımcı fonksiyon
            const düzenleAltKategoriler = (üstId: number): Kategori[] => {
                return response.data
                    .filter((k: Kategori) => k.kategori_ust_id === üstId)
                    .map((kategori: Kategori) => ({
                        ...kategori,
                        alt_kategoriler: düzenleAltKategoriler(kategori.id)
                    }));
            };

            // Ana kategorileri ve tüm alt kategorileri düzenle
            const düzenliKategoriler = düzenleAltKategoriler(0);
            
          
            setKategoriler(düzenliKategoriler);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Kategoriler yüklenirken bir hata oluştu."
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        kategorilerFetchData();
    }, []);

    const handleKategoriChange = (kategoriId: number) => {
        setSeciliKategoriler(prev => 
            prev.includes(kategoriId)
                ? prev.filter(id => id !== kategoriId)
                : [...prev, kategoriId]
        );
    };

    useEffect(() => {
        handleChange('kategoriler', seciliKategoriler);
    }, [seciliKategoriler]);

    return (
        <div className="flex flex-col gap-2">
            <Label className="text-lg font-bold">Kategoriler</Label>
            <div className="flex flex-wrap gap-2 text-xs">
                {seciliKategoriler.map((kategoriId) => {
                    // Tüm seviyelerde kategori arama
                    const bulunanKategori = (function bulKategori(kategoriler: Kategori[]): Kategori | undefined {
                        for (const kategori of kategoriler) {
                            if (kategori.id === kategoriId) return kategori;
                            if (kategori.alt_kategoriler) {
                                const altKategorideBulundu = bulKategori(kategori.alt_kategoriler);
                                if (altKategorideBulundu) return altKategorideBulundu;
                            }
                        }
                        return undefined;
                    })(kategoriler);

                    return bulunanKategori ? (
                        <div key={kategoriId} className="bg-black text-white px-2 py-1 rounded">
                            {bulunanKategori.kategori_adi}
                        </div>
                    ) : null;
                })}
            </div>
            <div className="border rounded-lg">
                <Accordion type="multiple" className="w-full">
                    {kategoriler.map((anaKategori) => (
                        <AccordionItem key={anaKategori.id} value={`item-${anaKategori.id}`}>
                            <div className="flex items-center gap-2 px-4">
                                <Checkbox
                                    checked={seciliKategoriler.includes(anaKategori.id)}
                                    onCheckedChange={() => handleKategoriChange(anaKategori.id)}
                                />
                                <AccordionTrigger className="flex-1">
                                    {anaKategori.kategori_adi}
                                </AccordionTrigger>
                            </div>
                            <AccordionContent className="px-4">
                                <Accordion type="multiple" className="w-full">
                                    {anaKategori.alt_kategoriler?.map((ikinciKategori) => (
                                        <AccordionItem key={ikinciKategori.id} value={`item-${ikinciKategori.id}`}>
                                            <div className="flex items-center gap-2 ml-6">
                                                <Checkbox
                                                    checked={seciliKategoriler.includes(ikinciKategori.id)}
                                                    onCheckedChange={() => handleKategoriChange(ikinciKategori.id)}
                                                />
                                                <AccordionTrigger className="flex-1">
                                                    {ikinciKategori.kategori_adi}
                                                </AccordionTrigger>
                                            </div>
                                            <AccordionContent className="px-4">
                                                <div className="flex flex-col gap-2 ml-12">
                                                    {ikinciKategori.alt_kategoriler?.map((ucuncuKategori) => (
                                                        <div key={ucuncuKategori.id} className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={seciliKategoriler.includes(ucuncuKategori.id)}
                                                                onCheckedChange={() => handleKategoriChange(ucuncuKategori.id)}
                                                            />
                                                            <span 
                                                                onClick={() => handleKategoriChange(ucuncuKategori.id)}
                                                                className="cursor-pointer"
                                                            >
                                                                {ucuncuKategori.kategori_adi}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}