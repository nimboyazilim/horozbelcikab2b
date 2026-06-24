# Toplu Ürün Ekleme Komponenti

Bu komponent, B2B uygulamasında kullanıcıların Excel dosyası ile toplu ürün eklemesini sağlar.

## Özellikler

- ✅ Ürün listesini Excel formatında indirme
- ✅ Düzenlenmiş Excel dosyasını yükleme
- ✅ Sadece .xlsx ve .xls dosyalarını kabul etme
- ✅ Yükleme ve indirme durumlarını gösterme
- ✅ Toast bildirimleri ile kullanıcı geri bildirimi
- ✅ Responsive tasarım
- ✅ TypeScript desteği

## Kullanım

### Basit Kullanım

```tsx
import TopluUrunEkleme from "@/components/cart/topluUrunEkleme"

export default function CartPage() {
  return (
    <div>
      <TopluUrunEkleme />
    </div>
  )
}
```

### Özelleştirilmiş Kullanım

```tsx
<TopluUrunEkleme 
  variant="default" 
  size="lg" 
  className="w-full bg-blue-600 text-white" 
/>
```

### Cart Sayfasında Kullanım

```tsx
<div className="p-4">
  <h2 className="text-lg font-semibold mb-4">Toplu İşlemler</h2>
  <TopluUrunEkleme />
</div>
```

## Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `className` | `string` | `undefined` | Ek CSS sınıfları |
| `variant` | `"default" \| "outline" \| "secondary" \| "ghost" \| "link" \| "destructive"` | `"outline"` | Buton varyantı |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | Buton boyutu |

## Backend Gereksinimleri

Bu komponentin çalışması için aşağıdaki backend endpoint'lerinin oluşturulması gerekmektedir:

### 1. Ürün Listesi İndirme Endpoint'i

**Endpoint:** `GET /urunler/toplu-urun-listesi`

**Açıklama:** Tüm ürünleri Excel formatında döndürür.

**Response:** Excel dosyası (blob)

**Örnek Backend Kodu (Node.js/Express):**

```javascript
const excel = require('exceljs');

router.get('/urunler/toplu-urun-listesi', auth, async (req, res) => {
  try {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Ürünler');
    
    // Başlık satırı
    worksheet.columns = [
      { header: 'Ürün Kodu', key: 'stok_kodu', width: 15 },
      { header: 'Ürün Adı', key: 'urun_adi', width: 30 },
      { header: 'Miktar', key: 'miktar', width: 10 },
      { header: 'Varyant', key: 'varyant_adi', width: 20 }
    ];
    
    // Ürünleri veritabanından çek
    const urunler = await db('urunler').select('*');
    
    // Excel'e ekle
    urunler.forEach(urun => {
      worksheet.addRow({
        stok_kodu: urun.stok_kodu,
        urun_adi: urun.urun_adi,
        miktar: '', // Kullanıcı dolduracak
        varyant_adi: urun.varyant_adi || ''
      });
    });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=urun-listesi.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    res.status(500).json({ error: 'Dosya oluşturulamadı' });
  }
});
```

### 2. Toplu Ürün Ekleme Endpoint'i

**Endpoint:** `POST /sepet/toplu-urun-ekle`

**Açıklama:** Excel dosyasını işler ve ürünleri sepete ekler.

**Request:** FormData (file: Excel dosyası)

**Response:**
```json
{
  "status": "success",
  "message": "5 ürün başarıyla sepete eklendi",
  "data": {
    "eklenen": 5,
    "hatali": 0,
    "detaylar": [...]
  }
}
```

**Örnek Backend Kodu (Node.js/Express):**

```javascript
const multer = require('multer');
const excel = require('exceljs');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.post('/sepet/toplu-urun-ekle', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }
    
    const workbook = new excel.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    
    const worksheet = workbook.getWorksheet(1);
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    // İlk satır başlık, 2. satırdan itibaren veri
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const stokKodu = row.getCell(1).value;
      const miktar = parseInt(row.getCell(3).value) || 0;
      
      if (stokKodu && miktar > 0) {
        try {
          // Ürünü bul ve sepete ekle
          const urun = await db('urunler').where('stok_kodu', stokKodu).first();
          if (urun) {
            await db('sepet').insert({
              musteri_id: req.user.musteri_id,
              urun_id: urun.id,
              miktar: miktar
            });
            successCount++;
            results.push({ stok_kodu: stokKodu, durum: 'başarılı' });
          } else {
            errorCount++;
            results.push({ stok_kodu: stokKodu, durum: 'ürün bulunamadı' });
          }
        } catch (error) {
          errorCount++;
          results.push({ stok_kodu: stokKodu, durum: 'hata' });
        }
      }
    }
    
    res.json({
      status: 'success',
      message: `${successCount} ürün başarıyla sepete eklendi`,
      data: {
        eklenen: successCount,
        hatali: errorCount,
        detaylar: results
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Dosya işlenemedi' });
  }
});
```

## Excel Dosya Formatı

İndirilen Excel dosyası aşağıdaki formatta olmalıdır:

| Ürün Kodu | Ürün Adı | Miktar | Varyant (Opsiyonel) |
|-----------|----------|--------|-------------------|
| PRD001    | Ürün 1   | 5      | Kırmızı           |
| PRD002    | Ürün 2   | 10     | Mavi              |

**Önemli Notlar:**
- Miktar sütunu kullanıcı tarafından doldurulacak
- Ürün Kodu benzersiz olmalıdır
- Miktar pozitif sayı olmalıdır
- Varyant sütunu opsiyoneldir

## Gerekli NPM Paketleri

Backend için gerekli paketler:

```bash
npm install exceljs multer
```

## Güvenlik

- Dosya boyutu sınırlaması (5MB)
- Sadece Excel dosyaları kabul edilir
- Authentication middleware kullanılmalı
- Input validation yapılmalı

## Hata Yönetimi

Komponent aşağıdaki hata durumlarını yönetir:

- Dosya seçilmedi
- Yanlış dosya formatı
- Ağ bağlantı hatası
- Sunucu hatası

Tüm hatalar toast bildirimleri ile kullanıcıya gösterilir. 