import { getTranslations } from "next-intl/server";
import { generatePageMetadata } from "@/components/others/metada";
import BreadcrumbProduct from "@/components/others/breadcrumbProduct";
import ProductsCategoryComp from "@/components/urunler/productsCategoryComp";
import { getKategoriBreadcrumb,getKategoriOutletUrunler } from "@/services/kategoriSevices";
export const generateMetadata = () => generatePageMetadata('OutletProducts');


export default async function OutletProducts({
    searchParams,
 }: {
    searchParams: Promise<{ f?: string | undefined }>
 }) {

    const resolvedParams = await searchParams;
    const filterParam = resolvedParams.f || 'undefined';

    const t = await getTranslations('Header');

 const data = await getKategoriBreadcrumb('undefined');
 const data2 = await getKategoriOutletUrunler('undefined',filterParam);
 

    return (
        <>
    
            <div className="max-w-screen-xl mx-auto p-4 my-5">

           <div className="flex flex-col space-y-2 mb-5">
            <BreadcrumbProduct data={[]} tip='outlet-products' />
            <h1 className="text-3xl font-bold">{t('outletproducts')}</h1>
           </div>



            <ProductsCategoryComp data={data} data2={data2} />
            
               
            </div>
        </>
    )
}