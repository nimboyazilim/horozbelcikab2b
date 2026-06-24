'use client'
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_ENDPOINTS, API_BASE_URL_KATEGORI_RESIM, API_BASE_URL_RESIM } from "@/config/api";
import api from "@/services/api";
import { toast, useToast } from "@/hooks/use-toast";

import { ArrowLeft, FolderSync, Loader2, PlusIcon, Save, Zap, ZapIcon, Search } from "lucide-react"
import { useParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from 'next/dist/client/components/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import BreadcrumbComp from "@/app/components/breadcrumbComp";
import TopluUrunEkle from "@/app/components/topluUrunEkle";
import { Check, ChevronsUpDown } from "lucide-react"


import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { TableHeader } from "@/components/ui/table";


interface Musteri {
    id: number;
    kodu: string;
    ad: string;
    soyad: string;
    eposta: string;
    telefon: string;
    vkntckn: string;
}

interface Adres {
    id: number;
    adres: string;
    il: string;
    ilce: string;
    ulke: string;
    posta_kodu: string;
    tel: string;
    adres_turu: number; // 1: Gönderim Adresi, 2: Fatura Adresi, 3: Gönderim + Fatura Adresi
}

interface Urun {
    id: number;
    stok_kodu: string;
    urun_adi: string;
    resim: string;
    net_birim_fiyat: number;
    kdv_orani: number;
    varyant_urun_adi: string;
    varyant_stok_kodu: string;
    indirimli_fiyat: number;
    fiyat: number;
    varyant_id: number;
    vergi_orani: number;
    vergi_adi: string;
    stok_miktari: number;
    yoldaki_miktar: number;
    uretim_miktar: number;
    miktar2: number;
}

// Tarih formatını ayarlayan yardımcı fonksiyon
const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm" formatında
};

// Add this helper function near the top of the file, after imports
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(',', '');
};

export default function YeniSiparis() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [musteriler, setMusteriler] = useState<Musteri[]>([]);
    const [urunler, setUrunler] = useState<Urun[]>([]);
    const [secilenMusteri, setSecilenMusteri] = useState<Musteri | null>(null);
    const [secilenUrunler, setSecilenUrunler] = useState<{urun: Urun, miktar: number}[]>([]);
    const [aramaMetni, setAramaMetni] = useState("");
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [adresler, setAdresler] = useState<Adres[]>([]);
    const [secilenFaturaAdresi, setSecilenFaturaAdresi] = useState<Adres | null>(null);
    const [secilenKargoAdresi, setSecilenKargoAdresi] = useState<Adres | null>(null);

    // Müşterileri getir
    useEffect(() => {
        const fetchMusteriler = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.musterilerListe);
                if (response.status === 200) {
                    setMusteriler(response.data);
                }
            } catch (error) {
                toast({
                    title: "Hata!",
                    description: "Müşteriler getirilirken bir hata oluştu.",
                    variant: "destructive",
                });
            }
        };
        fetchMusteriler();
    }, []);

    // Müşteri seçildiğinde adresleri getir
    useEffect(() => {
        const fetchAdresler = async () => {
            if (secilenMusteri) {
                try {
                    const response = await api.get(API_ENDPOINTS.musterilerAdreslerListe + secilenMusteri.id);
                    if (response.status === 200) {
                        setAdresler(response.data);
                        // Varsayılan olarak ilk fatura ve kargo adreslerini seç
                        const faturaAdresi = response.data.find((adres: Adres) => adres.adres_turu === 2 || adres.adres_turu === 3);
                        const kargoAdresi = response.data.find((adres: Adres) => adres.adres_turu === 1 || adres.adres_turu === 3);
                        setSecilenFaturaAdresi(faturaAdresi || null);
                        setSecilenKargoAdresi(kargoAdresi || null);
                    }
                } catch (error) {
                    toast({
                        title: "Hata!",
                        description: "Müşteri adresleri getirilirken bir hata oluştu.",
                        variant: "destructive",
                    });
                }
            } else {
                setAdresler([]);
                setSecilenFaturaAdresi(null);
                setSecilenKargoAdresi(null);
            }
        };
        fetchAdresler();
    }, [secilenMusteri]);

    // Ürünleri getir
    const fetchUrunler = async (search: string) => {
        try {
            const response = await api.get(`${API_ENDPOINTS.siparisUrunArama}${secilenMusteri?.id}/${search}`);
            if (response.status === 200) {
                setUrunler(response.data);
            }
        } catch (error) {
            toast({
                title: "Hata!",
                description: "Ürünler getirilirken bir hata oluştu.",
                variant: "destructive",
            });
        }
    };

    // Ürün ekle
    const handleUrunEkle = (urun: Urun) => {
        // Aynı stok koduna sahip ürün var mı kontrol et
        const urunVarMi = secilenUrunler.some(item => item.urun.varyant_stok_kodu === urun.varyant_stok_kodu);
        
        if (urunVarMi) {
            toast({
                title: "Uyarı!",
                description: "Bu ürün zaten sepete eklenmiş.",
                variant: "destructive",
            });
            return;
        }

        // Koli adeti kontrolü
        if (urun.miktar2 > 0) {
            setSecilenUrunler(prev => [...prev, {urun, miktar: urun.miktar2}]);
        } else {
            setSecilenUrunler(prev => [...prev, {urun, miktar: 1}]);
        }
        //setOpen(false);
    };

    // Ürün miktarını güncelle
    const handleMiktarDegistir = (urunId: number, yeniMiktar: number) => {
        const urun = secilenUrunler.find(item => item.urun.varyant_id === urunId)?.urun;
        
        // Eğer miktar 0 veya negatif ise, minimum koli adetine ayarla
        if (yeniMiktar <= 0) {
            yeniMiktar = urun?.miktar2 || 1;
        }

        // Eğer ürünün koli adeti varsa
        if (urun && urun.miktar2 > 0) {
            // Eğer değer koli adetinin katı değilse, en yakın katına yuvarla
            const enYakinKoli = Math.round(yeniMiktar / urun.miktar2) * urun.miktar2;
            yeniMiktar = enYakinKoli;
        }

        setSecilenUrunler(prev => 
            prev.map(item => 
                item.urun.varyant_id === urunId 
                    ? {...item, miktar: yeniMiktar}
                    : item
            )
        );
    };

    // Input değişikliğini işle
    const handleInputChange = (urunId: number, value: string) => {
        const urun = secilenUrunler.find(item => item.urun.varyant_id === urunId)?.urun;
        const yeniMiktar = parseInt(value) || 0;

        // Eğer ürünün koli adeti varsa
        if (urun && urun.miktar2 > 0) {
            // Eğer değer koli adetinin katı değilse, en yakın katına yuvarla
            const enYakinKoli = Math.round(yeniMiktar / urun.miktar2) * urun.miktar2;
            
            if (yeniMiktar !== enYakinKoli) {
                toast({
                    title: "Bilgi",
                    description: `Bu ürün ${urun.miktar2} adetlik koliler halinde satılmaktadır. Miktar ${enYakinKoli} olarak ayarlanacak.`,
                    variant: "default",
                });
                handleMiktarDegistir(urunId, enYakinKoli);
            } else {
                handleMiktarDegistir(urunId, yeniMiktar);
            }
        } else {
            handleMiktarDegistir(urunId, yeniMiktar);
        }
    };

    // Ürünü listeden kaldır
    const handleUrunSil = (urunId: number) => {
        setSecilenUrunler(prev => prev.filter(item => item.urun.varyant_id !== urunId));
    };

    // Siparişi kaydet
    const handleSiparisKaydet = async () => {
        if (!secilenMusteri) {
            toast({
                title: "Hata!",
                description: "Lütfen bir müşteri seçiniz.",
                variant: "destructive",
            });
            return;
        }

        if (!secilenFaturaAdresi || !secilenKargoAdresi) {
            toast({
                title: "Hata!",
                description: "Lütfen fatura ve kargo adreslerini seçiniz.",
                variant: "destructive",
            });
            return;
        }

        if (secilenUrunler.length === 0) {
            toast({
                title: "Hata!",
                description: "Lütfen en az bir ürün ekleyiniz.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const siparisData = {
                musteri_id: secilenMusteri.id,
                fatura_adres_id: secilenFaturaAdresi.id,
                kargo_adres_id: secilenKargoAdresi.id,
                urunler: secilenUrunler.map(item => ({
                    urun_id: item.urun.id,
                    varyant_id: item.urun.varyant_id,
                    miktar: item.miktar
                }))
            };

            const response = await api.post(API_ENDPOINTS.siparislerCreateCms, siparisData);
            if (response.data.status === 'success') {
                toast({
                    title: "Başarılı!",
                    description: "Sipariş başarıyla oluşturuldu.",
                    variant: "default",
                });
                router.push(`/siparisler/${response.data.id}`);
            }
        } catch (error) {
            toast({
                title: "Hata!",
                description: "Sipariş oluşturulurken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

     // Sayıları formatlamak için yardımcı fonksiyon
     const formatNumber = (number: number) => {
        // Önce sayıyı string'e çevir ve gereksiz sıfırları kaldır
        const formatted = Number(number).toString();
        // Eğer tam sayı ise direkt döndür
        if (Number.isInteger(Number(formatted))) {
            return formatted;
        }
        // Değilse, noktadan sonraki gereksiz sıfırları kaldır
        return Number(formatted).toFixed(2).replace(/\.?0+$/, '');
    };

    const breadcrumbData = [
        { name: 'Sipariş Listesi', link: '/siparisler/liste' },
        { name: 'Yeni Sipariş', link: '/siparisler/yeni-siparis' }
    ];

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex justify-between items-center">
                <div>
                    <BreadcrumbComp data={breadcrumbData} />
                </div>
                <Button
                    onClick={handleSiparisKaydet}
                    disabled={isLoading}
                    className="w-40"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Kaydediliyor...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Kaydet
                        </>
                    )}
                </Button>
            </div>
            <Separator className="my-5" />

            <div className="w-full">
                <div className="flex flex-row gap-8">
                    {/* Sol Kolon */}
                    <div className="w-1/2 border p-4 rounded-md border-t-2 border-t-blue-500">
                        <div className="flex flex-col gap-2">
                            <Label className="text-lg font-bold">Müşteri Bilgileri</Label>
                            
                            {/* Müşteri Seçimi */}
                            <div className="mb-4">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between"
                                        >
                                            {secilenMusteri ? `${secilenMusteri.kodu} - ${secilenMusteri.ad} ${secilenMusteri.soyad}` : "Müşteri seçiniz..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Müşteri ara..." />
                                            <CommandList>
                                                <CommandEmpty>Müşteri bulunamadı.</CommandEmpty>
                                                <CommandGroup>
                                                    {musteriler.map((musteri) => (
                                                        <CommandItem
                                                            key={musteri.id}
                                                            onSelect={() => {
                                                                setSecilenMusteri(musteri);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    secilenMusteri?.id === musteri.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {musteri.kodu} - {musteri.ad} {musteri.soyad}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {secilenMusteri && (
                                <div className="flex flex-col gap-2">
                                    <div className="bg-gray-100 dark:bg-gray-800 p-2 text-sm rounded-md">
                                        {secilenMusteri.kodu} - {secilenMusteri.ad} {secilenMusteri.soyad}
                                    </div>
                                    <div className="flex flex-row gap-2 flex-wrap">
                                        <div className="flex flex-col gap-2 text-sm p-2 w-1/2">
                                            <Label className="font-bold">E-posta</Label>
                                            <div>{secilenMusteri.eposta}</div>
                                        </div>
                                        <div className="flex flex-col gap-2 text-sm p-2">
                                            <Label className="font-bold">Telefon</Label>
                                            <div>{secilenMusteri.telefon}</div>
                                        </div>
                                        <div className="flex flex-col gap-2 text-sm p-2">
                                            <Label className="font-bold">VKN/TCKN</Label>
                                            <div>{secilenMusteri.vkntckn}</div>
                                        </div>
                                    </div>

                                    {/* Adres Seçimleri */}
                                    <div className="flex flex-row gap-2 w-full mt-4">
                                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-1/2">
                                            <div className="font-bold text-sm mb-2">Fatura Adresi</div>
                                            <Select
                                                value={secilenFaturaAdresi?.id.toString()}
                                                onValueChange={(value) => {
                                                    const adres = adresler.find(a => a.id.toString() === value);
                                                    setSecilenFaturaAdresi(adres || null);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Fatura adresi seçiniz" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {adresler
                                                        .filter(adres => adres.adres_turu === 2 || adres.adres_turu === 3)
                                                        .map((adres) => (
                                                            <SelectItem key={adres.id} value={adres.id.toString()}>
                                                                {adres.adres}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            {secilenFaturaAdresi && (
                                                <div className="text-sm mt-2">
                                                    {secilenFaturaAdresi.adres}<br />
                                                    {secilenFaturaAdresi.ilce} / {secilenFaturaAdresi.il}<br />
                                                    {secilenFaturaAdresi.ulke} / {secilenFaturaAdresi.posta_kodu}<br />
                                                    {secilenFaturaAdresi.tel}
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-1/2">
                                            <div className="font-bold text-sm mb-2">Kargo Adresi</div>
                                            <Select
                                                value={secilenKargoAdresi?.id.toString()}
                                                onValueChange={(value) => {
                                                    const adres = adresler.find(a => a.id.toString() === value);
                                                    setSecilenKargoAdresi(adres || null);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Kargo adresi seçiniz" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {adresler
                                                        .filter(adres => adres.adres_turu === 1 || adres.adres_turu === 3)
                                                        .map((adres) => (
                                                            <SelectItem key={adres.id} value={adres.id.toString()}>
                                                                {adres.adres}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            {secilenKargoAdresi && (
                                                <div className="text-sm mt-2">
                                                    {secilenKargoAdresi.adres}<br />
                                                    {secilenKargoAdresi.ilce} / {secilenKargoAdresi.il}<br />
                                                    {secilenKargoAdresi.ulke} / {secilenKargoAdresi.posta_kodu}<br />
                                                    {secilenKargoAdresi.tel}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sağ Kolon */}
                    <div className="w-full border p-4 rounded-md border-t-2 border-t-blue-500">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-lg font-bold">Ürünler</Label>
                              {secilenMusteri && <TopluUrunEkle musteriId={secilenMusteri?.id.toString() || ''} setSecilenUrunler={setSecilenUrunler} />}
                                <Dialog open={open} onOpenChange={setOpen}>
                                    <DialogTrigger asChild>
                                        <Button disabled={!secilenMusteri}>
                                            <PlusIcon className="mr-2 h-4 w-4" />
                                            Yeni Ürün Ekle
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-screen-xl">
                                        <DialogHeader>
                                            <DialogTitle>Ürün Ekle</DialogTitle>
                                            <DialogDescription>
                                                Ürün aramak için aşağıdaki alanı kullanabilirsiniz.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <div className="mb-4">
                                                <Input
                                                    placeholder="Ürün ara..."
                                                    value={aramaMetni}
                                                    onChange={(e) => setAramaMetni(e.target.value)}
                                                    onKeyUp={(e) => {
                                                        if (e.key === 'Enter' || (e.target as HTMLInputElement).value.length >= 3) {
                                                            fetchUrunler((e.target as HTMLInputElement).value);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead></TableHead>
                                                            <TableHead>Ürün</TableHead>
                                                            <TableHead>Ürün</TableHead>
                                                            <TableHead>Stok Kodu</TableHead>
                                                            <TableHead>Fiyat</TableHead>
                                                            <TableHead></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {urunler.map((urun, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>
                                                                    <Image
                                                                        src={urun.resim ? API_BASE_URL_RESIM + urun.resim : API_BASE_URL_RESIM+'urun-gorsel.webp'}
                                                                        alt={urun.varyant_urun_adi}
                                                                        width={50}
                                                                        height={50}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>{urun.urun_adi}
                                                                    <div className="text-xs">Stok: {formatNumber(urun.stok_miktari)} - Yoldaki: {formatNumber(urun.yoldaki_miktar)} - Üretim: {formatNumber(urun.uretim_miktar)} - Koli: {formatNumber(urun.miktar2)}</div>
                                                                </TableCell>
                                                                <TableCell>{urun.varyant_urun_adi}</TableCell>
                                                                <TableCell>{urun.varyant_stok_kodu}</TableCell>
                                                                <TableCell>{Number(urun.fiyat).toFixed(2).replace('.', ',')}</TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => handleUrunEkle(urun)}
                                                                    >
                                                                        Ekle
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* Seçilen Ürünler Listesi */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead></TableHead>
                                        <TableHead>Ürün</TableHead>
                                        <TableHead>Miktar</TableHead>
                                        <TableHead>Birim Fiyat</TableHead>
                                        <TableHead>Toplam</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {secilenUrunler.map((item) => (
                                        <TableRow key={item.urun.varyant_id}>
                                            <TableCell>
                                                <Image
                                                    src={item.urun.resim ? API_BASE_URL_RESIM + item.urun.resim : API_BASE_URL_RESIM+'urun-gorsel.webp'}
                                                    alt={item.urun.urun_adi}
                                                    width={50}
                                                    height={50}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{item.urun.urun_adi}</span>
                                                    <span className="text-xs">{item.urun.varyant_stok_kodu}</span>
                                                    <span className="text-xs">{item.urun.varyant_urun_adi}</span>
                                                    <div className="flex flex-row gap-2">
                                                        <span className="text-xs">Stok: {formatNumber(item.urun.stok_miktari)}</span>
                                                        <span className="text-xs">Yoldaki: {formatNumber(item.urun.yoldaki_miktar)}</span>
                                                        <span className="text-xs">Üretim: {formatNumber(item.urun.uretim_miktar)}</span>
                                                        <span className="text-xs">Koli: {formatNumber(item.urun.miktar2)}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={item.urun.miktar2 || 1}
                                                    step={item.urun.miktar2 || 1}
                                                    value={item.miktar}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '') {
                                                            setSecilenUrunler(prev => 
                                                                prev.map(item => 
                                                                    item.urun.varyant_id === item.urun.varyant_id 
                                                                        ? {...item, miktar: 0}
                                                                        : item
                                                                )
                                                            );
                                                        } else {
                                                            handleInputChange(item.urun.varyant_id, value);
                                                        }
                                                    }}
                                                    onBlur={(e) => handleInputChange(item.urun.varyant_id, e.target.value)}
                                                    className="w-20 text-center"
                                                />
                                            </TableCell>
                                            <TableCell>{Number(item.urun.fiyat).toFixed(2).replace('.', ',')}</TableCell>
                                            <TableCell>
                                                {Number(item.urun.fiyat * item.miktar).toFixed(2).replace('.', ',')}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleUrunSil(item.urun.varyant_id)}
                                                >
                                                    Sil
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Toplam Bilgileri */}
                            <div className="flex flex-row gap-2 mt-4">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-full text-center">
                                    <div className="font-bold text-sm">Ara Toplam</div>
                                    <div className="text-sm">
                                        {Number(
                                            secilenUrunler.reduce((total, item) => 
                                                total + (item.urun.fiyat * item.miktar), 0)
                                        ).toFixed(2).replace('.', ',')}
                                    </div>
                                </div>

                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-full text-center">
                                    <div className="font-bold text-sm">KDV</div>
                                    <div className="text-sm">
                                        {Number(
                                            secilenUrunler.reduce((total, item) => 
                                                total + (item.urun.fiyat * item.miktar * (item.urun.vergi_orani / 100)), 0)
                                        ).toFixed(2).replace('.', ',')}
                                    </div>
                                </div>

                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-full text-center">
                                    <div className="font-bold text-sm">Genel Toplam</div>
                                    <div className="text-sm">
                                        {Number(
                                            secilenUrunler.reduce((total, item) => 
                                                total + (item.urun.fiyat * item.miktar * (1 + item.urun.vergi_orani / 100)), 0)
                                        ).toFixed(2).replace('.', ',')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}