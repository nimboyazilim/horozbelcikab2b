import { getNewsDetail } from "@/services/kategoriSevices";
import { API_BASE_URL_RESIM_NEWS } from "@/services/api";
import Image from "next/image";
import BreadcrumbNav2 from "@/components/others/breadcrumbNav2";
import { getTranslations } from "next-intl/server";
export default async function NewsDetail({
    params,
  }: {
    params: Promise<{ slug: string }>
  }) {

    const slug = (await params).slug

    const data = await getNewsDetail(slug);

    const t = await getTranslations('Header');

    return (
<>

<BreadcrumbNav2 data={[{ title: t('news'), href: '/news' },{ title: data.title, href: '' }]} />

        

        <div className="max-w-screen-2xl mx-auto p-4 my-10">
            <div className="flex flex-col gap-4">
                <div className="w-full h-[400px] rounded-lg">
                        <Image src={API_BASE_URL_RESIM_NEWS + data.images} alt={data.title} width={300} height={300} className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <p className="text-gray-600 p-2 font-bold">{new Date(data.create_date).toLocaleDateString('tr-TR')}</p>
                    <div className="text-gray-700 bg-gray-100 rounded-lg p-4" dangerouslySetInnerHTML={{ __html: data.long_article }}></div>
                </div>
            </div>
            </>
    )
}