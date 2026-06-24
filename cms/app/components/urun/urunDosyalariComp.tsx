import { API_ENDPOINTS, API_BASE_URL_DOSYA } from "@/config/api";
import api from "@/services/api";
import { useEffect } from "react";

import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
export default function UrunDosyalariComp({ urunData }: { urunData: any }) {

    const [dosyaListesi, setDosyaListesi] = useState<any[]>([]);
    const [urunDosyaListesi, setUrunDosyaListesi] = useState<any[]>([]);
    const [dosyaGrupId, setDosyaGrupId] = useState<number>(0);
    const [dosyaAdi, setDosyaAdi] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    const dosyaListesiFetch = async () => {
        const response = await api.get(API_ENDPOINTS.ekliDosyaListesi);
        setDosyaListesi(response.data);
    }
    const urunDosyaListesiFetch = async () => {
        const response = await api.get(API_ENDPOINTS.urunDosyaListesi + urunData.id);
        setUrunDosyaListesi(response.data);
    }

    useEffect(() => {
        dosyaListesiFetch();
        urunDosyaListesiFetch();
    }, [urunData]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setSelectedFiles(e.target.files);
    };

    const handleDosyaEkle = async () => {
        if (!selectedFiles) return;
        
        setIsLoading(true);
        const files = Array.from(selectedFiles);

        if(dosyaAdi == "" || dosyaGrupId == 0 || files.length == 0){
            toast({
                title: "Hata",
                variant: "destructive",
                description: "Dosya adı ve dosya grup boş bırakılamaz",
            });
            setIsLoading(false);
            return;
        }
        
        try {
            const formData = new FormData();
            
            files.forEach(file => {
                formData.append('image', file);
            });
            
            formData.append('urunId', urunData.id);
            formData.append('dosyaGrupId', dosyaGrupId.toString());
            formData.append('dosyaAdi', dosyaAdi);

            const response = await api.post(API_ENDPOINTS.ekliDosyaEkle, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast({
                title: "Başarılı",
                description: response.data.message,
            });
            urunDosyaListesiFetch();
            setDosyaAdi("");
            setDosyaGrupId(0);
            setSelectedFiles(null);
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (error: any) {
            console.error("Dosya yükleme hatası:", error);
            toast({
                title: "Hata",
                variant: "destructive",
                description: error.response?.data?.message || "Bir hata oluştu",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDosyaSil = async (id: number) => {
        const response = await api.delete(API_ENDPOINTS.ekliDosyaSil + id);
        toast({
            title: "Başarılı",
            description: response.data.message,
        });
        urunDosyaListesiFetch();
    }
    
    return (
        <div>
            <h1 className="text-lg font-bold mb-5">Ürün Dosyaları</h1>
            <div className="flex flex-row gap-2">
                <div className="flex flex-col gap-2">
            <Select onValueChange={(value) => setDosyaGrupId(parseInt(value))}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Dosya Grupları" />
                </SelectTrigger>
                <SelectContent>
                    {dosyaListesi.map((dosya) => (
                        <SelectItem key={dosya.id} value={dosya.id.toString()}>
                            {dosya.dosya_baslik}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
             </div>
             <div className="flex flex-col gap-2">
                <Input type="text" placeholder="Dosya Adı" autoComplete="off"  name="dosyaAdi" onChange={(e) => setDosyaAdi(e.target.value)} />
             </div>
             <div className="flex flex-col gap-2">
                <Input 
                    type="file" 
                    placeholder="Dosya Adı"  
                    name="image" 
                    onChange={handleFileSelect} 
                    multiple={true} 
                />
             </div>
            
            <Button 
                type="button" 
                onClick={handleDosyaEkle}
                disabled={isLoading}
            >
                {isLoading ? 'Yükleniyor...' : 'Dosya Ekle'}
            </Button>

            </div>

            <div className="flex flex-col gap-2 mt-5">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Dosya Grupları</TableHead>
                            <TableHead>Dosya Adı</TableHead>
                            <TableHead>İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {urunDosyaListesi.map((dosya) => (
                            <TableRow key={dosya.id}>
                                <TableCell>{dosya.dosya_baslik}</TableCell>
                                <TableCell><a href={API_BASE_URL_DOSYA + dosya.dosya_yolu} target="_blank" rel="noopener noreferrer">{dosya.dosya_adi}</a></TableCell>
                                <TableCell>
                                    <Button variant="destructive" onClick={() => handleDosyaSil(dosya.id)}>Sil</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
               
            </div>
        </div>
    )
}