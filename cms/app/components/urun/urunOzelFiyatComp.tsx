import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";
import router from "next/router";
import { TableBody, TableCell, TableHeader } from "@/components/ui/table";
import { TableHead } from "@/components/ui/table";
import { TableRow } from "@/components/ui/table";
import { Table } from "@/components/ui/table";
  
export default function UrunOzelFiyatComp({ urunData, tip }: { urunData: any, tip: string }) {
    

    const [fiyat, setFiyat] = useState(0);
    const [fiyatTuru, setFiyatTuru] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [urunOzelFiyatData, setUrunOzelFiyatData] = useState([]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiyat(Number(e.target.value));
    }


    const handleSubmit = async () => {
        setIsLoading(true);
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
               const response = await api.post(API_ENDPOINTS.urunOzelFiyatEkle, {
                    ozel_fiyat_id: fiyatTuru,
                    urun_id: urunId,
                    varyant_id: varyantId,
                    fiyat: fiyat,
                });
                if (response.status === 200) {
                    toast({
                        title: "Başarılı!",
                        description: "Özel fiyat başarıyla oluşturuldu.",
                        variant: "default",
                    });
                }
        
        } catch (error: any) {
            toast({
                title: "Hata!",
                description: error.response.data.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            let urunId = 0;
            let varyantId = 0;
            if(tip === 'ana'){ 
                urunId = urunData.id
                varyantId = 0
            } else {
                urunId = urunData.urun_id
                varyantId = urunData.id
            }
            try {
                const response = await api.get(API_ENDPOINTS.urunOzelFiyatListe + urunId + '/' + varyantId);
                
                if (response.status === 200) {
                    setUrunOzelFiyatData(response.data);
                }
            } catch (error: any) {
                toast({
                    title: "Hata!",
                    description: error.response.data.message,
                    variant: "destructive",
                });
            }
        };

        fetchData();
    }, [urunData]);


    return (
        <div>
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="w-52 mt-5"><PlusCircle className="w-4 h-4" /> Özel Fiyat Tanımla</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Özel Fiyat</AlertDialogTitle>
                    <AlertDialogDescription>
                        Ürün için özel fiyat tanımlamasını buradan yapabilirsiniz.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-2">
                    <Label>Özel Fiyat Türü</Label>
                    <Select value={fiyatTuru} onValueChange={setFiyatTuru}>
                        <SelectTrigger>
                            <SelectValue placeholder="Özel Fiyat Türü Seçiniz" />
                            </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Bayi 1</SelectItem>
                            <SelectItem value="2">Bayi 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Fiyat</Label>
                    <Input
                        className="w-full"
                        name="fiyat"
                        value={fiyat}
                        onChange={handleChange}
                        type="number"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>Kaydet</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

<div className="mt-5 border rounded-md p-2">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="font-bold">Özel Fiyat Türü</TableHead>
                    <TableHead className="font-bold">Fiyat</TableHead>
                    <TableHead className="font-bold">İşlem</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
            {urunOzelFiyatData.map((item: any) => (
                    <TableRow key={item.id}>
                        <TableCell>{item.ozel_fiyat_adi}</TableCell>
                        <TableCell>{item.fiyat}</TableCell>
                        <TableCell>
                            <Button variant="destructive" size="icon">
                                <Trash2 className="w-3 h-3" />
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