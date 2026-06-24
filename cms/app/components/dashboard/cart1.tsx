'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Wallet, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";
export default function Cart1() {
    const [satis, setSatis] = useState(0);
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
            const response = await api.get(API_ENDPOINTS.dashboardSatisToplam + type );
            if (response.data.status == 'success') {
                setSatis(response.data.data);
            } else {
                toast({
                    variant: "destructive",
                    title: "Hata",
                    description: "Satışlar toplamı yüklenirken bir hata oluştu."
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Satışlar toplamı yüklenirken bir hata oluştu."
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Satışlar</CardTitle>
                    <CardDescription>Satışlarınızın Toplamı</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row items-center gap-2 h-8">
                        <div><Wallet className="w-7 h-7" /></div>
                       {isLoading ? 
                       <Loader2 className="w-7 h-7 animate-spin" />
                       : <div className="text-2xl font-bold">{formatNumber(satis)}</div>
                       }              
                    </div>
                </CardContent>  
                <CardFooter>
                    <Tabs defaultValue="buhafta" className="w-[400px]">
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
