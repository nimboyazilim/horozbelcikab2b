import Image from "next/image";
import catalog from "@/public/assets/catalog.png";
import catalog1 from "@/public/assets/catalog1.png";
import search from "@/public/assets/undraw_web-search_9qqc-1.svg";
import Link from "next/link";
import { useTranslations } from 'next-intl';
export default function HomeAraKatalog() {
    const t = useTranslations('HomeAraKatalog');
    return (
        <>
        <div className="max-w-screen-xl mx-auto px-4 flex lg:flex-row flex-col lg:space-x-4 space-y-4 lg:space-y-0 justify-between items-center">
            <div className="w-full bg-blue-900 rounded-lg lg:h-56 h-96 p-6">
                <div className="flex flex-row space-x-4 justify-between items-center h-full">
                <div className="flex flex-col justify-center">
                    <h2 className="text-xl font-bold mb-2 text-white">{t('title')}</h2>
                    <p className="text-gray-500 mb-10 text-white">{t('description')}</p>
                    <Link href="/products" className="bg-white w-52 text-center text-blue-900 px-4 py-2 rounded-lg">{t('button')}</Link>
                </div>
                <div className="flex flex-col">
                    <Image src={search} alt="catalog" width={200} height={100}/>
                </div>
                </div>
            </div>

            {/* <div className="w-full lg:w-2/5 bg-indigo-100 rounded-lg h-96 p-4">
           <h2 className="text-xl font-bold mb-5">{t('catalog')}</h2>
           <Link href="/catalog" className="flex flex-row space-x-4 justify-center items-center">
           <Image src={catalog} alt="catalog" width={230} height={100}/>
           <Image className="lg:block hidden" src={catalog1} alt="catalog" width={230} height={100}/>
           </Link>
           </div> */}
            </div>
     
        </>
    )
}