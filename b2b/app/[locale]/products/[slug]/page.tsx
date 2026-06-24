// app/[locale]/products/[...slug]/page.tsx

import BreadcrumbProduct from "@/components/others/breadcrumbProduct";
import { getKategoriBreadcrumb, getKategoriUrunleri } from "@/services/kategoriSevices";
import ProductsCategoryComp from "@/components/urunler/productsCategoryComp";
import { cookies } from "next/headers";
import { getLocale } from 'next-intl/server';
// Props arayüzü
interface BreadcrumbItem {
  title: string;
  href: string;
}

interface ProductsPageProps {
  kategoriBreadcrumb: BreadcrumbItem[];
}

export default async function ProductsPage({
    params,
    searchParams,
  }: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ f?: string | undefined }>
  }) {

  const slug = (await params).slug

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const resolvedParams = await searchParams;
  const filterParam = resolvedParams.f || 'undefined';

  const data = await getKategoriBreadcrumb(slug);
  const data2 = await getKategoriUrunleri(slug,filterParam,accessToken || 'undefined');
      

  const locale = await getLocale();

  const getCategoryName = (category: any) => {
    switch(locale) {
      case 'ru':
        return category.title_en;
      case 'tr':
        return category.title_tr;
      default:
        return category.title;
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto p-4 my-5">
      <div className="flex flex-col space-y-2 mb-5">
     <BreadcrumbProduct data={data.breadcrumb} tip='products' />
     <h1 className="text-3xl font-bold">{getCategoryName(data.breadcrumb[data.breadcrumb.length - 1])}</h1>
     </div>
     <ProductsCategoryComp data={data} data2={data2} />
    </div>
  );
}
