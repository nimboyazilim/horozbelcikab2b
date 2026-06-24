import BreadcrumbNav from "@/components/others/breadcrumbNav";
import { useTranslations } from "next-intl";
import headerImages from "@/public/assets/header/header_inner_01.jpg"
import Image from "next/image";
import { generatePageMetadata } from "@/components/others/metada";
import CorporateMenu from "@/components/others/corporateMenu";

export const generateMetadata = () => generatePageMetadata('TermsOfUse');


export default function TermsOfUse() {

    const t = useTranslations('Header'); 
    return (
        <>
            <div className="w-full h-[300px] relative">
                <BreadcrumbNav data={[{ title: t('termsOfUse'), href: '/terms-of-use' }]} />
                <Image src={headerImages} alt="Header Image" className="w-full h-full object-cover" />
            </div>

            <div className="max-w-screen-2xl mx-auto p-4 mb-5 flex flex-row">
            <CorporateMenu />
            <div className="w-full">
            <p className="my-10">Web sitesinin sahibi Horozk Elektrik olup, site üzerinde her tür organizasyon, kullanım ve tasarruf yetkisi Horozk Elektrik'e aittir. Lütfen siteyi kullanmadan önce kullanım koşullarını dikkatle okuyunuz.</p>


<p>1. İşbu site üzerinde her tür organizasyon, kullanım ve tasarruf yetkisi Horozk Elektrik'e ait olup, siteye girmek ve kullanmakla sitenin kullanım ve sözleşme kurallarını kabul etmiş bulunuyorsunuz. Horozk Elektrik, sözleşme şartları da dahil olmak üzere, site ve site uzantılarında mevcut her tür koşulu ve bilgiyi önceden herhangi bir ihtara hacet olmaksızın değiştirme hakkını saklı tutar. Değişiklikler sitede yayım anında yürürlüğe girer.</p>
<p>2. İşbu siteye girilmesi veya sitenin kullanılması sonucunda ortaya çıkabilecek her tür ihtilaf Türk kanunlarına tabi olup, ihtilafların çözümünde İstanbul Mahkemeleri münhasıran yetkilidir. Horozk Elektrik' un, kullanıcının bulunduğu ülkede dava açma hakkı saklıdır.</p>
<p>3. Horozk Elektrik web sitesinde mevcut olan bilgilerin doğruluk ve güncelliğini sürekli şekilde kontrol etmektedir. Ancak tüm itinalı çalışmaya rağmen, web sayfalarındaki bilgiler fiili değişikliklerin gerisinde kalabilir. Horozk Elektrik'un web sitesinde bulacağınız materyal ve bilgiler siteye verildiği anda sunulmuştur, ilgili hizmetin güncel durumu ile sitede yer alan durumu arasında farklılık olabilir. Web sitesindeki bilgilerin, güncelliği, doğruluğu, şartları, kalitesi, performansı, pazarlanabilirliği, belli bir amaca uygunluğu ve Horozk Elektrik'un web sayfasında yer alan ve bunlarla sınırlı olmayan, bunlarla bağlantılı veya bağımsız diğer bilgi, hizmet veya ürünlere etkisi ile tamlığı hakkında herhangi bir sarih ya da zımni garanti verilmemekte ve taahhütte bulunulmamaktadır.</p>


<h2 className="text-2xl font-bold my-10">Web Sayfasında Değişiklik Yapma Hakkı</h2>
<p>Horozk Elektrik işbu site ve site uzantısında mevcut her tür hizmet, ürün, siteyi kullanma koşulları ile sitede sunulan bilgileri önceden bir ihtara gerek olmaksızın değiştirme, siteyi yeniden organize etme, yayını durdurma hakkını saklı tutar. Değişiklikler sitede yayım anında yürülüğe girer. Sitenin kullanımı ya da siteye giriş ile bu değişiklikler de kabul edilmiş sayılır. Bu koşullar link verilen diğer web sayfaları için de geçerlidir.
Horozk Elektrik, sözleşmenin ihlali, haksız fiil, ihmal veya diğer sebepler neticesinde; işlemin kesintiye uğraması, hata, ihmal, kesinti, silinme, kayıp, işlemin veya iletişimin gecikmesi, bilgisayar virüsü, iletişim hatası, hırsızlık, imha veya izinsiz olarak kayıtlara girilmesi, değiştirilmesi veya kullanılması hususunda herhangi bir sorumluluk kabul etmez.</p>


<h2 className="text-2xl font-bold my-10">Web Sayfalarına Link Verilmesi</h2>
<p>Bu site üzerinden başka sitelere link verilmesi mümkündür, Horozk Elektrik link verilen sayfalardaki bilgilerin doğruluğunu garanti etmemekte, herhangi bir taahhütte bulunmamaktadır. Bu sayfaların bir kısmı Horozk Elektrik dışındaki kuruluşlar tarafından ve o kuruluşların sorumluluğunda düzenlenmekte olup, ilgili sayfaların kullanımı Horozk Elektrik' tan bağımsız şekilde ilgili kuruluşun koşul ve şartları tahtında gerçekleşir. Horozk Elektrik bu sayfa ve bağlantılı hizmetlerin kullanımı konusunda bir sorumluluk almamakta ve herhangi bir tavsiyede bulunmamaktadır. Bu siteleri kullanımla doğabilecek zararlar kullanıcının kendi sorumluluğundadır. Horozk Elektrik bu tür link verilen sayfalara erişimi, kendi yazılı muvafakatına bağlayabileceği gibi, Horozk Elektrik'in uygun görmeyeceği linklere erişimi her zaman kesebilir.</p>


<h2 className="text-2xl font-bold my-10">Sorumluluğun Sınırlandırılması</h2>
<p>Horozk Elektrik, bu siteye girilmesi, sitenin ya da sitedeki bilgilerin ve diğer verilerin programların vs. kullanılması sebebiyle, sözleşmenin ihlali, haksız fiil, ya da başkaca sebeplere binaen, doğabilecek doğrudan ya da dolaylı hiçbir zarardan sorumlu değildir. Horozk Elektrik, sözleşmenin ihlali, haksız fiil, ihmal veya diğer sebepler neticesinde; işlemin kesintiye uğraması, hata, ihmal, kesinti hususunda herhangi bir sorumluluk kabul etmez. Bu siteye ya da link verilen sitelere girilmesi ya da sitenin kullanılması ile Horozk Elektrik' un kullanım/ziyaret sonucunda, doğabilecek her tür sorumluluktan, mahkeme ve diğer masraflar da dahil olmak üzere her tür zarar ve talep hakkından beri kılındığı kabul edilmektedir.</p>
              
               
            </div>
            </div>
        </>
    )
}