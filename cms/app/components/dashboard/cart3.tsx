'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";

export default function Cart3() {
    const [sepet, setSepet] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const formatNumber = (num: number) => {
        return num.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    useEffect(() => {
        fetchData('tumzamanlar');
    }, []);

    const fetchData = async (type: string) => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.dashboardSepetToplam + type );
            if (response.data.status == 'success') {
                setSepet(response.data.data);
            } else {
                toast({
                    variant: "destructive",
                    title: "Hata",
                    description: "Sepetler toplamı yüklenirken bir hata oluştu."
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Sepetler toplamı yüklenirken bir hata oluştu."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Sepet</CardTitle>
                    <CardDescription>Sepet Toplamı</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row items-center gap-2 h-8">
                        <div><ArrowLeftRight className="w-7 h-7" /></div>
                        {isLoading ? 
                        <div className="text-2xl font-bold"><Loader2 className="w-7 h-7 animate-spin" /></div> 
                        : <div className="text-2xl font-bold">{formatNumber(sepet)}</div>
                        }              
                    </div>
                </CardContent>  
                <CardFooter>
                    <Tabs defaultValue="tumzamanlar" className="w-[400px]">
                        <TabsList>
                            <TabsTrigger value="tumzamanlar" onClick={() => fetchData('tumzamanlar')}>Tüm Zamanlar</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardFooter>
            </Card>
        </>
    )
}
