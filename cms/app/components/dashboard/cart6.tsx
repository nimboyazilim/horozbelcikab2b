'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";

export default function Cart6() {
    const [istatistikler, setIstatistikler] = useState({
        toplamUrunSayisi: 0,
        toplamStokAdedi: 0,
        toplamKategoriSayisi: 0,
        toplamMusteriSayisi: 0
    });
    const [isLoading, setIsLoading] = useState(false);

    const formatNumber = (num: number) => {
        return num.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    useEffect(() => {
        fetchData('buhafta');
    }, []);

    const fetchData = async (type: string) => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.dashboardIstatistikler );
            if (response.data.status == 'success') {
                setIstatistikler(response.data.data);
            } else {
                toast({
                    variant: "destructive",
                    title: "Hata",
                    description: "İstatistikler yüklenirken bir hata oluştu."
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "İstatistikler yüklenirken bir hata oluştu."
            });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>İstatistikler</CardTitle>
                    <CardDescription></CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">

                    <div className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
                      <p className="text-sm font-medium">Satıştaki Toplam Ürün</p>
                      <p className="text-sm font-bold">{istatistikler.toplamUrunSayisi}</p>
                    </div>

                    <div className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
                      <p className="text-sm font-medium">Satıştaki Toplam Stok Adedi</p>
                      <p className="text-sm font-bold">{formatNumber(istatistikler.toplamStokAdedi)}</p>
                    </div>

                    <div className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
                      <p className="text-sm font-medium">Satıştaki Toplam Kategori</p>
                      <p className="text-sm font-bold">{istatistikler.toplamKategoriSayisi}</p>
                    </div>

                    <div className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
                      <p className="text-sm font-medium">Toplam Üye</p>
                      <p className="text-sm font-bold">{istatistikler.toplamMusteriSayisi}</p>
                    </div>

                  </div>
                </CardContent>  
                
            </Card>
        </>
    )
}
