import BreadcrumbProductDetail from "@/components/others/breadcrumbProductDetail";
import UrunGaleri from "@/components/kategoriler/urunGaleri";
import { getUrunDetay } from "@/services/kategoriSevices";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs"
import { DownloadIcon } from "lucide-react";
import UrunDetayVaryant from "@/components/urunler/urunDetayVaryant";
import BenzerUrunlerComp from "@/components/urunler/benzerUrunlerComp";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import SepetEkleButton from "@/components/cart/sepetEkleButon";

// Server-side HTML decode fonksiyonu
const decodeHtml = (html: string) => {
    if (!html) return '';
    
    return html
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
};

export default async function ProductDetailPage({
    params,
  }: {
    params: Promise<{ slug: string }>
  }) {

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;


    const slug = (await params).slug
    const data = await getUrunDetay(slug,accessToken || 'undefined');



    const t = await getTranslations('Header');
    const t2 = await getTranslations('UrunDetaySayfasi');

    const breadcrumbs = [
        { title_en: t('products'), title_tr: t('products'), title: t('products'), href: '/products' },
        ...data.breadcrumbs,
        { title_en: data.urunDetay.urun_adi, title_tr: data.urunDetay.urun_adi, title: data.urunDetay.urun_adi, href:'' }
    ];

   // Stok kodunu formatlayan yardımcı fonksiyon
   const formatStokKodu = (kod: string) => {
    const parts = kod.split('-');
    if (parts.length >= 4) {
        return parts.slice(1, 4).join('-');
    }
    return kod;
};


    return (
        <>
        <div className="max-w-screen-xl mx-auto px-4 my-10">
            <BreadcrumbProductDetail data={breadcrumbs} />
        </div>
        <div className="max-w-screen-xl mx-auto px-4 mb-10">
        {data.urunDetay.tip === 'standart' && <div className="flex lg:flex-row flex-col lg:space-x-4">
                <div className="lg:w-1/2">
                    <UrunGaleri data={data.resimler}/>
                </div>
                <div className="lg:w-1/2 lg:mt-0 mt-4">
                <h1 className="text-2xl font-bold mb-3">{data.urunDetay.urun_adi}</h1>
                <p className="text-gray-500 mb-2">
                            <span className="font-semibold">{formatStokKodu(data.urunDetay.stok_kodu)}</span>
                        </p>
                    <>
                        {data.urunDetay.indirimli_fiyat > 0 ? (
                            <div className="">
                                <span className="line-through text-lg">
                                    {data.urunDetay.fiyat.toFixed(2).replace('.', ',')} $
                                </span>
                                <span className="font-bold text-3xl ml-2">
                                    {data.urunDetay.indirimli_fiyat.toFixed(2).replace('.', ',')} $
                                </span>
                            </div>
                        ) : (
                            <div className="">
                                <span className="font-bold text-3xl">
                                    {data.urunDetay.fiyat.toFixed(2).replace('.', ',')} $
                                </span>
                            </div>
                        )}
                        {/* {data.urunDetay.kdvsiz_fiyat && (
                            <p className="text-sm my-2">
                                Birim Fiyat: {parseFloat(data.urunDetay.kdvsiz_fiyat).toFixed(2).replace('.', ',')} $
                            </p>
                        )} */}
                        {/* <p className={`font-bold ${data.urunDetay.miktar > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {data.urunDetay.miktar > 0 ? 'Stokta var' : 'Stokta yok'}
                        </p> */}
                        {data.urunDetay.miktar > 0 ? (
                            <p className="text-green-500 font-bold">Stokta var </p>
                        ) : (
                            <p className="text-red-500 font-bold">Stokta yok</p>
                        )}
                        <SepetEkleButton data={data.urunDetay} />
                        <div className="overflow-x-auto">
                          <div 
                            className="text-gray-800 leading-relaxed [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_td]:text-sm [&_strong]:font-semibold [&_span]:text-gray-700" 
                            dangerouslySetInnerHTML={{ __html: decodeHtml(data.urunDetay.urun_information) }} 
                          />
                        </div>
                        
                        {!data.urunDetay.urun_information && (
                          <div className="text-gray-500 italic mt-2">
                            Bu ürün için henüz bilgi eklenmemiş.
                          </div>
                        )}
                        
                    </>
              
                     
                </div>
            </div> }

            {data.urunDetay.tip === 'varyant' && 
           <UrunDetayVaryant data={data}/>
            }




        </div>
        <div className="max-w-screen-xl mx-auto px-4 my-20">
            
        <Tabs defaultValue="aciklama" className="w-full">
      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${2 + (data.dosyalar ? Object.keys(data.dosyalar.reduce((acc: any, curr: any) => {
        acc[curr.dosya_tanim_id] = curr.dosya_baslik;
        return acc;
      }, {})).length : 0)}, 1fr)` }}>
        <TabsTrigger value="aciklama">{t2('urunOzellikleri')}</TabsTrigger>
        {data.dosyalar && [...new Set(data.dosyalar.map((dosya: any) => dosya.dosya_tanim_id))].map((tanim_id: any) => (
          <TabsTrigger key={tanim_id} value={`dosya-${tanim_id}`}>
            {data.dosyalar.find((d: any) => d.dosya_tanim_id === tanim_id)?.dosya_baslik}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="aciklama">
        <div className="my-5">
          <div className="overflow-x-auto">
            <div 
              className="my-5 text-gray-800 leading-relaxed [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_td]:text-sm [&_strong]:font-semibold [&_span]:text-gray-700" 
              dangerouslySetInnerHTML={{ __html: decodeHtml(data.urunDetay.urun_description) }} 
            />
          </div>
          
          {!data.urunDetay.urun_description && (
            <div className="my-5 text-gray-500 italic">
              Bu ürün için henüz açıklama eklenmemiş.
            </div>
          )}
          
        </div>
        <div className="my-5">
            <table>
                <tbody>
                    {data.ozellikler.map((ozellik: any) => (
                        <tr key={ozellik.ozellik_adi}>
                            <td className="font-bold">{ozellik.ana_ozellik_adi}</td>
                            <td>:</td>
                            <td className="text-gray-500">{ozellik.ozellik_adi}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </TabsContent>
      {data.dosyalar && [...new Set(data.dosyalar.map((dosya: any) => dosya.dosya_tanim_id))].map((tanim_id: any) => (
        <TabsContent key={tanim_id} value={`dosya-${tanim_id}`}>
          <div className="flex flex-col space-y-2 mt-5">
            {data.dosyalar
              .filter((dosya: any) => dosya.dosya_tanim_id === tanim_id)
              .map((dosya: any, index: number) => (
                <a 
                key={index}
                  href={`${process.env.NEXT_PUBLIC_API_URL_DOSYA}${dosya.dosya_yolu}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 border w-96 rounded bg-gray-50 hover:bg-gray-100"
                >
                <div className="flex flex-row justify-between items-center">
                  <span className="flex-1 truncate mr-4 text-sm">{dosya.dosya_adi}</span>
                  <DownloadIcon className="w-4 h-4 flex-shrink-0" />
                </div>
                </a>
              ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>


        </div>
        <div className="max-w-screen-xl mx-auto px-4 my-20">
            <BenzerUrunlerComp kategori_seo={
                 data.breadcrumbs[data.breadcrumbs.length - 1].href.replace('/products/', '')
            }/>
        </div>
        </>
    )
}