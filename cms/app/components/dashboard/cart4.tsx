'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";

export default function Cart2() {
    const [data, setData] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const formatNumber = (num: number) => {
        return num.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    useEffect(() => {
        fetchData('buay');
    }, []);

    const fetchData = async (type: string) => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.dashboardEnCokSatilanUrunler + type );
            if (response.data.status == 'success') {
                setData(response.data.data);
            } else {
                toast({
                    variant: "destructive",
                    title: "Hata",
                    description: "En Çok Satılan Ürünler yüklenirken bir hata oluştu."
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "En Çok Satılan Ürünler yüklenirken bir hata oluştu."
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>En Çok Satılan Ürünler</CardTitle>
                    <CardDescription>En Çok Satılan Ürünlerin Listesi</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] mb-5 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ürün Adı</TableHead>
                        <TableHead>Toplam Miktar</TableHead>
                        <TableHead>Toplam Satış</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item: any) => (
                      <TableRow key={item.urun_adi}>
                        <TableCell>{item.urun_adi}</TableCell>
                        <TableCell>{formatNumber(Number(item.toplam_miktar))}</TableCell>
                        <TableCell>{formatNumber(Number(item.toplam_satis))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </CardContent>  
                <CardFooter>
                    <Tabs defaultValue="buay" className="w-[400px]">
                        <TabsList>
                            <TabsTrigger value="bugun" onClick={() => fetchData('bugun')}>Bugün</TabsTrigger>
                            <TabsTrigger value="buhafta" onClick={() => fetchData('buhafta')}>Bu Hafta</TabsTrigger>
                            <TabsTrigger value="buay" onClick={() => fetchData('buay')}>Bu Ay</TabsTrigger>
                            <TabsTrigger value="buyil" onClick={() => fetchData('buyil')}>Bu Yıl</TabsTrigger>
                            <TabsTrigger value="tumzamanlar" onClick={() => fetchData('tumzamanlar')}>Tüm Zamanlar</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardFooter>
            </Card>
        </>
    )
}
