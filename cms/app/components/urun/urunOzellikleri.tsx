"use client"

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Plus, Trash } from "lucide-react";
import { Check, ChevronsUpDown } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { API_ENDPOINTS } from "@/config/api";
import api from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
// Tip tanımlamaları
interface Ozellik {
    id: number;
    ozellik_adi: string;
    ozellik_ust_id?: number;
}

export default function UrunOzellikleri({urunData}:{urunData:any}) {
    const [urunOzellikleri, setUrunOzellikleri] = useState<any[]>([]);
    const [openAna, setOpenAna] = useState(false);
    const [openAlt, setOpenAlt] = useState(false);
    const [secilenAnaOzellikValue, setSecilenAnaOzellikValue] = useState("");
    const [secilenAltOzellikValue, setSecilenAltOzellikValue] = useState("");
    const [anaOzellikler, setAnaOzellikler] = useState<any[]>([]);
    const [altOzellikler, setAltOzellikler] = useState<any[]>([]);

 


    const handleOzellikEkle = async () => {

        try {
            const response = await api.post(API_ENDPOINTS.urunOzellikEkle, {
                urun_id: urunData.id,
                ozellik_id: secilenAltOzellikValue
            });
            toast({
                title: "Bilgi",
                description: response.data.message,
            });
            getUrunOzellikleri();
        } catch (error:any) {
            toast({
                title: "Hata",
                description: error.response.data.message,
            });
        }


    }

    const tumOzellikleriGetir = async () => {
        const response = await api.get(API_ENDPOINTS.urunOzelliklerTumListe);
        setAnaOzellikler(response.data.anaOzellikler);
        setAltOzellikler(response.data.altOzellikler);
    }

    const getUrunOzellikleri = async () => {
        const response = await api.get(API_ENDPOINTS.urunOzellikListe + urunData.id);
        setUrunOzellikleri(response.data);
    }

    const handleOzellikSil = async (ozellikId: number) => {
      //  const response = await api.delete(API_ENDPOINTS.urunOzellikSil + ozellikId);
        toast({
            title: "Bilgi",
            description: "Özellik silindi",
        });
        getUrunOzellikleri();
    }

    useEffect(() => {
        tumOzellikleriGetir();
        getUrunOzellikleri();
    }, []);

    return (
        <div className="my-5">
            <h1 className="text-lg font-bold mb-5">Özellikler</h1>
            <div className="flex flex-row gap-4">
                <Popover open={openAna} onOpenChange={setOpenAna}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openAna}
                            className="w-[200px] justify-between"
                        >
                            {secilenAnaOzellikValue
                                ? anaOzellikler.find((oz) => oz.id === parseInt(secilenAnaOzellikValue))?.ozellik_adi
                                : "Ana Özellik Seçin..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                            <CommandInput placeholder="Ana özellik ara..." className="h-9" />
                            <CommandList>
                                <CommandEmpty>Özellik bulunamadı.</CommandEmpty>
                                <CommandGroup>
                                    {anaOzellikler.map((ozellik) => (
                                        <CommandItem
                                            key={ozellik.id}
                                            value={String(ozellik.id)}
                                            onSelect={(currentValue) => {
                                                setSecilenAnaOzellikValue(currentValue === secilenAnaOzellikValue ? "" : currentValue);
                                                setSecilenAltOzellikValue("");
                                                setOpenAna(false);
                                            }}
                                        >
                                            {ozellik.ozellik_adi}
                                            <Check
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    secilenAnaOzellikValue === String(ozellik.id) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {secilenAnaOzellikValue && (
                    <Popover open={openAlt} onOpenChange={setOpenAlt}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openAlt}
                                className="w-[200px] justify-between"
                            >
                                {secilenAltOzellikValue
                                    ? altOzellikler.find((oz) => oz.id === parseInt(secilenAltOzellikValue))?.ozellik_adi
                                    : "Alt Özellik Seçin..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandInput placeholder="Alt özellik ara..." className="h-9" />
                                <CommandList>
                                    <CommandEmpty>Özellik bulunamadı.</CommandEmpty>
                                    <CommandGroup>
                                        {altOzellikler
                                            .filter(oz => oz.ozellik_ust_id === parseInt(secilenAnaOzellikValue))
                                            .map((ozellik) => (
                                                <CommandItem
                                                    key={ozellik.id}
                                                    value={String(ozellik.id)}
                                                    onSelect={(currentValue) => {
                                                        setSecilenAltOzellikValue(currentValue === secilenAltOzellikValue ? "" : currentValue);
                                                        setOpenAlt(false);
                                                    }}
                                                >
                                                    {ozellik.ozellik_adi}
                                                    <Check
                                                        className={cn(
                                                            "ml-auto h-4 w-4",
                                                            secilenAltOzellikValue === String(ozellik.id) ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                </CommandItem>
                                            ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}

                <Button onClick={() => handleOzellikEkle()}>
                    <Plus className="w-4 h-4" /> Özellik Ekle
                </Button>
             
            </div>

            <div className="flex flex-col gap-4 text-sm mt-5">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Özellik</TableHead>
                            <TableHead>Tanımlı Değer</TableHead>
                            <TableHead>Sil</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {urunOzellikleri.map((ozellik) => (
                            <TableRow key={ozellik.ozellik_id}>
                                <TableCell>{ozellik.ana_ozellik_adi}</TableCell>
                                <TableCell>{ozellik.ozellik_adi}</TableCell>
                                <TableCell>
                                    <Button variant="destructive" size="icon" onClick={() => handleOzellikSil(ozellik.ozellik_id)}>
                                        <Trash className="w-2 h-2" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </div>

        </div>
    )
}