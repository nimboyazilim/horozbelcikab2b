import BreadcrumbNav from "@/components/others/breadcrumbNav";
import headerImages from "@/public/assets/header/catalog.png"
import Image from "next/image";
import { generatePageMetadata } from "@/components/others/metada";
import Link from "next/link";
import { API_BASE_URL_RESIM_CATALOG } from "@/services/api";
import { getCatalog } from "@/services/kategoriSevices";
import { getTranslations } from "next-intl/server";
export const generateMetadata = () => generatePageMetadata('Catalog');


export default async function Catalog() {

    const t = await getTranslations('Header');

    const data = await getCatalog();


    return (
        <>
            <div className="w-full h-[300px] bg-gray-900 relative">
                <BreadcrumbNav data={[{ title: t('catalog'), href: '/catalog' }]} />
                 <Image src={headerImages} alt="Header Image" className="w-full h-full object-contain" />
            </div>

            <div className="max-w-screen-xl mx-auto p-4 my-10">

            <div className="grid lg:grid-cols-4 grid-cols-2 gap-4">

                    {data.map((item: any) => (
                        <Link key={item.id} href={API_BASE_URL_RESIM_CATALOG+item.dosya} target="_blank" className="border rounded-lg shadow">
                            <div className="w-full h-[300px] rounded-lg">
                            <Image src={API_BASE_URL_RESIM_CATALOG+item.images} alt="Header Image" width={300} height={300} className="w-full h-full object-contain rounded-lg" />
                        </div>
                        <div className="p-4 bg-gray-50">
                            <p className="font-bold mt-2 text-sm text-center text-gray-700">{item.title}</p>
                        </div>
                    </Link>
                    ))}

                   
                    
                </div>
               
            </div>
        </>
    )
}