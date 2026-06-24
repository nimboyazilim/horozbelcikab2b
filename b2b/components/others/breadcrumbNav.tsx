import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
import Link from "next/link"
import { useTranslations } from "next-intl";


export default function BreadcrumbNav({data}: {data: {title: string, href: string}[]}) {
    const t = useTranslations('Header');
    return(
      <div className="absolute top-0 left-0 right-0 bottom-0">
        <div className="max-w-screen-xl h-auto mx-auto pt-32 px-4">
          <h1 className="text-white text-3xl font-bold">{data[0].title}</h1>
          <Breadcrumb>
              <BreadcrumbList className="text-white">
                  <BreadcrumbItem>
                      <BreadcrumbLink asChild className="hover:text-gray-400">
                          <Link href="/">{t('home')}</Link>
                      </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                      <Link href={data[0].href}>{data[0].title}</Link>
                  </BreadcrumbItem>
              </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    )  
}