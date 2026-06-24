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
import { toast } from "react-hot-toast";
import { API_ENDPOINTS } from "@/services/api"
import api from "@/services/apiaxios"
import SiparislerServices from "@/services/siparislerServices"
import Cookies from "js-cookie"
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cartContext";
import { useTranslations } from "next-intl";


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

interface TopluUrunEklemeProps {
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export default function TopluUrunEkleme({ 
  className, 
  variant = "outline", 
  size = "default" 
}: TopluUrunEklemeProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isDownloading, setIsDownloading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [musteriId, setMusteriId] = useState<string | null>(null)
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
    const [errorProducts, setErrorProducts] = useState<any[]>([])
    const router = useRouter()
    const { loadCart } = useCart();

    const t = useTranslations('TopluUrunEkleme')

    useEffect(() => {
        const accessToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('accessToken='))
            ?.split('=')[1];
  
        if (accessToken) {
            const decodedToken = decodeJWT(accessToken);
            if (decodedToken) {
              setMusteriId(decodedToken.musteri_id);
            }
        }
    }, []);

      // JWT'den payload'ı decode eden yardımcı fonksiyon
function decodeJWT(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Türkçe karakterler için decode işlemi
      payload.adsoyad = decodeURIComponent(escape(payload.adsoyad));
      payload.eposta = decodeURIComponent(escape(payload.eposta));
      return payload;
    } catch (e) {
      return null;
    }
  }




    const handleDownloadProductList = async () => {
        setIsDownloading(true)
        try {
            const response = await SiparislerServices.siparisTopluExcelUrunListesi(musteriId as string);
            
            // Dosyayı indir
            const url = window.URL.createObjectURL(new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            }))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'urun-listesi.xlsx')
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            
            toast.success("Ürün listesi başarıyla indirildi.")
        } catch (error) {
            console.error('Download error:', error)
            toast.error("Ürün listesi indirilirken bir hata oluştu.")
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
                toast.error("Lütfen sadece Excel dosyası (.xlsx veya .xls) yükleyin.")
                e.target.value = ''
            }
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Lütfen bir dosya seçin.")
            return
        }

        setIsUploading(true)
        try {
            let cartId = (Cookies.get('cartId') || '');
            if (!cartId) {
                cartId = uuidv4();
                Cookies.set('cartId', cartId);
            }

            const formData = new FormData()
            formData.append('file', selectedFile)

            const response = await SiparislerServices.siparisTopluExcelUrunEkle(musteriId as string, cartId, formData);
            //console.log(response.data.status)
            
            if (response.data.status == 'success') {
                const { data } = response.data;
               await loadCart(musteriId as string);
                // Başarı mesajını göster
                toast.success(response.data.message)

                // Eğer hatalı ürünler varsa onları dialog'da göster
                if (data.hataliUrunler && data.hataliUrunler.length > 0) {
                    setErrorProducts(data.hataliUrunler)
                    setIsErrorDialogOpen(true)
                } else {
                    // Hiç hata yoksa direkt cart sayfasına git
                    router.push(`/cart/${cartId}`)
                }

                //console.log('Eklenen ürünler:', data.eklenenUrunler);
                //console.log('Toplam eklenen:', data.toplamEklenen);
                //console.log('Toplam hatalı:', data.toplamHatali);
            } else {
                toast.error(response.data.message)
            }
            
            // Dialog'u kapat ve formu temizle
            setIsOpen(false)
            setSelectedFile(null)
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
            if (fileInput) fileInput.value = ''
            
        } catch (error: any) {
            console.error('Upload error:', error)
            toast.error(error.response?.data?.message || "Dosya yüklenirken bir hata oluştu.")
        } finally {
            setIsUploading(false)
        }
    }

    const handleErrorDialogClose = async () => {
        setIsErrorDialogOpen(false)
        setErrorProducts([])
        await loadCart(musteriId as string)
        // Hata dialog'u kapandıktan sonra cart sayfasına git
        const cartId = Cookies.get('cartId')
        if (cartId) {
            router.push(`/cart/${cartId}`)
        }
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant={variant} size={size} className={className + " bg-orange-600 text-white hover:bg-orange-700 hover:text-white"}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        {t('topluUrunEkleme')}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{t('topluUrunEkleme')}</DialogTitle>
                        <DialogDescription>
                            {t('topluUrunEklemeDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                        {/* Ürün Listesi İndirme Bölümü */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">{t('urunListesiIndir')}</Label>
                            <Button 
                                onClick={handleDownloadProductList}
                                disabled={isDownloading}
                                className="w-full"
                                variant="outline"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {isDownloading ? t('indiriliyor') : t('urunListesiIndir')}
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                {t('urunListesiIndirDescription')}
                            </p>
                        </div>

                        {/* Dosya Yükleme Bölümü */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">{t('dosyaYukle')} 2</Label>
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
                                {t('dosyaYukleDescription')}
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
                            {isUploading ? t('yukleniyor') : t('urunleriSepeteEkle')}
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
                            {t('hataliUrunler')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('hataliUrunlerDescription')}
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
                                                {t('miktar')}: {product.miktar}
                                            </p>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            {t('hata')}
                                        </span>
                                    </div>
                                </div>
                                {product.hata && (
                                    <p className="text-sm text-red-700 mt-2 font-medium">
                                        {t('hata')}: {product.hata}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button onClick={handleErrorDialogClose} className="w-full">
                            {t('sepeteGit')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}