import BreadcrumbNav from "@/components/others/breadcrumbNav";
import { useTranslations } from "next-intl";
import headerImages from "@/public/assets/earth1.png"
import yonetimSemasi from "@/public/assets/yonetim-semasi.png"
import Image from "next/image";
import { generatePageMetadata } from "@/components/others/metada";
import CorporateMenu from "@/components/others/corporateMenu";
export const generateMetadata = () => generatePageMetadata('Corporate');


export default function Corporate() {

    const t = useTranslations('Header');
    return (
        <>
            <div className="w-full h-[300px] relative bg-gray-900">
                <BreadcrumbNav data={[{ title: t('corporate'), href: '/corporate' }]} />
                <Image src={headerImages} alt="Header Image" className="w-full h-full object-cover" />
            </div>

            <div className="max-w-screen-2xl flex flex-row mx-auto p-4 mb-10">
                <CorporateMenu />
                <div className="w-full">
                <h2 className="text-2xl font-bold my-10">Tarihçe</h2>
                <p>HOROZ AYDINLATMA Kaçmaz Grup bünyesinde kurulmuş bir şirket olup, İstanbul Arnavutköy’de 25.000 kapalı, 10.000 açık alanda büyüme faaliyetlerine devam etmektedir.</p><br/>
                <p>Sektörde bünyesinde bulundurduğu tecrübeli teknik kadroyla, ürettiği ürünlerde öncelikle insan ve çevre güvenliğini dikkate almaktadır. Ulusal ve uluslararası standartlara uygun, yurtiçi ve yurtdışı alıcıların isteklerini doğru analiz ederek, AR-GE çalışmalarını profesyonelce tamamladığı ürün gruplarını üretmektedir.</p><br/>
                <p>Hedefimiz, alım kalitesi yükselen ve profesyonellik bekleyen müşterilerimizin beklentilerine cevap vermek olacaktır.</p>
              
                <h2 className="text-2xl font-bold my-10">Değerlerimiz</h2>

                <div className="flex flex-row gap-4">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-xl font-bold">İnsana Saygı</h3>
                        <p>Şirketimiz insan onuru bakımından eşitliği esas alır ve kişilerin bireyselliğine ve özünde taşıdığı onura değer verir.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="text-xl font-bold">Dürüstlük</h3>
                        <p>Şirketimiz ticari ve sosyal ilişkilerinde söz ve eylemlerinde dürüst ve açık olmayı benimsemiştir.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-bold">Verimlilik</h3>
                            <p>Şirketimiz verimliliği bir yaşam biçimi olarak benimsemiş olup, tüm ürün ve hizmetlerinde katma değer sağlayacak iş sonuçlarını ortaya çıkarmayı hedeflemiştir.
                            </p>
                        </div>
                    <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-bold">Kalite</h3>
                            <p>Şirketimiz insan onuru bakımından eşitliği esas alır ve kişilerin bireyselliğine ve özünde taşıdığı onura değer verir.
                            </p>
                        </div>
                    <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-bold">Takım Çalışması</h3>
                            <p>Şirketimiz çalışma ve organizasyon yapılarında ortak bir karar aşamasında ilerlemektedir.
                            </p>
                        </div>
                </div>

                <h2 className="text-2xl font-bold my-10">Yönetim Şeması</h2>
                <div className="w-full h-[500px]">
                <Image src={yonetimSemasi} alt="Corporate" className="w-full h-[500px] object-contain" />
                </div>
            </div>
            </div>
        </>
    )
}