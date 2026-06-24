"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Upload, FileSpreadsheet, AlertCircle } from "lucide-react"
import { API_ENDPOINTS, API_BASE_URL_KATEGORI_RESIM, API_BASE_URL_RESIM } from "@/config/api";
import api from "@/services/api";
import { toast, useToast } from "@/hooks/use-toast";


/**
 * Toplu Ürün Ekleme Komponenti
 * 
 * Bu komponent, kullanıcıların Excel dosyası ile toplu ürün eklemesini sağlar.
 * 
 * Kullanım Örnekleri:
 * 
 * // Basit kullanım
 * <TopluUrunEkleme />
 * 
 * // Özelleştirilmiş kullanım
 * <TopluUrunEkleme 
 *   variant="default" 
 *   size="lg" 
 *   className="w-full bg-blue-600 text-white" 
 * />
 * 
 * // Cart sayfasında kullanım
 * <div className="p-4">
 *   <h2 className="text-lg font-semibold mb-4">Toplu İşlemler</h2>
 *   <TopluUrunEkleme />
 * </div>
 * 
 * Özellikler:
 * - Ürün listesini Excel formatında indirme
 * - Düzenlenmiş Excel dosyasını yükleme
 * - Sadece .xlsx ve .xls dosyalarını kabul etme
 * - Yükleme ve indirme durumlarını gösterme
 * - Toast bildirimleri ile kullanıcı geri bildirimi
 * 
 * Backend Endpoint'leri (oluşturulması gereken):
 * - GET /urunler/toplu-urun-listesi - Ürün listesini Excel olarak indir
 * - POST /sepet/toplu-urun-ekle - Excel dosyasını işle ve sepete ekle
 * 
 * Excel Dosya Formatı (Önerilen):
 * | Ürün Kodu | Ürün Adı | Miktar | Varyant (Opsiyonel) |
 * |-----------|----------|--------|-------------------|
 * | PRD001    | Ürün 1   | 5      | Kırmızı           |
 * | PRD002    | Ürün 2   | 10     | Mavi              |
 */

interface TopluUrunEkleProps {
  musteriId: string;
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  setSecilenUrunler: (urunler: any[]) => void
}

export default function TopluUrunEkle({ 
  musteriId,
  className, 
  variant = "outline", 
  size = "default",
  setSecilenUrunler,
}: TopluUrunEkleProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isDownloading, setIsDownloading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
    const [errorProducts, setErrorProducts] = useState<any[]>([])
    const { toast } = useToast();






    const handleDownloadProductList = async () => {
        setIsDownloading(true)
        try {
            const response = await api.get(API_ENDPOINTS.siparisTopluExcelUrunListesi + musteriId, {
                responseType: 'blob' // Binary data için gerekli
            });

            // Dosyayı indir
            const url = window.URL.createObjectURL(response.data)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'urun-listesi.xlsx')
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

            
            toast({
                title: "Başarılı!",
                description: "Ürün listesi başarıyla indirildi.",
            })
        } catch (error) {
            console.error('Download error:', error)
            toast({
                title: "Hata!",
                description: "Ürün listesi indirilirken bir hata oluştu.",
            })
        } finally {
            setIsDownloading(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            // Sadece Excel dosyalarını kabul et
            if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                file.type === 'application/vnd.ms-excel') {
                setSelectedFile(file)
            } else {
                toast({
                    title: "Hata!",
                    description: "Lütfen sadece Excel dosyası (.xlsx veya .xls) yükleyin.",
                })
                e.target.value = ''
            }
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            toast({
                title: "Hata!",
                description: "Lütfen bir dosya seçin.",
            })
            return
        }

        setIsUploading(true)
        try {
          

            const formData = new FormData()
            formData.append('file', selectedFile)

            const response = await api.post(API_ENDPOINTS.siparisTopluExcelUrunEkleCms + musteriId, formData);
        
            
            if (response.data.status == 'success') {
                    const { data } = response.data;
                   
                // Gelen veriyi doğru formata dönüştür ve eksik alanları kontrol et
                const formattedUrunler = data.eklenenUrunler.map((urun: any) => ({
                    urun: {
                        id: urun.id || 0,
                        stok_kodu: urun.stok_kodu || '',
                        urun_adi: urun.urun_adi || '',
                        resim: urun.resim || null,
                        net_birim_fiyat: urun.net_birim_fiyat || 0,
                        kdv_orani: urun.kdv_orani || 0,
                        varyant_urun_adi: urun.varyant_urun_adi || '',
                        varyant_stok_kodu: urun.varyant_stok_kodu || '',
                        indirimli_fiyat: urun.indirimli_fiyat || 0,
                        fiyat: urun.fiyat || 0,
                        varyant_id: urun.varyant_id || 0,
                        vergi_orani: urun.vergi_orani || 0,
                        vergi_adi: urun.vergi_adi || '',
                        stok_miktari: urun.stok_miktari || 0,
                        yoldaki_miktar: urun.yoldaki_miktar || 0,
                        uretim_miktar: urun.uretim_miktar || 0,
                        miktar2: urun.miktar2 || 1
                    },
                    miktar: urun.miktar || 1
                }));

                setSecilenUrunler(formattedUrunler)

                // Başarı mesajını göster
                toast({
                    title: "Başarılı!",
                    description: response.data.message,
                })

                // Eğer hatalı ürünler varsa onları dialog'da göster
                if (data.hataliUrunler && data.hataliUrunler.length > 0) {
                    setErrorProducts(data.hataliUrunler)
                    setIsErrorDialogOpen(true)
                } else {
                    // Hiç hata yoksa direkt cart sayfasına git
                    //router.push(`/cart/${cartId}`)
                }

                //console.log('Eklenen ürünler:', data.eklenenUrunler);
                //console.log('Toplam eklenen:', data.toplamEklenen);
                //console.log('Toplam hatalı:', data.toplamHatali);
            } else {
                toast({
                    title: "Hata!",
                    description: response.data.message,
                })
            }
            
            // Dialog'u kapat ve formu temizle
            setIsOpen(false)
            setSelectedFile(null)
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
            if (fileInput) fileInput.value = ''
            
        } catch (error: any) {
            console.error('Upload error:', error)
            toast({
                title: "Hata!",
                description: error.response?.data?.message || "Dosya yüklenirken bir hata oluştu.",
            })
        } finally {
            setIsUploading(false)
        }
    }

    const handleErrorDialogClose = async () => {
        setIsErrorDialogOpen(false)
        setErrorProducts([])
      
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant={variant} size={size} className={className + " bg-orange-600 text-white hover:bg-orange-700 hover:text-white"}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Toplu Ürün Ekleme
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Toplu Ürün Ekleme</DialogTitle>
                        <DialogDescription>
                            Ürün listesini indirin, Excel dosyasını düzenleyin ve tekrar yükleyin.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                        {/* Ürün Listesi İndirme Bölümü */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">1. Ürün Listesini İndir</Label>
                            <Button 
                                onClick={handleDownloadProductList}
                                disabled={isDownloading}
                                className="w-full"
                                variant="outline"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {isDownloading ? 'İndiriliyor...' : 'Ürün Listesini İndir'}
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                İndirdiğiniz Excel dosyasını düzenleyerek ürün miktarlarını belirtin.
                            </p>
                        </div>

                        {/* Dosya Yükleme Bölümü */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">2. Düzenlenmiş Dosyayı Yükle</Label>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileSelect}
                                    className="cursor-pointer"
                                />
                            </div>
                            {selectedFile && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileSpreadsheet className="w-4 h-4" />
                                    <span>{selectedFile.name}</span>
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Sadece Excel dosyaları (.xlsx, .xls) kabul edilir.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            className="w-full"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {isUploading ? 'Yükleniyor...' : 'Ürünleri Sepete Ekle'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Hatalı Ürünler Dialog'u */}
            <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            Hatalı Ürünler
                        </DialogTitle>
                        <DialogDescription>
                            Aşağıdaki ürünler sepete eklenemedi. Lütfen kontrol edip tekrar deneyin.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        {errorProducts.map((product, index) => (
                            <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-red-800">
                                            {product.stokKodu || 'Bilinmeyen Ürün'}
                                        </h4>
                                        <p className="text-sm text-red-600 mt-1">
                                            {product.stokKodu || 'Ürün stok kodu belirtilmemiş'}
                                        </p>
                                        {product.miktar && (
                                            <p className="text-sm text-red-600">
                                                Miktar: {product.miktar}
                                            </p>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Hata
                                        </span>
                                    </div>
                                </div>
                                {product.hata && (
                                    <p className="text-sm text-red-700 mt-2 font-medium">
                                        Hata: {product.hata}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button onClick={handleErrorDialogClose} className="w-full">
                            Kapat
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}