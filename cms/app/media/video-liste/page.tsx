'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { API_ENDPOINTS } from "@/config/api";
import api from "@/services/api";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function VideoListePage() {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const res = await api.get(API_ENDPOINTS.mediaVideoList);
        setData(res.data);
        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await api.delete(`${API_ENDPOINTS.mediaVideoCreate}/${deleteId}`);
            toast({ title: "Başarılı", description: "Video silindi.", variant: "default" });
            fetchData();
        } catch {
            toast({ title: "Hata", description: "Silme işlemi başarısız.", variant: "destructive" });
        } finally {
            setDeleteLoading(false);
            setDeleteId(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">Video Listesi</h2>
                <Link href="/media/video-ekle">
                    <Button>+ Yeni Video</Button>
                </Link>
            </div>
            <Separator className="my-5" />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Başlık</TableHead>
                            <TableHead>Video</TableHead>
                            <TableHead>İşlem</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Yükleniyor...
                                </TableCell>
                            </TableRow>
                        ) : data.length ? (
                            data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.title}</TableCell>
                                    <TableCell>
                                        <iframe
                                            src={item.url}
                                            width={180}
                                            height={100}
                                            allowFullScreen
                                            className="rounded"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/media/video-ekle?id=${item.id}`)}
                                            >
                                                Düzenle
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setDeleteId(item.id)}
                                                    >
                                                        Sil
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Videoyu silmek istediğinize emin misiniz?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Bu işlem geri alınamaz. Video kalıcı olarak silinecek.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel onClick={() => setDeleteId(null)}>İptal</AlertDialogCancel>
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
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Kayıt bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}