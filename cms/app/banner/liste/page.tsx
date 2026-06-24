'use client';
import { useState, useEffect } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { API_ENDPOINTS, API_BASE_URL_RESIM_BANNER } from '@/config/api';
import api from '@/services/api';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/dist/client/components/navigation';
import { Separator } from '@/components/ui/separator';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import BreadcrumbComp from '@/app/components/breadcrumbComp';
import Image from 'next/image';

export default function BannerListePage() {
    const { toast } = useToast();
    const router = useRouter();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.bannerListe);
            setData(response.data);
        } catch (error) {
            toast({ variant: "destructive", title: "Hata", description: "Veriler yüklenirken bir hata oluştu." });
        } finally {
            setIsLoading(false);
        }
    };

    const breadcrumbData = [
        { name: 'Banner Listesi', link: '/banner/liste' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <BreadcrumbComp data={breadcrumbData} />
                <div>
                    <Link href="/banner">
                        <Button>
                            <PlusIcon className="w-4 h-4" /> Yeni Banner
                        </Button>
                    </Link>
                </div>
            </div>
            <Separator className="my-5" />
            <div className="rounded-md border" style={{ height: 'calc(100vh - 185px)' }}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Resim</TableHead>
                            <TableHead>Başlık</TableHead>
                            <TableHead>Açıklama</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Yükleniyor...</TableCell>
                            </TableRow>
                        ) : data.length ? (
                            data.map((row: any) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => router.push(`/banner/${row.id}`)}
                                    className="cursor-pointer"
                                >
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>
                                        <Image src={`${API_BASE_URL_RESIM_BANNER}/${row.image}`} alt={row.title} width={50} height={50} />
                                    </TableCell>
                                    <TableCell>{row.title_tr}</TableCell>
                                    <TableCell>{row.description_tr}</TableCell>
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