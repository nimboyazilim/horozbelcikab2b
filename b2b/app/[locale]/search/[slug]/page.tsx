import { getTranslations } from "next-intl/server";
import { generatePageMetadata } from "@/components/others/metada";
import BreadcrumbProduct from "@/components/others/breadcrumbProduct";
import ProductsCategoryComp from "@/components/urunler/productsCategoryComp";
import { getKategoriBreadcrumb,getKategoriYeniUrunler } from "@/services/kategoriSevices";
export const generateMetadata = () => generatePageMetadata('NewProducts');


export default async function SearchPage({
    params,
  }: {
    params: Promise<{ slug: string }>
  }) {

    const t = await getTranslations('Header');

 const data = await getKategoriBreadcrumb('undefined');
 const data2 = await getKategoriYeniUrunler('undefined','undefined');
 

    return (
        <>
    
            <div className="max-w-screen-2xl mx-auto p-4 my-5">

           <div className="flex flex-col space-y-2 mb-5">
            <BreadcrumbProduct data={[]} tip='products' />
            <h1 className="text-3xl font-bold">{t('products')}</h1>
           </div>



            <ProductsCategoryComp data={data} data2={data2} />
            
               
            </div>
        </>
    )
}