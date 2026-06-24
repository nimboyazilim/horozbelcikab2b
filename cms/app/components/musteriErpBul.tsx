import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/config/api";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { Ellipsis, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function MusteriErpBul({ formData, setFormData }: { formData: any; setFormData: any }) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [filter, setFilter] = useState("");
    const [listeLoading, setListeLoading] = useState(false);

    const fetchData = async () => {
        try {
            setListeLoading(true);
            const response = await api.get(API_ENDPOINTS.mikroCariListe);
            if (response.data.status === 'success') {
                setData(response.data.data);
                setOpen(true);
            }
        } catch (error) {
            toast({
                title: "Hata!",
                description: "Mikro sistemden cari listesi getirilirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setListeLoading(false);
        }
    };

    const handleSelect = (
        cariKod: string,
        cari_vdaire_no: string,
        cari_satis_fk: string,
        cari_unvan1: string,
        cari_unvan2: string
    ) => {

       /* if (cari_vdaire_no != formData.vkntckn) {
            toast({
                title: "Hata!",
                description: "Vergi No eşleşmedi.",
                variant: "destructive",
            });
            return;
        }*/

            let fiyat_grup_id = 1;

            if(cari_satis_fk == '9') {
                fiyat_grup_id = 1;
            }
            
            if(cari_satis_fk == '10') {
                fiyat_grup_id = 2;
            }
            
            if(cari_satis_fk == '12') {
                fiyat_grup_id = 3;
            }

            if(cari_satis_fk == '13') {
                fiyat_grup_id = 4;
            }

            if(cari_satis_fk == '14') {
                fiyat_grup_id = 5;
            }

            

        setFormData({
            ...formData,
            kodu: cariKod,
            fiyat_grup_id: fiyat_grup_id,
            ad: cari_unvan1 || formData.ad,
            soyad: cari_unvan2 || formData.soyad
        });
        setOpen(false);
        toast({
            title: "Başarılı!",
            description: "Cari kodu ve fiyat grupu başarıyla eşleştirildi.Kaydet butonuna tıkladıktan sonra başarılı bir şekilde kaydedilecektir.",
            variant: "default",
        });
    };


    const filteredData = data.filter((item) =>
        Object.values(item).some((value) =>
            String(value).toLowerCase().includes(filter.toLowerCase())
        )
    );

    return (
        <>
            <Button variant="outline" className="bg-gray-200 hover:bg-gray-300" onClick={fetchData}>
                <Ellipsis className="w-4 h-4" /> {listeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-screen-xl">
                    <DialogHeader>
                        <DialogTitle>Cari Listesi</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Ara..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    <div className="max-h-[500px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cari Kod</TableHead>
                                    <TableHead>Cari Unvan1</TableHead>
                                    <TableHead>Cari Unvan2</TableHead>
                                    <TableHead>Vergi No</TableHead>
                                    <TableHead>Satış Fiyat Listesi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((item, index) => (
                                    <TableRow
                                        key={index}
                                        className="cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSelect(item.cari_kod, item.cari_vdaire_no, item.cari_satis_fk, item.cari_unvan1, item.cari_unvan2)}
                                    >
                                        <TableCell>{item.cari_kod}</TableCell>
                                        <TableCell>{item.cari_unvan1}</TableCell>
                                        <TableCell>{item.cari_unvan2}</TableCell>
                                        <TableCell>{item.cari_vdaire_no}</TableCell>
                                        <TableCell>{item.sfl_aciklama}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}