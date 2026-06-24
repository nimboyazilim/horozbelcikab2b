'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Cart5() {
    const [data, setData] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const formatNumber = (num: number) => {
        return num.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', '');
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.dashboardSonAlinanSiparisler );
            if (response.data.status == 'success') {
                setData(response.data.data);
            } else {
                toast({
                    variant: "destructive",
                    title: "Hata",
                    description: "Son Alınan Siparişler yüklenirken bir hata oluştu."
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Son Alınan Siparişler yüklenirken bir hata oluştu."
            });
        } finally {
            setIsLoading(false);
        }
    };  
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Son Alınan Siparişler</CardTitle>
                    <CardDescription>Son Alınan Siparişlerin Listesi</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] mb-5 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sipariş No</TableHead>
                        <TableHead>Müşteri Adı</TableHead>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Toplam Fiyat</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item: any) => (
                        
                            <TableRow key={item.id}>
                                <TableCell className="text-red-700 font-bold">{item.siparis_no}</TableCell>
                                <TableCell>{item.ad + ' ' + item.soyad}</TableCell>
                                <TableCell>{formatDate(item.create_date)}</TableCell>
                                <TableCell>{formatNumber(Number(item.toplam_tutar))}</TableCell>
                                <TableCell>
                                    <Link href={`/siparisler/${item.id}`} key={item.id}>
                                        <Button variant="outline" size="sm">Detay</Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                       
                    ))}
                  </TableBody>
                </Table>
                </CardContent>
            </Card>
        </>
    )
}
