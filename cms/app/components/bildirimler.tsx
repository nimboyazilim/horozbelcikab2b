import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Bildirimler() {

    const [bildirimler, setBildirimler] = useState([]);

    useEffect(() => {
        const fetchBildirimler = async () => {
            const response = await api.get(API_ENDPOINTS.bildirimlerListe);
            if (response.data.status == 'success') {
                setBildirimler(response.data.data);
            } else {
                toast({
                    variant: "destructive",
                    title: "Hata",
                    description: "Bildirimler yüklenirken bir hata oluştu."
                });
            }
        }
        fetchBildirimler();
    }, []);


    return (
        <DropdownMenu>
        <DropdownMenuTrigger>
            <div className="flex items-center gap-2 relative">
                <div className="relative">
                    <div className="h-2 w-2 rounded-full bg-orange-500 absolute -top-0.5 right-0" />
                    <IoMdNotificationsOutline className="h-7 w-7 text-2xl text-gray-600" />
                </div>
            </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-96 h-96 overflow-y-auto">
            <DropdownMenuLabel>Bildirimler</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {bildirimler.map((bildirim: any) => (
                <DropdownMenuItem key={bildirim.id}>
                    
                    <Link href={`${bildirim.baslik == 'Sipariş' ? `/siparisler/${bildirim.bildirim_id}` : bildirim.baslik == 'Yeni bayi başvurusu' ? `/musteriler/${bildirim.bildirim_id}` : bildirim.baslik == 'Bayi Onay' ? `/musteriler/${bildirim.bildirim_id}` : `/siparisler/${bildirim.bildirim_id}`}`}>
                    <div className="flex flex-row justify-between border-b pb-2">
                        <div className="flex flex-col">
                            <p className="text-sm font-medium">{bildirim.baslik}</p>
                            <p className="text-xs text-gray-500">{bildirim.icerik}</p>
                        </div>
                        <p className="text-xs text-gray-500">
                            {new Date(bildirim.create_date).toLocaleDateString('tr-TR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                            })}
                        </p>
                    </div>
                    </Link>
                </DropdownMenuItem>
            ))}
           {/* <Button className="w-full">Tümünü Gör</Button> */}
        </DropdownMenuContent>
    </DropdownMenu>
    )
}
