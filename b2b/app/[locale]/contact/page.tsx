import BreadcrumbNav from "@/components/others/breadcrumbNav";
import { useTranslations } from "next-intl";
import headerImages from "@/public/assets/header/header_inner_01.jpg"
import Image from "next/image";
import { generatePageMetadata } from "@/components/others/metada";

export const generateMetadata = () => generatePageMetadata('Contact');


export default function Contact() {

    const t = useTranslations('Header');
    return (
        <>
            <div className="w-full h-[300px] relative">
                <BreadcrumbNav data={[{ title: t('contact'), href: '/contact' }]} />
                <Image src={headerImages} alt="Header Image" className="w-full h-full object-cover" />
            </div>

            <div className="max-w-screen-xl mx-auto p-4 my-10">

                <h2 className="text-2xl font-bold mb-10">Horoz Europe BV / SRL</h2>

                <div className="flex lg:flex-row flex-col">
                    <div className="lg:w-1/2 flex flex-col space-y-4">
                        <div>
                            <p>Gustave Demeurslaan 73. 1654 (Hulzingen)</p>
                            <p>Beersel Belgium</p>
                            <p>TVA / BTW : Be05988908484</p>
                            <p>Tel : +32 67 212 432</p>
                        </div>
                    </div>
                    <div className="lg:w-1/2">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12003.657755828339!2d28.698605!3d41.223635!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caaaf361eedf91%3A0xe12f6c6a7e064fcc!2sHoroz%20Elektrik%20ve%20Elektronik%20Tic.%20Koll.%20%C5%9Eti.!5e0!3m2!1sen!2str!4v1749644380698!5m2!1sen!2str"
                            width="100%"
                            height="300"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>



                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
                    <div className="border p-4 rounded-lg shadow">
                        <h3 className="font-bold mb-2">HOROZ AYDINLATMA</h3>
                        <p>Şahkulu Mh. Büyük hendek Cd. No:24/B Beyoğlu, İstanbul / Türkiye</p>
                        <p className="mt-2">FACTORY: Fatih Mh. Savcı Sk. No:2 Arnavutköy / İstanbul</p>
                        <p className="mt-2">Phone: +90 (212) 292 06 72</p>
                        <p>Email: info@horozelektrik.com.tr</p>
                        <p className="mt-2 font-semibold">TURKEY</p>
                    </div>

                    <div className="border p-4 rounded-lg shadow">
                        <h3 className="font-bold mb-2">TEB ELEKTRIK</h3>
                        <p>Fatih Mh. Savcı Sk. No:1 Arnavutköy, ISTANBUL / TURKYE</p>
                        <p className="mt-2">Phone: +90 (212) 292 06 72</p>
                        <p>Fax: +90 212 681 00 02</p>
                        <p>Email: info@tebelektrik.com</p>
                        <p className="mt-2 font-semibold">TURKEY</p>
                    </div>

                    <div className="border p-4 rounded-lg shadow">
                        <h3 className="font-bold mb-2">HOROZ ASIA</h3>
                        <p>Moskvina str. 25/Almata KAZAKHSTAN</p>
                        <p className="mt-2">Phone: +7 708 258 64 91</p>
                        <p>Email: info@horozasia.com</p>
                        <p className="mt-2 font-semibold">KAZAKHSTAN</p>
                    </div>

                    <div className="border p-4 rounded-lg shadow">
                        <h3 className="font-bold mb-2">HOROZ UZBEKISTAN</h3>
                        <p>Usta-Shirin No 111/D Taşkent / ÖZBEKISTAN</p>
                        <p className="mt-2">Phone: +998 99 090 30 43</p>
                        <p>Email: info@horozasia.com</p>
                        <p className="mt-2 font-semibold">UZBEKISTAN</p>
                    </div>

                    <div className="border p-4 rounded-lg shadow">
                        <h3 className="font-bold mb-2">HOROZ KYRGYZSTAN</h3>
                        <p>Ibraimova st 6371 Bishkek / KYRGYZSTAN</p>
                        <p className="mt-2">Phone: +996 552 336 222</p>
                        <p>Email: info@horozasia.com</p>
                        <p className="mt-2 font-semibold">KYRGYZSTAN</p>
                    </div>

                    <div className="border p-4 rounded-lg shadow">
                        <h3 className="font-bold mb-2">HOROZ COMPANY</h3>
                        <p>Setekan street near of the mosque sheıkh Omar balısani, Arbil / Iraq</p>
                        <p className="mt-2">Phone: +964 750 402 79 60</p>
                        <p>Phone: +964 750 832 26 14</p>
                        <p>Email: info@horozcompany.com</p>
                        <p className="mt-2 font-semibold">IRAQ</p>
                    </div>

                    <div className="border p-4 rounded-lg shadow">
                        <h3 className="font-bold mb-2">HOROZ AZERBAYCAN</h3>
                        <p>Ramani ,"sütçülük" sowxozu arazisi Bakü / AZERBAYCAN</p>
                        <p className="mt-2">Phone: +994 12 515 88 64</p>
                        <p>Email: info@horozaz.com</p>
                        <p className="mt-2 font-semibold">AZERBAYCAN</p>
                    </div>

                    <div className="border p-4 rounded-lg shadow">
                        <h3 className="font-bold mb-2">HOROZ RUS</h3>
                        <p>Argunovskaya Str. Ap.2 Blok.2, Moscow / Russia</p>
                        <p className="mt-2">Phone: +780 777 76 06</p>
                        <p>Email: office@horozelectric.ru</p>
                        <p className="mt-2 font-semibold">RUSSIA</p>
                    </div>

                    <div className="border p-4 rounded-lg shadow">
                        <h3 className="font-bold mb-2">HOROZ ROMANIA</h3>
                        <p>Comuna Stefanestii De Jos, Soseaua Linia De Centura, Nr.2G, Corp F, Judet Ilfov / Romania</p>
                        <p className="mt-2">Phone: +40 21 369 57 12</p>
                        <p>Email: info@horozelectric.ro</p>
                        <p>RO 31267637 J23/2100/2019</p>
                        <p className="mt-2 font-semibold">ROMANIA</p>
                    </div>

                    <div className="border p-4 rounded-lg shadow">
                        <h3 className="font-bold mb-2">HOROZ UKRAINE</h3>
                        <p>127-G, Shevchenko Street, Duliby, Stryi District, Lviv Regium, 82434 / Ukraine</p>
                        <p className="mt-2">Phone: +380 975 36 73 97</p>
                        <p>Email: info@horozelektrik.com</p>
                        <p className="mt-2 font-semibold">UKRAINE</p>
                    </div>

                    <div className="border p-4 rounded-lg shadow">
                        <h3 className="font-bold mb-2">HOROZ EUROPE</h3>
                        <p>1400 Nivelles, Rue de Commerce No:12</p>
                        <p>Vat: BE 0598908484 / Belgium</p>
                        <p className="mt-2">Phone: +32 67 212 432</p>
                        <p>Email: info@horozeurope.com</p>
                        <p className="mt-2 font-semibold">BELGIUM</p>
                    </div>

                    <div className="border p-4 rounded-lg shadow">
                        <h3 className="font-bold mb-2">HOROZ HONGKONG</h3>
                        <p>Office No:3 10/F Witty Commercial Building 1A-1 Tung Choi Street Mongkak Kowloon / HONGKONG</p>
                        <p className="mt-2">Phone: +90 212 786 62 20</p>
                        <p>Email: info@horozelektrik.com</p>
                        <p className="mt-2 font-semibold">HONGKONG</p>
                    </div>

                    <div className="border p-4 rounded-lg shadow">
                        <h3 className="font-bold mb-2">HOROZ KABLO</h3>
                        <p>127-G, Shevchenko Street, Duliby, Stryi District, Lviv Regium, 82434 / Ukraine</p>
                        <p className="mt-2">Phone: +380 975 36 73 97</p>
                        <p>Email: info@horozelektrik.com</p>
                        <p className="mt-2 font-semibold">UKRAINE</p>
                    </div>
                </div>

            </div>
        </>
    )
}