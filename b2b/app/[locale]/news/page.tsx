import BreadcrumbNav from "@/components/others/breadcrumbNav";
import { getTranslations } from 'next-intl/server';
import headerImages from "@/public/assets/header/header_inner_01.jpg"
import Image from "next/image";
import { generatePageMetadata } from "@/components/others/metada";
import Link from "next/link";
import { getNews } from '@/services/kategoriSevices';
import { API_BASE_URL_RESIM_NEWS } from '@/services/api';
export const generateMetadata = () => generatePageMetadata('News');

export default async function News() {

    const data = await getNews();

    const t = await getTranslations('Header');
    return (
        <>
            <div className="w-full h-[300px] bg-indigo-800 relative">
                <BreadcrumbNav data={[{ title: t('news'), href: '/news' }]} />
                 <Image src={headerImages} alt="Header Image" className="w-full h-full object-cover" />
            </div>

            <div className="max-w-screen-2xl mx-auto p-4 my-10">

            <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
                    {data.map((item: any) => (
                        <div key={item.id} className="border rounded-lg shadow">
                            <div className="w-full h-[400px] rounded-lg">
                                <Image src={API_BASE_URL_RESIM_NEWS + item.images} alt={item.title} width={300} height={300} className="w-full h-full object-contain rounded-lg" />
                            </div>
                        <div className="p-4 bg-gray-50">
                            <h2 className="font-bold mt-2 text-sm text-gray-700">{item.title}</h2>
                            <p className="font-bold mt-2 text-sm text-gray-700">{new Date(item.create_date).toLocaleDateString('tr-TR')}</p>
                            <p className="mt-2 text-sm mb-5 text-gray-700">{item.long_article}</p>
                            <Link href={`/news/${item.slug}`} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-all">{t('readMore')}</Link>
                        </div>
                    </div>
                    ))}
                    
                  

                    
                    
                </div>
               
            </div>
        </>
    )
}