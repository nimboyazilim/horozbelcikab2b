import { useTranslations } from "next-intl";
import { generatePageMetadata } from "@/components/others/metada";
import BreadcrumbProduct from "@/components/others/breadcrumbProduct";
import ProductsCategoryComp from "@/components/urunler/productsCategoryComp";
import { getKategoriBreadcrumb, getKategoriUrunleri } from "@/services/kategoriSevices";
import { getTranslations } from "next-intl/server";
import { cookies } from 'next/headers'

export const generateMetadata = () => generatePageMetadata('Products');

export default async function ProductsPage({
   searchParams,
}: {
   searchParams: Promise<{ f?: string | undefined }>
}) {
   const cookieStore = await cookies();
   const accessToken = cookieStore.get('accessToken')?.value;

   const resolvedParams = await searchParams;
   const filterParam = resolvedParams.f || 'undefined';
   const data = await getKategoriBreadcrumb('undefined');
   const data2 = await getKategoriUrunleri('undefined', filterParam, accessToken || 'undefined');
 
   

   
   const t = await getTranslations('Header');

    return ( 
        <>
    
            <div className="max-w-screen-xl mx-auto p-4 my-5">

           <div className="flex flex-col space-y-2 mb-5">
            <BreadcrumbProduct data={[]} tip='products' />
            <h1 className="text-3xl font-bold">{t('products')}</h1>
           </div>



            <ProductsCategoryComp data={data} data2={data2} />
            
               
            </div>
        </>
    )
}