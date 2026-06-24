'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { API_ENDPOINTS, API_BASE_URL_PDF } from "@/config/api";
import api from "@/services/api";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CertificateListPage() {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const [deleteCert, setDeleteCert] = useState<{ id: number; name: string } | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const res = await api.get(API_ENDPOINTS.certificateList);
        setData(res.data);
        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!deleteCert) return;
        setDeleteLoading(true);
        try {
            await api.delete(`${API_ENDPOINTS.certificateDelete}/${deleteCert.id}`, {
                _logAction: { action: `Sertifika silindi: "${deleteCert.name}"`, category: 'Sertifika' },
            } as object);
            toast({ title: "Başarılı", description: "Sertifika silindi.", variant: "default" });
            fetchData();
        } catch {
            toast({ title: "Hata", description: "Silme işlemi başarısız.", variant: "destructive" });
        } finally {
            setDeleteLoading(false);
            setDeleteCert(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">Sertifika Listesi</h2>
                <Link href="/sertifikalar/ekle">
                    <Button>+ Yeni Sertifika</Button>
                </Link>
            </div>
            <Separator className="my-5" />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Adı</TableHead>
                            <TableHead>Dosya</TableHead>
                            <TableHead>İşlem</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Yükleniyor...</TableCell>
                            </TableRow>
                        ) : data.length ? (
                            data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>
                                        <a
                                            href={`${API_BASE_URL_PDF}/${item.file}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            Dosyayı Görüntüle
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/sertifikalar/ekle?id=${item.id}`)}
                                            >
                                                Düzenle
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setDeleteCert({ id: item.id, name: item.name })}
                                                    >
                                                        Sil
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Sertifikayı silmek istediğinize emin misiniz?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Bu işlem geri alınamaz. Sertifika kalıcı olarak silinecek.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel onClick={() => setDeleteCert(null)}>İptal</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={handleDelete}
                                                            disabled={deleteLoading}
                                                        >
                                                            {deleteLoading ? "Siliniyor..." : "Sil"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Kayıt bulunamadı.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}