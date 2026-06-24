"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { useEffect } from "react"
import { useState } from "react"
import api from "@/services/api"
import { API_ENDPOINTS } from "@/config/api"
import { toast } from "@/hooks/use-toast"

const chartData = [
  { month: "Ocak", satis: 186, siparis: 80 },
  { month: "Şubat", satis: 305, siparis: 200 },
  { month: "Mart", satis: 237, siparis: 120 },
  { month: "Nisan", satis: 73, siparis: 190 },
  { month: "Mayıs", satis: 209, siparis: 130 },
  { month: "Haziran", satis: 214, siparis: 140 },
]

const chartConfig = {
  satis: {
    label: "Satış",
    color: "#2563eb",
  },
  siparis: {
    label: "Sipariş",
    color: "#60a5fa",
  },
} satisfies ChartConfig

export default function Grafik1() {

    const [chartData, setChartData] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(false);



    useEffect(() => {
        fetchData('buhafta');
    }, []);

    const fetchData = async (type: string) => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.dashboardGrafik1 );
            if (response.data.status == 'success') {
                setChartData(response.data.data);
            } else {
                toast({
                    variant: "destructive",
                    title: "Hata",
                    description: "Grafik yüklenirken bir hata oluştu."
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Grafik yüklenirken bir hata oluştu."
            });
        } finally {
            setIsLoading(false);
        }
    };

    
    


  return (
    <Card>
      <CardHeader>
        <CardTitle>Satış ve Sipariş Grafiği</CardTitle>
        <CardDescription>Satışlarınızın ve Siparişlerinizin Grafiği</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="satis" fill="var(--color-satis)" radius={4} />
        <Bar dataKey="siparis" fill="var(--color-siparis)" radius={4} />
      </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
